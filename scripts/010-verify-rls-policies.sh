#!/bin/bash
# Script to verify RLS policies are enabled on all tables

set -e

cd "$(dirname "$0")/.." || exit 1

echo "🔒 Verifying RLS policies..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Starting Supabase..."
    supabase start
fi

# Query to check RLS status
SQL_QUERY="
SELECT
    schemaname,
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo ""
echo "📋 RLS Status for Public Tables:"
echo "================================"
supabase db exec "$SQL_QUERY"

echo ""
echo "💡 Tip: All user-facing tables should have RLS enabled"
