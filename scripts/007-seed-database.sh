#!/bin/bash
# Script to seed the database with test data
# Note: Create a seed.sql file in supabase/ directory first

set -e

cd "$(dirname "$0")/.." || exit 1

SEED_FILE="supabase/seed.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo "❌ Seed file not found: $SEED_FILE"
    echo "📝 Create this file with your test data first"
    exit 1
fi

echo "🌱 Seeding database with test data..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Starting Supabase..."
    supabase start
fi

# Apply seed file
supabase db reset --seed-path "$SEED_FILE"

echo "✅ Database seeded successfully!"
