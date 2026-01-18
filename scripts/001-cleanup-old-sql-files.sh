#!/bin/bash
# Script to remove old SQL files that have been organized into supabase/migrations/
# Run this script only after verifying that all migrations are correctly organized

echo "This will delete all .sql files from the root directory."
echo "The files have been organized into supabase/migrations/"
echo ""
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cd "$(dirname "$0")/.." || exit 1
    echo "Deleting old SQL files..."
    rm -f *.sql

    # Also remove old migrations directory if it exists
    if [ -d "migrations" ]; then
        echo "Removing old migrations directory..."
        rm -rf migrations
    fi

    echo "Cleanup complete!"
    echo "All migrations are now in: supabase/migrations/"
else
    echo "Cleanup cancelled."
fi
