#!/usr/bin/env bash
set -euo pipefail

base_dir="${DUTCHVACANCY_BASE_DIR:-/opt/dutchvacancy-production}"
env_file="$base_dir/.env.production"
current_dir="$base_dir/current"
backup_dir="$base_dir/backups"
retention_days="${BACKUP_RETENTION_DAYS:-14}"

test -f "$env_file"
test -f "$current_dir/compose.production.yml"
install -d -m 700 "$backup_dir"

exec 9>"$base_dir/.backup.lock"
if ! flock -n 9; then
  echo "A production backup is already running."
  exit 0
fi

db_name="$(sed -n 's/^DB_NAME=//p' "$env_file" | tail -n 1)"
db_name="${db_name:-dutchvacancy}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
temporary_backup="$backup_dir/.mongo-${timestamp}.archive.gz.tmp"
final_backup="$backup_dir/mongo-${timestamp}.archive.gz"

cleanup() {
  rm -f "$temporary_backup"
}
trap cleanup EXIT

cd "$current_dir"
sudo docker compose \
  --project-name dutchvacancy-production \
  --env-file "$env_file" \
  -f compose.production.yml \
  exec -T mongo sh -c \
  'mongodump --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db "$1" --archive --gzip' \
  sh "$db_name" > "$temporary_backup"

test -s "$temporary_backup"
gzip -t "$temporary_backup"
chmod 600 "$temporary_backup"
mv "$temporary_backup" "$final_backup"
find "$backup_dir" -type f -name 'mongo-*.archive.gz' -mtime "+$retention_days" -delete

echo "Production database backup created: $(basename "$final_backup")"

