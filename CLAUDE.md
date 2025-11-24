# Commercial Newssite - Architecture Documentation

## Project Overview

This is a Next.js 16 full-stack web application for "Nyheder" (News), a commercial newssite focused on Danish commercial real estate that is part of Lokaleportalen.dk.

### Key Features

- Complete authentication system with Better-Auth
  - Email/password authentication
  - Email verification on signup
  - Password reset functionality
- Full email system with Mailgun integration
  - Welcome emails with verification links
  - Password reset emails
  - Daily news digests
  - Immediate article notifications
- PostgreSQL database with Drizzle ORM
- Automated news gathering and AI-powered article generation using OpenAI GPT-4o
- Weekly cron job for automated content publishing
- User preferences system for personalized email delivery
- Modern UI with ShadCN components and custom orange theme
- Production-ready architecture with TypeScript strict mode

---

## Development Guidelines

**IMPORTANT: Follow these guidelines for all development work.**

### Before Implementing Solutions

1. **Be Critical of Solutions**
   - Question assumptions and evaluate trade-offs
   - Consider edge cases and potential issues
   - Don't accept the first solution that comes to mind

2. **Think Thoroughly**
   - Analyze the problem from multiple angles
   - Consider performance, security, and maintainability implications
   - Evaluate long-term consequences of design decisions

3. **Check for Existing Components**
   - Search the codebase for reusable components before creating new ones
   - Check `components/ui/` for existing ShadCN components
   - Look for existing utilities in `lib/` before writing new helpers
   - Avoid code duplication and redundancy

4. **Plan Before Executing**
   - Provide a concise plan outlining the approach
   - Ask clarifying questions when requirements are ambiguous
   - Get confirmation before making significant changes

### After Major Changes

5. **Update Documentation**
   - Update this CLAUDE.md file after major updates, adjustments, or changes
   - Keep the "Recent Changes" section current
   - Document new components, endpoints, or patterns

### Component Reuse Checklist

Before creating new components, check:
- [ ] `components/ui/` - ShadCN components (Button, Card, Input, Field, etc.)
- [ ] `components/` - Custom components (Navigation, forms, etc.)
- [ ] `lib/utils.ts` - Utility functions
- [ ] `lib/auth.ts` / `lib/auth-client.ts` - Auth utilities

---

## Technology Stack

| Package                  | Version | Purpose                         |
| ------------------------ | ------- | ------------------------------- |
| next                     | 16.0.1  | React framework with App Router |
| react                    | 19.2.0  | UI library                      |
| better-auth              | 1.3.34  | Authentication system           |
| drizzle-orm              | 0.44.7  | Database ORM                    |
| pg                       | 8.16.3  | PostgreSQL driver               |
| mailgun.js               | latest  | Email service provider          |
| form-data                | latest  | Mailgun dependency              |
| tailwindcss              | 4       | CSS framework                   |
| lucide-react             | 0.553.0 | Icon library                    |
| class-variance-authority | 0.7.1   | Component variants              |
| openai                   | latest  | AI article generation           |

---

## Directory Structure

```
commercial-newssite/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/       # Better-Auth API routes
│   │   ├── cron/
│   │   │   ├── weekly-news/     # Weekly news fetching cron
│   │   │   └── send-daily-digest/ # Daily email digest cron
│   │   └── articles/
│   │       ├── process/         # Article processing endpoint
│   │       └── send-notifications/ # Immediate email notifications
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── forgot-password/         # Forgot password page
│   ├── reset-password/          # Reset password page
│   ├── verify-email/            # Email verification page
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                  # React components
│   ├── ui/                      # ShadCN UI library
│   ├── navigation.tsx           # Main navigation
│   ├── login-form.tsx           # Login form
│   ├── signup-form.tsx          # Signup form
│   ├── forgot-password-form.tsx # Forgot password form
│   ├── reset-password-form.tsx  # Reset password form
│   └── email-verification.tsx   # Email verification component
│
├── database/                    # Database setup
│   ├── db.ts                    # Drizzle connection
│   ├── schema/
│   │   ├── index.ts             # Schema exports
│   │   ├── auth-schema.ts       # Auth tables
│   │   ├── articles-schema.ts   # Articles table
│   │   └── user-preferences-schema.ts # User email preferences
│   ├── drizzle/                 # Generated migrations
│   ├── seed/                    # Seeding scripts
│   └── drizzle.config.ts        # Drizzle configuration
│
├── lib/                         # Utilities
│   ├── auth.ts                  # Better-Auth server
│   ├── auth-client.ts           # Better-Auth client
│   ├── email.ts                 # Mailgun email service
│   └── utils.ts                 # Helper functions
│
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
└── CLAUDE.md                    # This file
```

---

## Database Schema

### Connection (database/db.ts)

PostgreSQL via Drizzle ORM with node-postgres pool:

- Pool-based connection management
- DATABASE_URL from environment
- Type-safe query API

### Authentication Tables (database/schema/auth-schema.ts)

**user** - User accounts

- id (text, PK)
- name, email (text, email unique)
- emailVerified (boolean)
- image, password (text)
- createdAt, updatedAt (timestamps)

**session** - User sessions

- id, token (text, token unique)
- expiresAt (timestamp)
- ipAddress, userAgent (text)
- userId (FK to user, CASCADE)
- createdAt, updatedAt

**account** - OAuth provider accounts

- id, accountId, providerId (text)
- userId (FK to user, CASCADE)
- accessToken, refreshToken, idToken
- Token expiration fields
- scope, password (text)
- Timestamps

**verification** - Email verification

- id, identifier, value (text)
- expiresAt (timestamp)
- Timestamps

### Articles Table (database/schema/articles-schema.ts)

**article** - News articles

- id (UUID, PK) - Unique article identifier
- title (Text, Not Null) - Article headline
- slug (Text, Not Null, Unique) - URL-friendly identifier
- content (Text, Not Null) - Full article content in markdown
- summary (Text) - Brief article summary (2-3 sentences)
- metaDescription (Text) - SEO meta description (150-160 chars)
- image (Text) - Featured image URL
- sourceUrl (Text) - Original news source URL
- categories (Text) - Comma-separated categories
- status (Text, Default: 'draft') - Article status: draft, published, archived
- publishedDate (Timestamp) - When article was published
- createdAt (Timestamp, Auto) - Record creation timestamp
- updatedAt (Timestamp, Auto) - Last update timestamp

### User Preferences Table (database/schema/user-preferences-schema.ts)

**userPreferences** - User email preferences

- id (Text, PK) - Unique preference ID
- userId (Text, Not Null, Unique) - FK to user, CASCADE
- newsCategory (Text, Default: 'all') - Preferred categories: all, investment, construction, new, old
- emailFrequency (Text, Default: 'daily') - Email frequency: daily, weekly, immediate
- createdAt (Timestamp, Auto) - Record creation timestamp
- updatedAt (Timestamp, Auto) - Last update timestamp

### Migrations

- `0000_unique_mattie_franklin.sql` - Auth tables
- `0001_solid_ser_duncan.sql` - Articles table
- User preferences migrations

### Seeding

- `seed.ts` - Main entry point
- `auth-seed.ts` - Creates test user (test@example.com / password123)

---

## Authentication System

### Server Config (lib/auth.ts)

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true to require verification before login
    sendResetPassword: async ({ user, url, token }) => {
      // Sends password reset email via Mailgun
      await sendPasswordResetEmail(user.email, user.name, token);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // Sends welcome email with verification link via Mailgun
      await sendWelcomeEmail(user.email, user.name, token);
    },
    sendOnSignUp: true, // Automatically send verification email on signup
  },
});
```

Features:
- PostgreSQL database with Drizzle adapter
- Email/password authentication
- Email verification on signup
- Password reset functionality
- Automatic email sending via Mailgun

### Client Config (lib/auth-client.ts)

```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});
```

Client-side state and API calls with `useSession()` hook.

Available methods:
- `signUp()` - Register new user, triggers welcome email
- `signIn()` - Login existing user
- `signOut()` - Logout
- `forgetPassword()` - Request password reset email
- `resetPassword()` - Reset password with token
- `verifyEmail()` - Verify email with token
- `getSession()` - Get current session

### API Routes (app/api/auth/[...all]/route.ts)

Catch-all handler for:

- POST /api/auth/sign-up - Register + send welcome email
- POST /api/auth/sign-in - Login
- POST /api/auth/sign-out - Logout
- POST /api/auth/forget-password - Request password reset
- POST /api/auth/reset-password - Reset password with token
- POST /api/auth/verify-email - Verify email with token
- Session and OAuth endpoints

### Authentication Pages

- **/login** - Login form with "Forgot password?" link
- **/signup** - Signup form (triggers welcome email)
- **/forgot-password** - Request password reset
- **/reset-password?token=xxx** - Reset password with token
- **/verify-email?token=xxx** - Verify email address

---

## Email System

### Email Service (lib/email.ts)

Mailgun-powered email system with responsive HTML templates in Danish.

**Configuration:**
- Provider: Mailgun
- Client: mailgun.js with form-data
- Templates: Responsive HTML with fallback text

**Environment Variables:**
- `MAILGUN_API_KEY` - Mailgun API key
- `MAILGUN_DOMAIN` - Verified Mailgun domain
- `FROM_EMAIL` - Sender email address
- `FROM_NAME` - Sender name

### Email Templates

All emails are sent in Danish with professional, branded design:

**1. Welcome Email** (`sendWelcomeEmail`)
- Sent automatically on user signup
- Includes email verification link
- Link expires in 24 hours
- Orange gradient header with Nyheder branding

**2. Password Reset Email** (`sendPasswordResetEmail`)
- Sent when user requests password reset
- Includes reset link with token
- Link expires in 1 hour
- Security warning included

**3. Daily News Digest** (`sendDailyDigestEmail`)
- Personalized article summaries
- Filtered by user's category preferences
- Up to 10 articles per digest
- Links to full articles
- Preferences management links

**4. Immediate Notification** (`sendImmediateNotificationEmail`)
- Real-time notification for new articles
- Sent only for matching categories
- Single article per email
- Quick "read article" CTA

### Email Triggers

**Automatic Triggers:**
- User signup → Welcome email with verification link
- Password reset request → Reset email with token
- Daily cron (8 AM) → Daily digest to subscribed users
- New article published → Immediate notifications to subscribed users

**Manual Triggers:**
- User can resend verification email from verification page
- Admin can trigger digest manually via cron endpoint

### User Email Preferences

Users can configure email preferences via `/preferences` page:

**Email Frequency:**
- `daily` - Receive daily digest at 8 AM
- `weekly` - Receive weekly digest (not yet implemented)
- `immediate` - Receive notification for each new article

**News Categories:**
- `all` - All commercial real estate news
- `investment` - Investment news
- `construction` - Construction news
- And more category options

**Unsubscribe:**
- One-click unsubscribe via `/api/user/preferences/unsubscribe`
- All emails include unsubscribe link

### Email Deliverability

**Mailgun Setup Steps:**
1. Sign up at mailgun.com
2. Add and verify domain (DNS records)
3. Get API key from Account Settings
4. Configure environment variables
5. Test email sending

**Best Practices:**
- Use verified domain for better deliverability
- Include plain text fallback
- Responsive design for mobile
- Unsubscribe link in every email
- Monitor bounce rates via Mailgun dashboard

---

## API Endpoints

### 1. Weekly News Cron Job

**Endpoint:** `GET /api/cron/weekly-news`

**Location:** `app/api/cron/weekly-news/route.ts`

**Purpose:**

- Triggered weekly by cron service (Vercel Cron, GitHub Actions, etc.)
- Fetches list of Danish commercial real estate news from OpenAI GPT-4o
- Sends each news item to article processing endpoint

**Authentication:**
Requires `Authorization: Bearer <CRON_SECRET>` header

**Process Flow:**

1. Validates authorization token
2. Sends fixed prompt to OpenAI GPT-4o requesting Danish commercial real estate news
3. Receives markdown-formatted list of news items
4. Parses news items into structured objects
5. Sends each item to `/api/articles/process` endpoint
6. Returns summary of processing results

**Expected News Format:**

```markdown
- **Title**: [News title]
  - **Summary**: [2-3 sentence summary]
  - **Source**: [Source name]
  - **Date**: [Date or timeframe]
```

**Response:**

```json
{
  "success": true,
  "message": "Weekly news processing completed",
  "totalItems": 7,
  "processedArticles": [
    {
      "success": true,
      "title": "Example Title",
      "id": "uuid"
    }
  ],
  "rawNewsList": "..."
}
```

### 2. Article Processing Endpoint

**Endpoint:** `POST /api/articles/process`

**Location:** `app/api/articles/process/route.ts`

**Purpose:**

- Receives individual news items
- Uses OpenAI to research and write full articles
- Saves completed articles to database

**Authentication:**
Requires `Authorization: Bearer <CRON_SECRET>` header

**Request Body:**

```json
{
  "title": "News title",
  "summary": "Brief summary",
  "source": "Source name (optional)",
  "date": "Date or timeframe (optional)"
}
```

**Process Flow:**

1. Validates authorization token
2. **Research Phase:** Uses OpenAI GPT-4o to research the news story
   - Searches web for additional details
   - Gathers context and related information
   - Identifies key facts and quotes
3. **Writing Phase:** Uses research to write professional article
   - Creates structured markdown content
   - Includes proper headings and formatting
   - Uses journalistic tone
4. **Metadata Generation:** Generates SEO and organizational metadata
   - URL slug
   - Meta description
   - Summary
   - Categories
5. **Database Storage:** Saves article to PostgreSQL
   - Sets status to "published"
   - Records timestamp

**Response:**

```json
{
  "success": true,
  "message": "Article processed and saved successfully",
  "articleId": "uuid",
  "slug": "article-url-slug"
}
```

**Note:** After saving the article, this endpoint automatically triggers immediate notifications to subscribed users.

### 3. Daily Digest Cron Job

**Endpoint:** `GET /api/cron/send-daily-digest`

**Location:** `app/api/cron/send-daily-digest/route.ts`

**Purpose:**

- Sends personalized daily news digests to subscribed users
- Triggered daily at 8:00 AM (configure in Vercel Cron or GitHub Actions)
- Filters articles based on user preferences

**Authentication:**
Requires `Authorization: Bearer <CRON_SECRET>` header

**Process Flow:**

1. Validates authorization token
2. Queries all users with `emailFrequency = 'daily'`
3. For each user:
   - Fetches articles from last 24 hours
   - Filters by user's `newsCategory` preference
   - Sends personalized digest email (up to 10 articles)
   - Skips users with no matching articles
4. Returns summary of emails sent

**Response:**

```json
{
  "success": true,
  "message": "Daily digest processing completed",
  "totalUsers": 50,
  "emailsSent": 45,
  "skipped": 3,
  "failed": 2,
  "results": [...]
}
```

### 4. Send Immediate Notifications

**Endpoint:** `POST /api/articles/send-notifications`

**Location:** `app/api/articles/send-notifications/route.ts`

**Purpose:**

- Sends immediate email notifications for a newly published article
- Called automatically by article processing endpoint
- Can be manually triggered for existing articles

**Authentication:**
Requires `Authorization: Bearer <CRON_SECRET>` header

**Request Body:**

```json
{
  "articleId": "uuid-of-article"
}
```

**Process Flow:**

1. Validates authorization token
2. Fetches article details from database
3. Queries all users with `emailFrequency = 'immediate'`
4. Filters users based on:
   - User wants all categories, OR
   - Article categories match user's preference
5. Sends notification email to each matching user
6. Returns summary of emails sent

**Response:**

```json
{
  "success": true,
  "message": "Immediate notifications sent",
  "article": {
    "id": "uuid",
    "title": "Article Title",
    "slug": "article-slug"
  },
  "totalMatchingUsers": 10,
  "emailsSent": 9,
  "failed": 1,
  "results": [...]
}
```

---

## Application Routes

**Home** (app/page.tsx) - Landing page, ready for content

**Login** (app/login/page.tsx) - LoginForm in centered layout

**Signup** (app/signup/page.tsx) - SignupForm in centered layout

**Root Layout** (app/layout.tsx) - Title "Nyheder", global styles, navigation

---

## Components

### Navigation (components/navigation.tsx)

- Main site navigation with responsive design
- Session-aware menu items (login/logout)
- Loading skeleton to prevent flash of incorrect state
- Links to news categories

### LoginForm (components/login-form.tsx)

- Card with header
- Email input
- Password input with "Forgot?" link
- Login button
- Google login button
- Sign up link

### SignupForm (components/signup-form.tsx)

- Card with header
- Full Name input
- Email input
- Password input
- Confirm Password input
- Create Account button
- Google signup button
- Sign in link

### UI Components (components/ui/)

**Button** - Variants (default, destructive, outline, secondary, ghost, link), sizes (sm, default, lg, icon)

**Card** - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction

**Input** - Styled input element with focus states

**Field** - Complex form system - Field, FieldGroup, FieldLabel, FieldContent, FieldDescription, FieldError, FieldSeparator, FieldSet, FieldLegend

**Other** - Label, Separator, NavigationMenu

---

## Styling & Theme

### Global Styles (app/globals.css)

Tailwind v4 with OKLCh colors:

**Primary: Orange**

- Light: oklch(0.646 0.222 41.116)
- Dark: oklch(0.705 0.213 47.604)

**Color System:**

- Background/Foreground
- Card, Popover
- Primary, Secondary
- Muted, Accent
- Destructive, Border, Input, Ring
- Chart colors (1-5)
- Sidebar colors

**Radius:** 0.65rem base with sm, md, lg, xl variants

**Dark Mode:** Via .dark class selector

---

## Configuration

### TypeScript (tsconfig.json)

- ES2017 target
- Strict mode enabled
- @ alias to ./

### Environment Variables (.env)

Required variables (copy from `.env.example`):

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/newssite

# OpenAI API Configuration
OPENAI_API_KEY=sk-...

# Unsplash API Configuration
UNSPLASH_ACCESS_KEY=your-access-key-here

# Mailgun Email Configuration
MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=mg.yourdomain.com
FROM_EMAIL=nyheder@lokaleportalen.dk
FROM_NAME=Nyheder

# Cron Job Security
CRON_SECRET=your-secret-key-here

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Getting API Keys:**

OpenAI API Key:

1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env` as `OPENAI_API_KEY`

Mailgun Setup:

1. Sign up at https://mailgun.com
2. Add and verify your domain (DNS records required)
3. Get API key from Account Settings > API Keys
4. Add to `.env` as `MAILGUN_API_KEY`
5. Use your verified domain as `MAILGUN_DOMAIN` (e.g., mg.yourdomain.com)

Cron Secret:

```bash
openssl rand -base64 32
```

### ShadCN (components.json)

- Style: new-york
- Icons: lucide-react
- Aliases configured

### Drizzle (database/drizzle.config.ts)

- PostgreSQL dialect
- Schema: ./schema/index.ts
- Output: ./drizzle/

---

## Development Commands

### App Scripts

```bash
npm run dev    # Dev server (:3000)
npm run build  # Production build
npm run start  # Production server
npm run lint   # ESLint
```

### Database Operations

```bash
cd database
npm run studio      # Open Drizzle Studio
npm run generate    # Generate migrations
npm run push        # Push schema to database
npm run migrate     # Run migrations
npm run seed        # Seed local database
```

**Seed Production Database:**

```bash
cd database
DATABASE_URL="postgresql://newssite_mp5z_user:rV2W48mBCtizpgBp7w5FXkzWhJhNqXHB@dpg-d4dejgqdbo4c73dpseb0-a.oregon-postgres.render.com/newssite_mp5z" npx tsx seed/reset.ts
```

This will:
- Clear all tables in the production database
- Re-seed with auth data (test user)
- Re-seed with categories
- Re-seed with articles

---

## Setting Up Cron Jobs

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-news",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/send-daily-digest",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Cron Schedules:**
- Weekly news: `0 9 * * 1` (Every Monday at 9 AM UTC)
- Daily digest: `0 8 * * *` (Every day at 8 AM UTC)

Add to Vercel environment variables:

- `CRON_SECRET` - Your generated secret
- `OPENAI_API_KEY` - Your OpenAI key
- `MAILGUN_API_KEY` - Your Mailgun API key
- `MAILGUN_DOMAIN` - Your Mailgun domain
- `FROM_EMAIL` - Sender email address
- `FROM_NAME` - Sender name
- `DATABASE_URL` - Your database connection string
- `NEXT_PUBLIC_BASE_URL` - Your production URL

Vercel will automatically add the authorization header.

### Option 2: GitHub Actions

Create `.github/workflows/weekly-news.yml`:

```yaml
name: Weekly News Fetch
on:
  schedule:
    - cron: "0 9 * * 1" # Every Monday at 9 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger News Fetch
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://yourdomain.com/api/cron/weekly-news
```

Create `.github/workflows/daily-digest.yml`:

```yaml
name: Daily Email Digest
on:
  schedule:
    - cron: "0 8 * * *" # Every day at 8 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  send-digest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Digest
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://yourdomain.com/api/cron/send-daily-digest
```

Add secrets to GitHub repository:

- `CRON_SECRET`

### Option 3: External Cron Service

Use services like:

- cron-job.org
- EasyCron
- AWS EventBridge

Configure two HTTP requests:

**Weekly News:**
- **URL:** `https://yourdomain.com/api/cron/weekly-news`
- **Method:** GET
- **Header:** `Authorization: Bearer <your-cron-secret>`
- **Schedule:** Weekly (e.g., Monday 9 AM)

**Daily Digest:**
- **URL:** `https://yourdomain.com/api/cron/send-daily-digest`
- **Method:** GET
- **Header:** `Authorization: Bearer <your-cron-secret>`
- **Schedule:** Daily (e.g., 8 AM)

---

## Testing the System

### 1. Manual Testing (Local Development)

**Prerequisites:**

```bash
# Install dependencies
npm install

# Set up environment variables in .env
DATABASE_URL=...
OPENAI_API_KEY=...
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...
FROM_EMAIL=...
FROM_NAME=...
CRON_SECRET=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Apply database migrations
cd database
npm run push
```

**Test the weekly news cron:**

```bash
curl -X GET \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/weekly-news
```

**Test the daily digest cron:**

```bash
curl -X GET \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/send-daily-digest
```

**Test article processing directly:**

```bash
curl -X POST \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test News Story",
    "summary": "This is a test summary of a commercial real estate story in Denmark.",
    "source": "Test Source",
    "date": "2025-11-13"
  }' \
  http://localhost:3000/api/articles/process
```

**Test immediate notifications:**

```bash
# First, get an article ID from the database, then:
curl -X POST \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "your-article-uuid"
  }' \
  http://localhost:3000/api/articles/send-notifications
```

**Test authentication emails:**

1. Sign up at `/signup` - should receive welcome email
2. Visit `/forgot-password` and request reset - should receive password reset email
3. Check email and click verification/reset links

### 2. Verify Database

```bash
cd database
npm run studio
```

Open Drizzle Studio and check the `article` table for newly created entries.

---

## Architecture Decisions

### Why Two Separate Endpoints?

1. **Separation of Concerns:**

   - `/api/cron/weekly-news` - News gathering and orchestration
   - `/api/articles/process` - Article writing and storage

2. **Scalability:**

   - Each news item can be processed independently
   - Failures in one article don't affect others
   - Allows for parallel processing in future

3. **Reusability:**
   - Article processing endpoint can be called manually
   - Can be triggered from other sources (admin panel, webhooks, etc.)

### Why OpenAI GPT-4o?

- **Web Search Integration:** GPT-4o includes web search capabilities for researching news
- **High-Quality Output:** Better article writing and research quality
- **JSON Mode:** Structured metadata generation with response_format

### Security Considerations

1. **Token-Based Authentication:** Prevents unauthorized access to expensive API operations
2. **Environment Variable Security:** Sensitive keys stored in environment, not code
3. **Request Validation:** All inputs validated before processing
4. **Error Handling:** Graceful error responses without exposing internals

---

## Data Flow

### Authentication Flow

1. User submits form
2. POST /api/auth/sign-in or sign-up
3. Better-Auth validates credentials
4. Drizzle queries PostgreSQL
5. Session created if valid
6. Token returned to client
7. Client stores session

### Component Hierarchy

```
Page (Server Component)
└── Form (Client Component)
    ├── Card
    ├── FieldGroup
    │   └── Field
    │       ├── Input
    │       └── Label
    └── Button
```

### Article Generation Flow

1. Cron trigger hits `/api/cron/weekly-news`
2. OpenAI generates list of Danish commercial real estate news
3. Each news item sent to `/api/articles/process`
4. OpenAI researches and writes full article
5. Article saved to database with metadata
6. Response confirms success

---

## Key Patterns

### React

- Function components
- "use client" directive for client components
- Server components by default
- Hooks: useState, useRouter, useSession, useMemo
- ComponentProps<T> for type inference

### TypeScript

- Strict mode enabled
- ComponentProps<T> for component typing
- VariantProps from CVA
- Type-safe database queries with Drizzle

### Styling

- Tailwind utility classes
- CVA for component variants
- CSS variables for theming
- Dark mode support

### Database

- Drizzle ORM for type safety
- Foreign keys with CASCADE
- Auto-update timestamps
- UNIQUE constraints for data integrity

---

## Key Files Reference

| File                               | Purpose                          |
| ---------------------------------- | -------------------------------- |
| lib/auth.ts                        | Better-Auth server configuration |
| lib/auth-client.ts                 | Better-Auth client configuration |
| database/db.ts                     | Database connection pool         |
| database/schema/auth-schema.ts     | Authentication tables            |
| database/schema/articles-schema.ts | Articles table                   |
| app/api/auth/[...all]/route.ts     | Auth API handler                 |
| app/api/cron/weekly-news/route.ts  | Weekly news cron job             |
| app/api/articles/process/route.ts  | Article processing               |
| app/globals.css                    | Theme and global styles          |
| components/navigation.tsx          | Main navigation                  |
| components/login-form.tsx          | Login UI                         |
| components/signup-form.tsx         | Signup UI                        |

---

## Recent Changes

### 2025-11-24 - Complete Email System Implementation

**Email Service:**
- Integrated Mailgun for transactional and marketing emails
- Created `lib/email.ts` with Mailgun client and email templates
- Designed responsive HTML email templates in Danish
- Added plain text fallbacks for all emails

**Authentication Emails:**
- Implemented welcome email with email verification link
- Added password reset email functionality
- Created forgot password page and form (`/forgot-password`)
- Created reset password page and form (`/reset-password`)
- Created email verification page (`/verify-email`)
- Updated Better-Auth configuration with email verification and password reset hooks

**News Digest Emails:**
- Implemented daily digest cron job (`/api/cron/send-daily-digest`)
- Implemented immediate notification system (`/api/articles/send-notifications`)
- Integrated immediate notifications into article processing pipeline
- Email filtering based on user preferences (category and frequency)

**Database & Configuration:**
- User preferences table already existed and was leveraged
- Added Mailgun environment variables to `.env.example`
- Updated documentation with email system architecture

### Previous Changes

- Added Development Guidelines section with best practices for critical thinking, component reuse, and documentation
- Added hero section with featured article
- Implemented simple profile and email settings
- Created category pages and links to pages
- Updated article seed
- Added ShadCN components and custom orange theme
- Implemented Drizzle ORM with PostgreSQL
- Set up Better-Auth authentication system
- Created auth seed data (test user)
- Implemented automated news article system with OpenAI GPT-4o
- Added weekly cron job for news gathering
- Created article processing endpoint
- Designed articles database schema
- Added navigation component with session awareness
- Fixed flash of unauthenticated content (FOUC) in navigation

---

## Future Enhancements

### Planned Improvements:

1. **Authentication:**

   - OAuth (Google/GitHub integration)
   - ~~Password reset functionality~~ ✓ Completed
   - ~~Email verification~~ ✓ Completed

2. **Email System:**

   - Weekly digest option (daily is implemented)
   - Email templates customization
   - Email analytics and tracking
   - A/B testing for email campaigns

3. **Articles:**

   - Article listing page
   - Article detail pages
   - Category filtering
   - Search functionality
   - Image generation with DALL-E

3. **Admin Features:**

   - Admin panel for article review
   - Manual article editing
   - Publishing workflow
   - Analytics dashboard

4. **Technical:**

   - Form validation (zod/react-hook-form)
   - Protected routes
   - Error boundaries
   - Loading states
   - Session persistence improvements
   - RSS feed generation
   - Duplicate article detection

5. **SEO & Performance:**
   - Enhanced SEO metadata
   - Image optimization
   - Static generation for articles
   - Sitemap generation

---

## Troubleshooting

### Common Issues:

**Error: "OpenAI API key not configured"**

- Add `OPENAI_API_KEY` to `.env` file
- Restart development server

**Error: "Please provide required params for Postgres driver: url: undefined"**

- Add `DATABASE_URL` to `.env` file
- Verify PostgreSQL is running
- Check connection string format

**Error: "Unauthorized"**

- Check `CRON_SECRET` matches in request and `.env`
- Verify `Authorization` header format: `Bearer <secret>`

**Articles not appearing:**

- Check database connection
- Verify migration was applied: `cd database && npm run push`
- Check article `status` field (should be "published")
- View articles in Drizzle Studio

**OpenAI rate limits:**

- Implement retry logic with exponential backoff
- Reduce number of news items processed per run
- Consider upgrading OpenAI plan
- Add delay between article processing

**Navigation shows wrong state on refresh:**

- Fixed with loading skeleton using `isPending` from `useSession()`
- Ensure Better-Auth session middleware is configured

---

## Quality Features

- TypeScript strict mode for type safety
- Accessibility (ARIA attributes, semantic HTML)
- Type-safe database queries with Drizzle
- Referential integrity with foreign keys
- Secure session management
- Modern CSS with Tailwind v4
- Component-based architecture
- Separation of concerns
- Environment-based configuration
- Error handling and validation

---

Last Updated: 2025-11-19
