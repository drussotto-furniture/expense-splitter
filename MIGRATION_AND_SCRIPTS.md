# Database Migrations & Scripts

This project now has organized migrations and utility scripts to help manage the database.

## 📁 Directory Structure

```
expense-splitter/
├── scripts/                  # Utility scripts (numbered 001-010)
│   ├── 001-cleanup-old-sql-files.sh
│   ├── 002-reset-local-database.sh
│   ├── 003-create-new-migration.sh
│   ├── 004-apply-migrations.sh
│   ├── 005-pull-remote-schema.sh
│   ├── 006-generate-types.sh
│   ├── 007-seed-database.sh
│   ├── 008-backup-database.sh
│   ├── 009-check-migration-status.sh
│   ├── 010-verify-rls-policies.sh
│   └── README.md
│
└── supabase/
    └── migrations/           # Database migrations (numbered 001-012)
        ├── 001-initial-schema.sql
        ├── 002-setup-storage.sql
        ├── 003-setup-notifications.sql
        ├── 004-add-pending-members.sql
        ├── 005-add-pending-splits.sql
        ├── 006-allow-pending-paid-by.sql
        ├── 007-create-activity-log.sql
        ├── 008-add-shares-split-type.sql
        ├── 009-create-friend-invitations.sql
        ├── 010-unify-invitation-system.sql
        ├── 011-fix-pending-members-complete.sql
        ├── 012-fix-foreign-keys.sql
        └── README.md
```

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Start Supabase locally
supabase start

# 2. Apply all migrations
./scripts/004-apply-migrations.sh

# 3. Generate TypeScript types
./scripts/006-generate-types.sh
```

### After Making Schema Changes
```bash
# 1. Create a new migration
./scripts/003-create-new-migration.sh my-feature-name

# 2. Edit the migration file in supabase/migrations/

# 3. Apply the migration
./scripts/004-apply-migrations.sh

# 4. Regenerate types
./scripts/006-generate-types.sh
```

### Cleaning Up Old Files
```bash
# Remove the old scattered SQL files from root directory
./scripts/001-cleanup-old-sql-files.sh
```

## 📚 Documentation

- **Scripts Documentation**: [scripts/README.md](scripts/README.md)
- **Migrations Documentation**: [supabase/migrations/README.md](supabase/migrations/README.md)

## 🔧 Common Commands

| Task | Command |
|------|---------|
| Apply migrations | `./scripts/004-apply-migrations.sh` |
| Create new migration | `./scripts/003-create-new-migration.sh <name>` |
| Generate TypeScript types | `./scripts/006-generate-types.sh` |
| Check migration status | `./scripts/009-check-migration-status.sh` |
| Verify RLS policies | `./scripts/010-verify-rls-policies.sh` |
| Reset database (⚠️ destructive) | `./scripts/002-reset-local-database.sh` |
| Backup database | `./scripts/008-backup-database.sh` |

## 📝 Notes

- All scripts are numbered for easy reference
- All migrations are numbered in chronological order
- Scripts automatically change to project root before running
- Destructive operations require confirmation
- All user-facing tables have RLS enabled

## 🔗 Related Files

- Database types: `lib/supabase/database.types.ts` (generated)
- Supabase config: `supabase/config.toml`
- Backup directory: `backups/` (create if needed)
