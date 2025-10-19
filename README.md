# MoodSpace - Student Wellbeing Analytics Platform

A Next.js application that helps teachers track student wellbeing through anonymous mood submissions.

## Features

- **Teacher Accounts**: Create an account and get a unique teacher code
- **Anonymous Student Access**: Students use teacher codes to submit moods anonymously
- **Real-time Analytics**: View mood distributions, engagement metrics, and recent feedback
- **Secure Database**: Built with Supabase and Row Level Security (RLS)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project (connected via v0 integrations)

### Database Setup


### Environment Variables

The following environment variables are automatically configured via the Supabase integration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

### Running Locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

### For Teachers

1. **Sign Up**: Create an account with email and password
2. **Get Your Code**: Receive a unique 6-character teacher code
3. **Share Code**: Give this code to your students
4. **View Analytics**: See mood distributions and feedback in your dashboard

### For Students

1. **Enter Code**: Use your teacher's code to access the platform
2. **Submit Mood**: Choose how you're feeling (anonymous)
3. **Add Message**: Optionally share more details
4. **Stay Anonymous**: No account needed, complete privacy

## Database Schema

### `teachers`
- Stores teacher accounts and their unique codes
- Links to Supabase Auth users

### `students`
- Anonymous student records linked to teachers
- No personal information stored

### `feedback`
- Mood submissions from students
- Includes mood type, optional message, and timestamps
- Protected by RLS - teachers only see their students' feedback

## Security

- **Row Level Security (RLS)**: All tables protected with RLS policies
- **Anonymous Students**: No personal data collected from students
- **Teacher Verification**: Only authenticated teachers can view their students' data
- **Secure Authentication**: Powered by Supabase Auth

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Deployment**: Vercel

