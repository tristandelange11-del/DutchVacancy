#!/usr/bin/env bash
set -euo pipefail

release_sha="${1:-}"
base_dir="${DUTCHVACANCY_BASE_DIR:-/opt/dutchvacancy-production}"
env_file="$base_dir/.env.production"
current_link="$base_dir/current"

if [[ ! "$release_sha" =~ ^[0-9a-f]{7,40}$ ]]; then
  echo "Provide a valid release commit SHA."
  exit 2
fi

release_dir="$(find "$base_dir/releases" -mindepth 1 -maxdepth 1 -type d -name "${release_sha}*" -print -quit)"
if [ -z "$release_dir" ] || [ ! -f "$release_dir/compose.production.yml" ]; then
  echo "Release not found: $release_sha"
  exit 3
fi

previous_release="$(readlink -f "$current_link" 2>/dev/null || true)"
"$current_link/scripts/backup-production.sh"
ln -sfn "$release_dir" "$current_link"

cd "$current_link"
if ! sudo docker compose \
  --project-name dutchvacancy-production \
  --env-file "$env_file" \
  -f compose.production.yml \
  up -d --build; then
  if [ -n "$previous_release" ]; then
    ln -sfn "$previous_release" "$current_link"
  fi
  exit 1
fi

for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:8180/healthz >/dev/null \
    && curl --fail --silent http://127.0.0.1:8180/api/status >/dev/null; then
    basename "$release_dir" > "$base_dir/.deployed-commit"
    echo "Production rolled back to $(basename "$release_dir")."
    exit 0
  fi
  sleep 5
done

if [ -n "$previous_release" ]; then
  ln -sfn "$previous_release" "$current_link"
  cd "$current_link"
  sudo docker compose \
    --project-name dutchvacancy-production \
    --env-file "$env_file" \
    -f compose.production.yml \
    up -d --build
fi
echo "Rollback health check failed; the previous release was restored."
exit 1

