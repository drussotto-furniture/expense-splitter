#!/bin/bash
# Script to generate TypeScript types from Supabase schema

set -e

cd "$(dirname "$0")/.." || exit 1

echo "🔄 Generating TypeScript types from Supabase schema..."

# Check if Supabase is running
if ! supabase status &>/dev/null; then
    echo "❌ Supabase is not running. Starting Supabase..."
    supabase start
fi

# Generate types
supabase gen types typescript --local > lib/supabase/database.types.ts

echo "✅ Types generated successfully!"
echo "📝 Types saved to: lib/supabase/database.types.ts"
