// scripts/fill_place_ids.js
require("dotenv").config();              // reads .env or .env.local
const { Pool } = require("pg");
const fetch    = global.fetch;           // Node-20 native

/* ─────────────────────────  CONFIG  ───────────────────────── */
const GOOGLE_KEY  = process.env.GOOGLE_MAPS_KEY;
if (!GOOGLE_KEY) throw new Error("GOOGLE_MAPS_KEY missing");

const DB_URL = process.env.DATABASE_URL ||
  "postgres://postgres:PA$$word@localhost:5432/branchday";

const BATCH = 20;      // rows per cycle   (lower => safer for quota)
const DELAY = 250;     // ms between Google calls (~4 req/s)
const pool  = new Pool({ connectionString: DB_URL });

const FIND_URL   = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
const DETAIL_URL = "https://maps.googleapis.com/maps/api/place/details/json";

/* ───────────────────────  helpers  ────────────────────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function googleFindPlace(text) {
  const url = new URL(FIND_URL);
  url.searchParams.set("input", text);
  url.searchParams.set("inputtype", "textquery");
  url.searchParams.set("fields", "place_id");
  url.searchParams.set("key", GOOGLE_KEY);
  const j = await fetch(url).then((r) => r.json());
  return j.status === "OK" ? j.candidates[0]?.place_id : null;
}

async function googleDetails(placeId) {
  const url = new URL(DETAIL_URL);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "place_id,name,formatted_address,geometry,opening_hours");
  url.searchParams.set("key", GOOGLE_KEY);
  const j = await fetch(url).then((r) => r.json());
  return j.status === "OK" ? j.result : null;
}

/* ───────────────────────  main loop  ──────────────────────── */
(async function run() {
  for (;;) {
    const { rows } = await pool.query(
      `SELECT uninum,name,address,city,stalp,zip
         FROM locations_raw
        WHERE place_id IS NULL
          AND (
               name ILIKE '%PNC%'
            OR name ILIKE '%CHASE%')
        LIMIT $1`,
      [BATCH]
    );
    if (rows.length === 0) break;

    for (const b of rows) {
      const queryText = `${b.name} ${b.address}, ${b.city} ${b.stalp} ${b.zip}`;

      const placeId = await googleFindPlace(queryText);
      if (!placeId) {
        console.warn(`UNINUM ${b.uninum} – no Place ID`);
        await sleep(DELAY);
        continue;
      }

      const details = await googleDetails(placeId);
      if (!details) {
        console.warn(`UNINUM ${b.uninum} – details not found`);
        await sleep(DELAY);
        continue;
      }

      /* update locations_raw */
      await pool.query(
        `UPDATE locations_raw
            SET place_id      = $1,
                opening_hours = $2
          WHERE uninum = $3`,
        [placeId, details.opening_hours ?? null, b.uninum]
      );

      /* upsert into places_cache (keeps 30-day cache in sync) */
      await pool.query(
        `INSERT INTO places_cache
               (place_id,name,address,latitude,longitude,opening_hours,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,now())
         ON CONFLICT (place_id)
         DO UPDATE SET
            name=$2,address=$3,latitude=$4,longitude=$5,
            opening_hours=$6,updated_at=now()`,
        [
          placeId,
          details.name,
          details.formatted_address,
          details.geometry?.location?.lat,
          details.geometry?.location?.lng,
          details.opening_hours ?? null,
        ]
      );

      console.log(`UNINUM ${b.uninum} → ${placeId}`);
      await sleep(DELAY);
    }
  }

  console.log("♦ Finished: no more unmatched PNC/Chase rows.");
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});