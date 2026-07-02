#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/sobrapsi}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TARGET_DIR="$BACKUP_DIR/$TIMESTAMP"

mkdir -p "$TARGET_DIR"

POSTGRES_USER="${POSTGRES_USER:-sobrapsi}"
POSTGRES_DB="${POSTGRES_DB:-sobrapsi}"
CONTAINER="${POSTGRES_CONTAINER:-sobrapsi-db}"

echo "==> Backup PostgreSQL..."
docker exec -t "$CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$TARGET_DIR/database.sql.gz"

if [[ -d uploads ]]; then
  echo "==> Backup uploads..."
  tar -czf "$TARGET_DIR/uploads.tar.gz" uploads
fi

echo "==> Backup salvo em $TARGET_DIR"

# Mantém os 14 backups mais recentes
ls -1dt "$BACKUP_DIR"/*/ 2>/dev/null | tail -n +15 | xargs -r rm -rf
