# Expense Splitter

A modern, full-stack expense splitting application built with Next.js 16, Supabase, and TypeScript. Split expenses with friends, track group spending, and settle up easily.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)

## Features

### Core Functionality
- 👥 **Group Management** - Create and manage expense groups for trips, roommates, or events
- 💰 **Expense Tracking** - Add expenses with multiple split types (equal, personal, custom)
- 📧 **Email Invitations** - Invite members via email with secure invitation system
- 💳 **Balance Calculations** - Automatic calculation of who owes what
- 🔄 **Settlement Suggestions** - Smart suggestions to minimize payment transfers
- 📸 **Receipt Uploads** - Attach receipt photos to expenses
- 🗑️ **Soft Delete** - Remove members while preserving expense history

### Split Types
- **Equal Split** - Divide expense evenly among selected members
- **Personal** - Expense for a single person
- **Custom** - Specify exact amounts for each member

### User Management
- ✅ Secure authentication with Supabase Auth
- 👤 User profiles with names and avatars
- 🔒 Row-level security for data protection
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js 16.1 (App Router), React 19.2, TypeScript
- **Styling**: Tailwind CSS 4.x
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Email**: Resend API
- **Hosting**: Vercel (recommended)
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for email invitations)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/expense-splitter.git
cd expense-splitter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend API Key
RESEND_API_KEY=your_resend_api_key
```

4. Set up the database:

Run the SQL migrations in your Supabase SQL Editor:
- See [documentation/002-database-setup.md](documentation/002-database-setup.md) for complete schema
- Or use the organized migrations in `supabase/migrations/`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Core Tables
- `profiles` - User information
- `groups` - Expense groups
- `group_members` - Group membership with soft delete support
- `expenses` - Individual expenses
- `expense_splits` - How expenses are split
- `invitations` - Pending group invitations
- `settlements` - Payment records
- `categories` - Expense categories

### Key Features
- Row-level security (RLS) policies
- Soft delete for members (`is_active` field)
- Foreign key relationships with cascading
- Timestamp tracking for all records

## Project Structure

```
expense-splitter/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── groups/              # Group management
│   │   ├── [id]/           # Group detail page
│   │   └── page.tsx        # Groups list
│   ├── invitations/        # Invitation management
│   └── api/                # API routes
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── expenses/          # Expense management
│   ├── groups/            # Group components
│   ├── invitations/       # Invitation components
│   └── settlements/       # Balance & settlement components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client setup
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Documentation

Complete documentation is available in the [documentation/](documentation/) directory:

- **[Getting Started](documentation/001-getting-started.md)** - Installation and setup
- **[Database Setup](documentation/002-database-setup.md)** - Database configuration
- **[Quick Deploy](documentation/003-quick-deploy.md)** - Deploy in 5 minutes
- **[Deployment Guide](documentation/005-deployment-guide.md)** - Detailed deployment instructions
- **[All Documentation](documentation/README.md)** - Complete documentation index

## Deployment

See [documentation/003-quick-deploy.md](documentation/003-quick-deploy.md) for a 5-minute deployment guide, or [documentation/005-deployment-guide.md](documentation/005-deployment-guide.md) for detailed instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/expense-splitter)

## Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the database migrations
3. Configure authentication redirect URLs
4. Set up storage bucket for receipts
5. Enable email authentication

### Resend Setup

1. Create a Resend account
2. Generate an API key
3. (Optional) Add a custom domain for production emails

## Features in Detail

### Expense Management
- Create expenses with description, amount, date, category
- Upload receipt photos
- Split between selected members
- Edit and delete your own expenses
- View complete expense history

### Group Management
- Create groups with base currency
- Invite members via email
- Assign admin/member roles
- Remove members (soft delete preserves history)
- Delete entire groups (cascade delete all data)

### Balance & Settlements
- Real-time balance calculations
- Optimized settlement suggestions (minimize transfers)
- View who owes whom
- Track payment history

### Security
- Row-level security on all tables
- Secure authentication with Supabase
- Email verification for invitations
- API route protection

## Color Scheme

The app uses a sophisticated dark blue, grey, black, and white palette:
- Primary: Dark slate (`bg-slate-800`, `hover:bg-slate-900`)
- Secondary: Grey tones
- Accents: Subtle slate highlights
- Text: High contrast black/white for readability

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
- Open an issue on GitHub
- Check the deployment guide for troubleshooting

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and auth by [Supabase](https://supabase.com/)
- Email delivery by [Resend](https://resend.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ using modern web technologies
