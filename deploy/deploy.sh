#!/bin/bash
set -euo pipefail
umask 027
base=/srv/uwrkonstanz
release="${1:?release SHA required}"
[[ "$release" =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid release SHA'; exit 1; }
exec 9>"$base/deploy.lock"
flock -n 9 || { echo 'Deployment already running'; exit 1; }
target="$base/releases/${release}-$(date +%s)"
mkdir -p "$target"
tar -xzf "$base/incoming/uwrkonstanz.tgz" -C "$target" --no-same-owner
test -f "$target/server.js"
test -d "$target/.next/static"
ln -s "$base/shared/media" "$target/media"
ln -s "$base/shared/data" "$target/data"

# SQLite's backup API includes committed WAL contents without stopping readers.
if [[ -f "$base/shared/data/uwr.db" ]]; then
  python3 - "$base/shared/data/uwr.db" "$base/backups/$(date -u +%Y%m%dT%H%M%SZ)-$release.db" <<'PY'
import sqlite3, sys
with sqlite3.connect(sys.argv[1]) as source, sqlite3.connect(sys.argv[2]) as backup:
    source.backup(backup)
PY
fi
previous=$(readlink -f "$base/current" || true)
ln -s "$target" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
sudo /bin/systemctl restart uwrkonstanz.service
if grep -q '^HOSTNAME=127.0.0.1$' "$base/shared/app.env"; then
  # The first boot stays private until the owner registers an administrator.
  ready=false
  for attempt in {1..30}; do
    if curl --fail --silent --max-time 5 http://127.0.0.1:3000/api/users/init > "$base/incoming/users-init.json"; then
      ready=true
      break
    fi
    sleep 2
  done
  [[ "$ready" == true ]] || { echo 'CMS bootstrap failed to start'; exit 1; }
  if python3 -c 'import json,sys; sys.exit(0 if json.load(open(sys.argv[1])).get("initialized") else 1)' "$base/incoming/users-init.json"; then
    sed -i 's/^HOSTNAME=127.0.0.1$/HOSTNAME=0.0.0.0/' "$base/shared/app.env"
    sudo /bin/systemctl restart uwrkonstanz.service
  else
    echo 'First administrator required: use an SSH tunnel to /admin, then deploy again to publish.'
  fi
  rm -f "$base/incoming/users-init.json"
fi
healthy=false
for attempt in {1..30}; do
  if curl --fail --silent --max-time 5 http://127.0.0.1:3000/ >/dev/null && \
     curl --fail --silent --max-time 5 http://127.0.0.1:3000/admin >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  echo 'Release health check failed.'
  if [[ -n "$previous" && -d "$previous" ]]; then
    ln -s "$previous" "$base/current.next"
    mv -Tf "$base/current.next" "$base/current"
    sudo /bin/systemctl restart uwrkonstanz.service
    echo 'Previous application release restored. Database backup retained for manual recovery.'
  fi
  exit 1
fi
echo "Deployment successful: $release"

# Keep the active/previous release, three newest releases, and seven DB backups.
mapfile -t releases < <(find "$base/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | cut -d' ' -f2-)
for old in "${releases[@]:3}"; do
  [[ "$old" == "$target" || "$old" == "$previous" ]] && continue
  [[ "$old" == "$base/releases/"* && -d "$old" ]] && rm -rf -- "$old"
done
mapfile -t backups < <(find "$base/backups" -maxdepth 1 -type f -name '*.db' -printf '%T@ %p\n' | sort -nr | cut -d' ' -f2-)
for old in "${backups[@]:7}"; do
  [[ "$old" == "$base/backups/"* ]] && rm -f -- "$old"
done
