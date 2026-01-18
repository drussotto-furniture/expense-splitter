#!/bin/bash
# Script to create a new migration file with the next available number

set -e

cd "$(dirname "$0")/.." || exit 1

if [ -z "$1" ]; then
    echo "Usage: $0 <migration-name>"
    echo "Example: $0 add-user-preferences"
    exit 1
fi

MIGRATION_NAME="$1"
MIGRATIONS_DIR="supabase/migrations"

# Find the highest migration number
HIGHEST_NUM=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sed 's/.*\/\([0-9]*\)-.*/\1/' | sort -n | tail -1)

if [ -z "$HIGHEST_NUM" ]; then
    NEXT_NUM="001"
else
    NEXT_NUM=$(printf "%03d" $((10#$HIGHEST_NUM + 1)))
fi

MIGRATION_FILE="${MIGRATIONS_DIR}/${NEXT_NUM}-${MIGRATION_NAME}.sql"

# Create the migration file with a template
cat > "$MIGRATION_FILE" << EOF
-- Migration: ${MIGRATION_NAME}
-- Created: $(date +%Y-%m-%d)

-- Add your SQL migration here

EOF

echo "✅ Created new migration: $MIGRATION_FILE"
echo "📝 Edit this file and add your SQL changes"
