#!/bin/bash
# Script to apply all pending migrations to the local database

set -e

cd "$(dirname "$0")/.." || exit 1

echo "🔄 Applying database migrations..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Starting Supabase..."
    supabase start
fi

echo "📤 Pushing migrations to database..."
supabase db push

echo "✅ Migrations applied successfully!"
