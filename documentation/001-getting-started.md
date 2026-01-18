# Getting Started

A quick guide to get the Expense Splitter app running locally.

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for email invitations)

## Installation

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

See [Database Setup](./002-database-setup.md) for complete instructions on setting up your Supabase database.

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Next Steps

- [Database Setup](./002-database-setup.md) - Set up your Supabase database
- [Quick Deploy](./003-quick-deploy.md) - Deploy to Vercel in 5 minutes
- [Features Guide](./004-features-guide.md) - Learn about all features
- [Deployment Guide](./005-deployment-guide.md) - Detailed deployment instructions

## Quick Test

After setup:
1. Sign up for an account
2. Create a group
3. Add an expense
4. Invite a friend
