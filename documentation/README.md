# Expense Splitter Documentation

Complete documentation for the Expense Splitter application.

## 📚 Documentation Index

### Getting Started
1. **[Getting Started](./001-getting-started.md)** - Installation and local setup guide
2. **[Database Setup](./002-database-setup.md)** - Database migration notes and schema setup
3. **[Quick Deploy](./003-quick-deploy.md)** - Deploy to Vercel in 5 minutes

### Features & Functionality
4. **[Friends Feature](./004-friends-feature.md)** - Friends management system documentation
5. **[Deployment Guide](./005-deployment-guide.md)** - Comprehensive Vercel deployment guide
6. **[Notification System](./006-notification-system.md)** - In-app notifications setup
7. **[Member Management](./007-member-management.md)** - Group member management and soft delete
8. **[Receipt Upload](./008-receipt-upload.md)** - Receipt storage and upload configuration

### Configuration & Setup
9. **[Resend Setup](./009-resend-setup.md)** - Email service configuration
10. **[Deployment Steps](./010-deployment-steps.md)** - Detailed deployment steps
11. **[Deploy Now](./011-deploy-now.md)** - Quick deployment checklist
12. **[Update App URL](./012-update-app-url.md)** - Updating application URLs
13. **[Migrations & Scripts](./013-migrations-and-scripts.md)** - Database migrations and utility scripts reference

## 🚀 Quick Navigation

### First Time Setup
Start here if you're setting up the project for the first time:
1. [Getting Started](./001-getting-started.md)
2. [Database Setup](./002-database-setup.md)
3. [Resend Setup](./009-resend-setup.md)
4. [Receipt Upload](./008-receipt-upload.md)

### Deployment
Ready to deploy? Follow these guides:
1. [Quick Deploy](./003-quick-deploy.md) - Fast deployment (5 minutes)
2. [Deployment Guide](./005-deployment-guide.md) - Detailed instructions
3. [Update App URL](./012-update-app-url.md) - Post-deployment configuration

### Feature Documentation
Learn about specific features:
- [Friends Feature](./004-friends-feature.md) - Friend management
- [Notification System](./006-notification-system.md) - In-app notifications
- [Member Management](./007-member-management.md) - Group member operations
- [Receipt Upload](./008-receipt-upload.md) - Receipt handling

### Database & Scripts
Database management and utilities:
- [Database Setup](./002-database-setup.md) - Schema and migrations
- [Migrations & Scripts](./013-migrations-and-scripts.md) - Organized migrations and utility scripts

## 🔗 Related Documentation

- **Main README**: [../README.md](../README.md) - Project overview
- **Database Migrations**: [../supabase/migrations/README.md](../supabase/migrations/README.md)
- **Utility Scripts**: [../scripts/README.md](../scripts/README.md)

## 📝 Documentation Structure

```
documentation/
├── README.md                          ← You are here
├── 001-getting-started.md            ← Start here
├── 002-database-setup.md             ← Database configuration
├── 003-quick-deploy.md               ← Fast deployment
├── 004-friends-feature.md            ← Friends system
├── 005-deployment-guide.md           ← Full deployment guide
├── 006-notification-system.md        ← Notifications
├── 007-member-management.md          ← Member operations
├── 008-receipt-upload.md             ← Receipt handling
├── 009-resend-setup.md               ← Email configuration
├── 010-deployment-steps.md           ← Deployment steps
├── 011-deploy-now.md                 ← Deployment checklist
├── 012-update-app-url.md             ← URL configuration
└── 013-migrations-and-scripts.md     ← Database tools
```

## 🎯 Common Tasks

| Task | Documentation |
|------|---------------|
| Install locally | [001-getting-started.md](./001-getting-started.md) |
| Set up database | [002-database-setup.md](./002-database-setup.md) |
| Deploy to Vercel | [003-quick-deploy.md](./003-quick-deploy.md) |
| Configure email | [009-resend-setup.md](./009-resend-setup.md) |
| Add friends feature | [004-friends-feature.md](./004-friends-feature.md) |
| Set up receipts | [008-receipt-upload.md](./008-receipt-upload.md) |
| Run migrations | [013-migrations-and-scripts.md](./013-migrations-and-scripts.md) |

## 💡 Tips

- **New to the project?** Start with [Getting Started](./001-getting-started.md)
- **Ready to deploy?** Check [Quick Deploy](./003-quick-deploy.md)
- **Need help with features?** Browse the Features & Functionality section
- **Database issues?** See [Database Setup](./002-database-setup.md) and [Migrations & Scripts](./013-migrations-and-scripts.md)

## 🔍 Finding Documentation

Use your editor's search functionality or grep:
```bash
# Search all documentation
grep -r "keyword" documentation/

# List all documentation files
ls -1 documentation/
```

## 📖 Contributing to Documentation

When adding new documentation:
1. Create a new file with the next sequential number
2. Use descriptive filename: `NNN-descriptive-name.md`
3. Add entry to this README
4. Keep formatting consistent with existing docs
5. Update cross-references as needed

---

Need help? Check the [main README](../README.md) or open an issue on GitHub.
