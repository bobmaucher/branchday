// scripts/fill_latlon.js  (works on Node 20+)
const { Pool } = require("pg");

// adjust if you keep POSTGRES_URL in .env
const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL ||
    "postgres://postgres:PA$$word@localhost:5432/branchday",
});

const BASE =
  "https://banks.data.fdic.gov/api/locations?format=json" +
  "&fields=LATITUDE,LONGITUDE,UNINUM&limit=1&filters=UNINUM:";

async function fetchJson(url, tries = 2) {
for (let attempt = 1; attempt <= tries; attempt++) {
    const res   = await fetch(url);
    const text  = await res.text();        // read raw text
    if (text) return JSON.parse(text);     // success
    if (attempt === tries) throw new Error("empty body");
    // wait 300 ms then retry once
    await new Promise(r => setTimeout(r, 300));
}
}


const MAX_PARALLEL = 5;

(async function run() {
  const { rows } = await pool.query(
    "SELECT uninum FROM locations_raw WHERE latitude IS NULL OR longitude IS NULL"
  );
  console.log(`Need coordinates for ${rows.length} branches…`);

  for (let i = 0; i < rows.length; i += MAX_PARALLEL) {
    const slice = rows.slice(i, i + MAX_PARALLEL);
    await Promise.all(
      slice.map(async ({ uninum }) => {
        try {
          const json = await fetchJson(BASE + uninum);
          const rec = json?.data?.[0]?.data;
          if (rec?.LATITUDE && rec?.LONGITUDE) {
            await pool.query(
              "UPDATE locations_raw SET latitude=$1, longitude=$2 WHERE uninum=$3",
              [rec.LATITUDE, rec.LONGITUDE, uninum]
            );
            process.stdout.write(".");
          } else {
            process.stdout.write("x");
          }
        } catch (e) {
            console.warn(`UNINUM ${uninum}: ${e.message}`);
        }
      })
    );
  }

  console.log("\nDone.");
  await pool.end();
})();
