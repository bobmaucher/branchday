import { NextRequest, NextResponse } from "next/server";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL || "postgres://postgres:PA%24%24word@localhost:5432/branchday",
});

// how “fresh” a cached row must be
const MAX_AGE_DAYS = 30;
const GOOGLE_KEY   = process.env.GOOGLE_MAPS_KEY!;

export async function GET(req: NextRequest) {
  const placeId = new URL(req.url).searchParams.get("place_id");
  if (!placeId) return NextResponse.json({ error: "place_id required" }, { status: 400 });

  /* 1️⃣  look in cache */
  const { rows } = await pool.query(
    `SELECT *, (now() - updated_at) < ($1 || ' days')::interval AS fresh
       FROM places_cache
      WHERE place_id = $2`,
    [MAX_AGE_DAYS, placeId]
  );

  if (rows[0]?.fresh) {
     return NextResponse.json({ result: rowToGoogle(rows[0]) });
  }

  /* 2️⃣  fetch from Google */
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", GOOGLE_KEY);
  url.searchParams.set("fields", "place_id,name,formatted_address,geometry,opening_hours");

  const gRes  = await fetch(url.toString());
  const json  = await gRes.json();
  if (req.nextUrl.searchParams.get("debug") === "1") {
    return NextResponse.json(json);   // show raw Google response
  }
  const r = json?.result;
  if (!r) return NextResponse.json({ error: "Google lookup failed" }, { status: 502 });

  /* 3️⃣  upsert into cache */
  await pool.query(
    `INSERT INTO places_cache (place_id,name,address,latitude,longitude,opening_hours,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,now())
     ON CONFLICT (place_id)
     DO UPDATE SET
        name=$2,address=$3,latitude=$4,longitude=$5,opening_hours=$6,updated_at=now()`,
    [
      r.place_id,
      r.name,
      r.formatted_address,
      r.geometry?.location?.lat,
      r.geometry?.location?.lng,
      r.opening_hours ?? null,
    ]
  );

  return NextResponse.json({ result: r });
}

/* helper: convert DB row back to Google-like shape */
function rowToGoogle(row: any) {
  return {
    place_id: row.place_id,
    name:     row.name,
    formatted_address: row.address,
    geometry: {
      location: { lat: row.latitude, lng: row.longitude },
    },
    opening_hours: row.opening_hours,
  };
}