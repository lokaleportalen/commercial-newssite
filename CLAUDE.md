# Commercial Newssite - Documentation

## Project Overview

Next.js 16 newssite for Danish commercial real estate (Lokaleportalen.dk).

**Stack:** Next.js 16, React 19, Better-Auth, PostgreSQL, Drizzle ORM, Tailwind v4, OpenAI GPT-4o, Gemini 3 Pro, Vitest

**Features:** Auth with roles, AI article generation (GPT-4o), AI image generation (Gemini), weekly cron, admin CMS, ShadCN UI with orange theme

## Development Guidelines

**Before Implementing:** Be critical, check existing components (`components/`, `lib/`), plan first
**Testing:** Write unit tests for all custom components (Vitest + RTL in `test/` dirs)
**After Changes:** Update CLAUDE.md Recent Changes section

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

## Structure

```
app/                          # Admin CMS, API routes, auth pages
  admin/                      # Admin dashboard
  api/admin/articles/         # Article CRUD
  api/auth/                   # Better-Auth
  api/cron/weekly-news/       # News cron
  api/articles/process/       # Article generation
  api/upload/                 # Image upload

components/                   # All components (tests in test/ subdirs)
  admin/, article/, auth/, profile/, layout/, ui/

database/                     # DB connection, schema, migrations, seeds
lib/                          # Auth config, auth helpers, utilities
```

## Database

**Schema:** user, session, account, verification, role, article (PostgreSQL via Drizzle)
**Seed Users:** admin@example.com / admin123, test@example.com / password123

## Auth & API

**Better-Auth:** `/api/auth/*` (sign-up/in/out), `lib/auth-helpers.ts` (`requireAdmin()`, `isAdmin()`, `hasRole()`)

<<<<<<< HEAD
**Better-Auth** with PostgreSQL adapter and email/password auth. See `lib/auth.ts` (server), `lib/auth-client.ts` (client with `useSession()` hook).

**Routes:** `/api/auth/*` - sign-up, sign-in, sign-out, session management

**Authorization Helpers** (`lib/auth-helpers.ts`):

- `requireAdmin()` - Throw if not admin (use in API routes)
- `isAdmin()`, `hasRole(role)` - Check user role
- `getCurrentUser()`, `getSession()` - Get current user/session

### Authentication Pages

**Config:** TypeScript strict, Tailwind v4 (orange OKLCh theme), ShadCN (new-york style), Drizzle PostgreSQL

> > > > > > > main

## Commands

```bash
# App
npm run dev|build|start|lint

# Database (cd database/)
npm run studio|generate|push|migrate|seed

# Seed Production
```

## Trigger.dev Integration

**Weekly news processing uses Trigger.dev v4 for long-running AI tasks (no timeouts!)**

**Scheduled Task:** `trigger/weekly-news.ts` - Runs every Wednesday at 6 AM Copenhagen time (native cron)
**Article Processor:** `trigger/article-processor.ts` - Reusable helper for processing articles
**Manual Trigger:** "Fetch weekly news" button in `/admin` dashboard OR POST `/api/admin/trigger-cron`

**Development:**

```bash
npx trigger.dev@latest dev  # Run local dev server
```

**Deploy:**

```bash
npx trigger.dev@latest deploy  # Deploy to Trigger.dev
```

**Monitor:** View runs at https://cloud.trigger.dev

## Architecture

**Trigger.dev Tasks:** Weekly scheduled task (no timeouts) + reusable article processor
**GPT-4o:** Web search, high-quality output, JSON mode
**Security:** Admin auth for manual triggers, env vars, validation

**Article Flow:** Trigger.dev scheduled task → GPT-4o (news list) → Process each article → GPT-4o (research + write) → Gemini (image) → Vercel Blob → DB
**Benefits:** No HTTP timeouts, automatic retries, progress tracking, wait.for() doesn't count toward compute time

## Patterns

**React:** Function components, "use client" for interactivity, server default, `ComponentProps<T>`
**TypeScript:** Strict mode, CVA VariantProps, Drizzle type-safety
**Styling:** Tailwind utilities, CVA variants, CSS variables, dark mode
**Database:** Drizzle ORM, foreign keys, auto-timestamps, unique constraints

## Key Files

**Lib:** `lib/auth.ts` (server), `lib/auth-client.ts` (client), `lib/auth-helpers.ts` (auth utils)
**DB:** `database/db.ts` (connection), `database/schema/*-schema.ts` (tables)
**API:** `app/api/auth/`, `app/api/admin/articles/`, `app/api/cron/`, `app/api/articles/process/`, `app/api/upload/`
**Components:** `components/{admin,article,auth,profile,layout}/` (see structure section)

<<<<<<< HEAD

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

| --------------------------------------- | -------------------------------- |
| lib/auth.ts | Better-Auth server configuration |
| lib/auth-client.ts | Better-Auth client configuration |
| lib/auth-helpers.ts | Authorization utilities |
| database/schema/auth-schema.ts | Authentication tables |
| database/schema/roles-schema.ts | User roles table |
| database/schema/articles-schema.ts | Articles table |
| app/api/auth/[...all]/route.ts | Auth API handler |
| app/api/admin/articles/route.ts | Admin article list/search |
| app/api/admin/articles/[id]/route.ts | Admin article CRUD |
| app/api/cron/weekly-news/route.ts | Weekly news cron job |
| app/api/articles/process/route.ts | Article processing |
| app/api/upload/route.ts | Image upload to Vercel Blob |
| app/globals.css | Theme and global styles |
| components/admin/article-list.tsx | Admin article list sidebar |
| components/admin/article-editor.tsx | Admin article editor |
