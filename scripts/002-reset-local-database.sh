#!/bin/bash
# Script to reset the local Supabase database
# WARNING: This will delete all data in your local database!

set -e

cd "$(dirname "$0")/.." || exit 1

echo "⚠️  WARNING: This will reset your local Supabase database and delete ALL data!"
echo ""
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Reset cancelled."
    exit 0
fi

echo "🔄 Resetting local database..."

# Stop Supabase
echo "📥 Stopping Supabase..."
supabase stop --no-backup

# Start fresh
echo "🚀 Starting Supabase with fresh database..."
supabase start

echo "✅ Database reset complete!"
echo "📝 All migrations have been applied automatically."
