#!/bin/bash
# Script to create a backup of the local database

set -e

cd "$(dirname "$0")/.." || exit 1

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "💾 Creating database backup..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Please start Supabase first."
    exit 1
fi

# Create backup using pg_dump
supabase db dump -f "$BACKUP_FILE"

echo "✅ Backup created successfully!"
echo "📁 Backup saved to: $BACKUP_FILE"
echo ""
echo "To restore this backup, run:"
echo "  psql -h localhost -p 54322 -U postgres -d postgres < $BACKUP_FILE"
