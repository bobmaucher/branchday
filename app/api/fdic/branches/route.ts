import { NextRequest, NextResponse } from "next/server";

// FDIC certificate for PNC Bank, N.A.
const PNC_CERT = 6384;

export async function GET(req: NextRequest) {
  const q = (new URL(req.url)).searchParams.get("q")?.trim().toUpperCase() ?? "";

  if (q.length < 3) return NextResponse.json({ data: [] });

  const fdic = new URL("https://banks.data.fdic.gov/api/locations");
  fdic.searchParams.set("format", "json");
  fdic.searchParams.set("limit",  "50");
  fdic.searchParams.set(
    "fields",
    "NAME,CERT,BKCLASS,UNINUM,ADDRESS,CITY,STALP,ZIP,LATITUDE,LONGITUDE,ACTIVE"
  );
  fdic.searchParams.set("filters", `CITY:"${q}"*`);

  const res = await fetch(fdic.toString());
  if (!res.ok) return NextResponse.json({ data: [] }, { status: 502 });

  return NextResponse.json(await res.json());
}