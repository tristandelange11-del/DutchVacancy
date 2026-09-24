#!/usr/bin/env bash
# Read-only production comparison; restore only into a disposable, offline container.
set -euo pipefail
umask 077
base="${DUTCHVACANCY_BASE_DIR:-/opt/dutchvacancy-production}"
archive="${1:?Pass the absolute backup archive path}"
test -s "$archive"
gzip -t "$archive"
db_name="$(sed -n 's/^DB_NAME=//p' "$base/.env.production" | tail -n 1)"
[[ "$db_name" =~ ^[A-Za-z0-9_-]+$ ]]
target="dv-restore-check-$(openssl rand -hex 8)"
work="$(mktemp -d)"
cleanup() { sudo docker rm -f "$target" >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT
sudo docker run -d --name "$target" --network none --memory 384m \
  --tmpfs /data/db:rw,size=256m --tmpfs /data/configdb:rw,size=16m \
  mongo:8.0 --bind_ip 127.0.0.1 --setParameter ttlMonitorEnabled=false >/dev/null
ready=false
for attempt in $(seq 1 30); do
  if sudo docker exec "$target" mongosh --quiet --eval 'quit(db.adminCommand({ping:1}).ok ? 0 : 1)' >/dev/null 2>&1; then ready=true; break; fi
  sleep 2
done
test "$ready" = true
sudo docker exec -i "$target" mongorestore --quiet --archive --gzip --stopOnError < "$archive"
# Compare collection names, document counts and complete index definitions.
# Run only against the quiet private candidate, not a changing public database.
summary='const d=db.getSiblingDB(process.env.CHECK_DB); print(JSON.stringify(d.getCollectionNames().sort().map(n=>({name:n,count:d.getCollection(n).countDocuments({}),indexes:d.getCollection(n).getIndexes().sort((a,b)=>a.name.localeCompare(b.name))}))))'
sudo docker compose --project-name dutchvacancy-production --env-file "$base/.env.production" \
  -f "$base/current/compose.production.yml" exec -T -e CHECK_DB="$db_name" mongo \
  sh -c 'mongosh --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "$1"' sh "$summary" > "$work/source.json"
sudo docker exec -e CHECK_DB="$db_name" "$target" mongosh --quiet --eval "$summary" > "$work/restored.json"
cmp "$work/source.json" "$work/restored.json"
echo 'Production archive restored into an isolated container; collections, counts and indexes match.'
# Nonempty roundtrip validates document contents even when production is still empty.
sudo docker exec "$target" mongosh --quiet --eval 'const d=db.getSiblingDB("restore_fixture"); d.items.insertMany([{_id:1,text:"Dutch Vacancy",nested:{active:true},tags:["test"],bytes:BinData(0,"AQID")},{_id:2,text:"Hersteltest",value:42}]); d.items.createIndex({text:1},{unique:true});' >/dev/null
sudo docker exec "$target" mongodump --quiet --db restore_fixture --archive --gzip > "$work/fixture.gz"
sudo docker exec -i "$target" mongorestore --quiet --archive --gzip --nsFrom='restore_fixture.*' --nsTo='restore_verified.*' --stopOnError < "$work/fixture.gz"
sudo docker exec "$target" mongosh --quiet --eval 'const a=db.getSiblingDB("restore_fixture"), b=db.getSiblingDB("restore_verified"); if(EJSON.stringify(a.items.find().sort({_id:1}).toArray())!==EJSON.stringify(b.items.find().sort({_id:1}).toArray())) throw Error("Document mismatch"); if(!b.items.getIndexes().some(i=>i.name==="text_1"&&i.unique)) throw Error("Missing unique index");' >/dev/null
echo 'Nonempty fixture roundtrip passed, including nested fields, binary data and a unique index.'
