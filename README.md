# Social Media Automation Platform

An AI-powered social media management platform built with Next.js 15, TypeScript, and Supabase.

## Features

- **Authentication System**: Email/password authentication with NextAuth.js
- **Social Media Integration**: Connect X, Instagram, LinkedIn, and Facebook accounts via OAuth
- **User Dashboard**: Comprehensive dashboard with navigation and user management
- **Database Schema**: Complete database schema with relationships and constraints
- **Protected Routes**: Middleware-based route protection for authenticated areas
- **Responsive UI**: Built with TailwindCSS and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod
- **Forms**: React Hook Form

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── database.ts        # Database service layer
│   ├── oauth.ts           # OAuth service
│   └── supabase.ts        # Supabase client
└── types/                 # TypeScript type definitions
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.local` and update with your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Social Media API Keys
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# AWS S3 Configuration (for future media uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. Update your environment variables with the Supabase credentials

### 3. Social Media App Setup

Create developer applications for each platform:

- **X (Twitter)**: [Twitter Developer Portal](https://developer.twitter.com/)
- **Instagram**: [Facebook Developers](https://developers.facebook.com/)
- **LinkedIn**: [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- **Facebook**: [Facebook Developers](https://developers.facebook.com/)

### 4. Installation

```bash
npm install
npm run dev
```

## Database Schema

The platform includes a comprehensive database schema with:

- **Users**: User accounts and authentication
- **Brand Profiles**: User brand information and preferences
- **Social Accounts**: Connected social media accounts with OAuth tokens
- **Posts**: User-created and AI-generated content
- **Content Strategies**: AI-generated content strategies
- **Scheduled Jobs**: Post scheduling and queue management
- **Analytics**: Engagement metrics and performance data

## Authentication Flow

1. Users sign up with email/password
2. Passwords are hashed with bcrypt
3. JWT sessions managed by NextAuth.js
4. Protected routes use middleware for authentication
5. Social media accounts connected via OAuth 2.0

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Social Accounts
- `GET /api/social-accounts` - List connected accounts
- `DELETE /api/social-accounts/[id]` - Disconnect account
- `GET /api/auth/connect/[platform]` - Initiate OAuth flow
- `GET /api/auth/callback/[platform]` - OAuth callback handler

### User Management
- `PUT /api/user/profile` - Update user profile
- `GET /api/dashboard/stats` - Dashboard statistics

## Security Features

- Row Level Security (RLS) policies in Supabase
- CSRF protection with state parameters in OAuth flows
- Secure cookie handling for OAuth state
- Input validation with Zod schemas
- Protected API routes with session verification

## Next Steps

This foundation supports the implementation of:

1. **Post Creation**: Manual and AI-powered content creation
2. **Scheduling System**: Calendar-based post scheduling
3. **Publishing Engine**: Automated posting to social platforms
4. **Analytics Dashboard**: Engagement metrics and insights
5. **AI Integration**: Strands SDK and Google Nano Banana integration

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Add proper error handling and validation
4. Update documentation for new features
5. Test authentication and database operations

## License

This project is part of the Social Media Automation Platform specification.