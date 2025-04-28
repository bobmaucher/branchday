#!/usr/bin/env bash
set -e

echo "[update_branches] $(date)"

# 1. Download the latest locations.csv
mkdir -p "$(dirname "$0")/../data"
curl -sSL \
  -o "$(dirname "$0")/../data/locations.csv" \
  "https://s3-us-gov-west-1.amazonaws.com/cg-2e5c99a6-e282-42bf-9844-35f5430338a5/downloads/locations.csv"

# 2. Truncate staging + raw tables
"/c/Program Files/PostgreSQL/17/bin/psql.exe" -h localhost -U postgres -d branchday -c "
TRUNCATE TABLE locations_stage;
TRUNCATE TABLE locations_raw;
"

# 3. Copy into locations_stage
"/c/Program Files/PostgreSQL/17/bin/psql.exe" -h localhost -U postgres -d branchday -c "\copy locations_stage FROM '$(dirname "$0")/../data/locations.csv' WITH (FORMAT csv, HEADER true)"

# 4. Insert six columns we have (others NULL)
"/c/Program Files/PostgreSQL/17/bin/psql.exe" -h localhost -U postgres -d branchday -c "
INSERT INTO locations_raw (uninum,name,address,city,stalp,zip)
SELECT c29::int, c21, c1, c13, c26, c30 FROM locations_stage;
"

# 5. Run the lat/lon back-fill
node $(dirname "$0")/fill_latlon.js