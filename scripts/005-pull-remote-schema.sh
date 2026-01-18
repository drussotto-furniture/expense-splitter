#!/bin/bash
# Script to pull the current schema from remote Supabase project
# This creates a migration file based on the remote database state

set -e

cd "$(dirname "$0")/.." || exit 1

echo "📥 Pulling schema from remote Supabase project..."
echo "⚠️  This will create a new migration file with the remote schema"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Pull cancelled."
    exit 0
fi

supabase db pull

echo "✅ Schema pulled successfully!"
echo "📝 Check supabase/migrations/ for the new migration file"
