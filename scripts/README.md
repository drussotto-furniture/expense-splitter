# Scripts Directory

This directory contains utility scripts for managing the Expense Splitter application. All scripts should be run from the project root directory.

## Available Scripts

### Database Management

1. **[001-cleanup-old-sql-files.sh](001-cleanup-old-sql-files.sh)** - Remove old SQL files from root after migration organization
   ```bash
   ./scripts/001-cleanup-old-sql-files.sh
   ```

2. **[002-reset-local-database.sh](002-reset-local-database.sh)** - Reset local Supabase database (⚠️ deletes all data)
   ```bash
   ./scripts/002-reset-local-database.sh
   ```

3. **[003-create-new-migration.sh](003-create-new-migration.sh)** - Create a new migration file with auto-incrementing number
   ```bash
   ./scripts/003-create-new-migration.sh <migration-name>
   # Example: ./scripts/003-create-new-migration.sh add-user-preferences
   ```

4. **[004-apply-migrations.sh](004-apply-migrations.sh)** - Apply all pending migrations to local database
   ```bash
   ./scripts/004-apply-migrations.sh
   ```

5. **[005-pull-remote-schema.sh](005-pull-remote-schema.sh)** - Pull schema from remote Supabase project
   ```bash
   ./scripts/005-pull-remote-schema.sh
   ```

### Development Tools

6. **[006-generate-types.sh](006-generate-types.sh)** - Generate TypeScript types from database schema
   ```bash
   ./scripts/006-generate-types.sh
   ```

7. **[007-seed-database.sh](007-seed-database.sh)** - Seed database with test data (requires supabase/seed.sql)
   ```bash
   ./scripts/007-seed-database.sh
   ```

### Maintenance & Verification

8. **[008-backup-database.sh](008-backup-database.sh)** - Create a backup of the local database
   ```bash
   ./scripts/008-backup-database.sh
   ```

9. **[009-check-migration-status.sh](009-check-migration-status.sh)** - Check migration status and show history
   ```bash
   ./scripts/009-check-migration-status.sh
   ```

10. **[010-verify-rls-policies.sh](010-verify-rls-policies.sh)** - Verify RLS policies are enabled on all tables
    ```bash
    ./scripts/010-verify-rls-policies.sh
    ```

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Docker installed and running (for local Supabase)
- Bash shell (macOS/Linux or Git Bash on Windows)

## Making Scripts Executable

If you get permission errors, make the scripts executable:

```bash
chmod +x scripts/*.sh
```

## Common Workflows

### Starting Fresh
```bash
./scripts/002-reset-local-database.sh
./scripts/006-generate-types.sh
```

### After Schema Changes
```bash
./scripts/004-apply-migrations.sh
./scripts/006-generate-types.sh
```

### Creating New Migration
```bash
./scripts/003-create-new-migration.sh my-new-feature
# Edit the created file in supabase/migrations/
./scripts/004-apply-migrations.sh
```

### Verifying Database State
```bash
./scripts/009-check-migration-status.sh
./scripts/010-verify-rls-policies.sh
```

## Notes

- All scripts automatically change to the project root directory
- Most scripts check if Supabase is running and start it if needed
- Destructive operations (reset, cleanup) require confirmation
- Backups are stored in the `backups/` directory (create it first)
