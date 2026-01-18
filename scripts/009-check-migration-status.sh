#!/bin/bash
# Script to check migration status and show pending migrations

set -e

cd "$(dirname "$0")/.." || exit 1

echo "🔍 Checking migration status..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Starting Supabase..."
    supabase start
fi

echo ""
echo "📊 Migration History:"
supabase migration list

echo ""
echo "📁 Local Migration Files:"
ls -1 supabase/migrations/*.sql 2>/dev/null | nl -w2 -s'. ' || echo "No migration files found"
