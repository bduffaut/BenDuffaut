#!/usr/bin/env bash
# Pulls the latest site image and restarts the container only if it changed.
# Run by benduffaut-update.timer every 2 minutes, see docs/deployment.md.
set -euo pipefail

cd "$(dirname "$0")/.."

before=$(docker compose images -q site 2>/dev/null || true)
docker compose pull --quiet site
docker compose up -d --no-deps site
after=$(docker compose images -q site 2>/dev/null || true)

if [[ "$before" != "$after" ]]; then
  echo "benduffaut: deployed $(docker compose images site --format '{{.Tag}} {{.ID}}' 2>/dev/null | head -n1)"
  docker image prune -f --filter "label=org.opencontainers.image.title=benduffaut.com" > /dev/null
fi
