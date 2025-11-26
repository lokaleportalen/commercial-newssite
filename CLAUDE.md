# Commercial Newssite - Documentation

## Project Overview

Next.js 16 full-stack newssite for Danish commercial real estate (Lokaleportalen.dk).

**Stack:** Next.js 16, React 19, Better-Auth, PostgreSQL, Drizzle ORM, Tailwind v4, OpenAI GPT-4o, Google Gemini 3 Pro Preview, Vitest

**Key Features:**
- Better-Auth authentication with roles (admin/user)
- AI-powered article generation via OpenAI GPT-4o
- AI-powered hero image generation via Google Gemini 3 Pro Preview
- Weekly cron job for automated news gathering
- Admin CMS for article management
- ShadCN UI components with custom orange theme

---

## Development Guidelines

### Before Implementing

1. **Be Critical** - Question assumptions, evaluate trade-offs, consider edge cases
2. **Think Thoroughly** - Analyze from multiple angles, consider long-term consequences
3. **Check for Existing Components** - Search `components/ui/`, `components/*/`, `lib/` before creating new ones
4. **Plan First** - Outline approach, ask clarifying questions, get confirmation for major changes

### After Major Changes

5. **Update Documentation** - Update CLAUDE.md and Recent Changes section

### Component Reuse Checklist

- `components/ui/` - ShadCN components
- `components/article/`, `auth/`, `profile/`, `layout/` - Feature components
- `lib/utils.ts`, `lib/auth.ts`, `lib/auth-client.ts` - Utilities

### Testing

**IMPORTANT: Write unit tests for all custom components (not ShadCN UI).**

- **Framework:** Vitest + React Testing Library
- **Location:** `test/` subdirectories (e.g., `components/auth/test/login-form.test.tsx`)
- **Commands:**
  ```bash
  npm test              # Run all tests
  npm run test:watch    # Watch mode
  npm run test:ui       # Interactive UI
  npm run test:coverage # Coverage report
  ```
- **Mock:** Next.js modules, Better-Auth client, global functions (use `lib/test-utils.tsx`)
- **Test:** Rendering, interactions, validation, error states, accessibility

---

## Directory Structure

```
app/
├── admin/page.tsx              # Admin CMS (protected)
├── api/
│   ├── admin/articles/         # Article CRUD endpoints
│   ├── auth/[...all]/          # Better-Auth routes
│   ├── cron/weekly-news/       # News fetching cron
│   ├── articles/process/       # Article generation
│   └── upload/                 # Image upload (Vercel Blob)
├── login/, signup/             # Auth pages
└── page.tsx, layout.tsx        # Home & root layout

components/
├── admin/                      # ArticleList, ArticleEditor
├── article/                    # ArticleCard, HeroSection, Pagination, Categories
├── auth/                       # LoginForm, SignupForm, OnboardingForm
├── profile/                    # ProfileForm, PreferencesForm
├── layout/                     # Navigation, Footer
└── ui/                         # ShadCN components (Button, Card, Input, etc.)

database/
├── db.ts                       # Drizzle connection
├── schema/                     # auth-schema, roles-schema, articles-schema
├── drizzle/                    # Migrations
└── seed/                       # Seed scripts (auth-seed.ts)

lib/
├── auth.ts, auth-client.ts     # Better-Auth config
├── auth-helpers.ts             # Authorization utilities
└── utils.ts                    # Helper functions
```

---

## Database Schema

**PostgreSQL via Drizzle ORM** (see `database/schema/` for full definitions)

- **user** - User accounts (id, name, email, password, timestamps)
- **session** - User sessions (token, expiresAt, userId FK)
- **account** - OAuth providers (accountId, providerId, userId FK, tokens)
- **verification** - Email verification tokens
- **role** - User roles (userId FK, role: 'admin'|'user')
- **article** - News articles (id UUID, title, slug unique, content markdown, summary, metaDescription, image, sourceUrl, categories, status: draft|published|archived, timestamps)

**Seed Users:** admin@example.com / admin123, test@example.com / password123

---

## Authentication

**Better-Auth** with PostgreSQL adapter and email/password auth. See `lib/auth.ts` (server), `lib/auth-client.ts` (client with `useSession()` hook).

**Routes:** `/api/auth/*` - sign-up, sign-in, sign-out, session management

**Authorization Helpers** (`lib/auth-helpers.ts`):
- `requireAdmin()` - Throw if not admin (use in API routes)
- `isAdmin()`, `hasRole(role)` - Check user role
- `getCurrentUser()`, `getSession()` - Get current user/session

---

## API Endpoints

### Public Endpoints

- **POST /api/auth/\*** - Better-Auth endpoints (sign-up, sign-in, sign-out)
- **POST /api/upload?filename=X** - Upload images to Vercel Blob (returns URL)

### Admin Endpoints (require admin role)

- **GET /api/admin/articles?search=X** - List/search articles
- **GET /api/admin/articles/[id]** - Get single article
- **PUT /api/admin/articles/[id]** - Update article (all fields editable)
- **DELETE /api/admin/articles/[id]** - Delete article

### Cron Endpoints (require `Authorization: Bearer <CRON_SECRET>`)

**GET /api/cron/weekly-news**
- Fetches Danish real estate news from OpenAI GPT-4o
- Sends each item to `/api/articles/process`
- Returns processing summary

**POST /api/articles/process**
- Receives news item (title, summary, source, date)
- Research phase: OpenAI searches web for details
- Writing phase: Generates markdown article
- Metadata phase: Creates slug, meta description, categories
- Saves to database as "published"
- Image generation phase: Gemini 3 Pro Preview generates hero image based on headline
- Uploads image to Vercel Blob and updates article with image URL

---

## Admin CMS

**Route:** `/admin` (requires admin role, see API Endpoints section above for full CRUD details)

**Features:**
- Two-panel layout: ArticleList (sidebar) + ArticleEditor (main)
- Search articles, edit all fields (title, slug, content, summary, meta, image, categories, source)
- Upload images to Vercel Blob
- Publish/archive/delete with confirmations
- Unsaved changes detection
- Toast notifications

**Article Status:** draft (default) → published (visible) → archived (hidden)

**Security:** Role-based access control with `requireAdmin()`, 401/403 handling

---

## Components

See `components/` for all files. Tests in `test/` subdirectories.

**Admin:** ArticleList, ArticleEditor
**Article:** ArticleCard, HeroSection, Pagination, ArticleCategories, CategoryLink, HeroBanner
**Auth:** LoginForm, SignupForm, OnboardingForm
**Profile:** ProfileForm, PreferencesForm
**Layout:** Navigation (session-aware), Footer
**UI:** ShadCN components (Button, Card, Input, Field, Badge, Textarea, Switch, ScrollArea, AlertDialog, DropdownMenu, Skeleton, Sonner, Label, Separator, NavigationMenu)

---

## Configuration

**Environment Variables** (`.env`):
```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
CRON_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**TypeScript:** Strict mode, @ alias
**Tailwind:** v4 with custom orange theme (OKLCh colors), dark mode support
**ShadCN:** new-york style, lucide-react icons
**Drizzle:** PostgreSQL, schema in `./schema/`, output `./drizzle/`

---

## Development Commands

### App Scripts

```bash
npm run dev    # Dev server (:3000)
npm run build  # Production build
npm run start  # Production server
npm run lint   # ESLint
```

### Testing Commands

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode (re-runs on file changes)
npm run test:ui       # Open Vitest UI for interactive testing
npm run test:coverage # Run tests and generate coverage report
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

## Setting Up Weekly Cron Job

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-news",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

Add to Vercel environment variables:

- `CRON_SECRET` - Your generated secret
- `OPENAI_API_KEY` - Your OpenAI key
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

Add secrets to GitHub repository:

- `CRON_SECRET`

### Option 3: External Cron Service

Use services like:

- cron-job.org
- EasyCron
- AWS EventBridge

Configure HTTP request:

- **URL:** `https://yourdomain.com/api/cron/weekly-news`
- **Method:** GET
- **Header:** `Authorization: Bearer <your-cron-secret>`
- **Schedule:** Weekly (e.g., Monday 9 AM)

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
CRON_SECRET=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Apply database migrations
cd database
npm run push
```

**Test the cron endpoint:**

```bash
curl -X GET \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/weekly-news
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
6. Gemini 3 Pro Preview generates hero image based on article headline
7. Image uploaded to Vercel Blob and URL saved to article
8. Response confirms success with article and image URLs

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

| File                                    | Purpose                          |
| --------------------------------------- | -------------------------------- |
| lib/auth.ts                             | Better-Auth server configuration |
| lib/auth-client.ts                      | Better-Auth client configuration |
| lib/auth-helpers.ts                     | Authorization utilities          |
| database/db.ts                          | Database connection pool         |
| database/schema/auth-schema.ts          | Authentication tables            |
| database/schema/roles-schema.ts         | User roles table                 |
| database/schema/articles-schema.ts      | Articles table                   |
| app/api/auth/[...all]/route.ts          | Auth API handler                 |
| app/api/admin/articles/route.ts         | Admin article list/search        |
| app/api/admin/articles/[id]/route.ts    | Admin article CRUD               |
| app/api/cron/weekly-news/route.ts       | Weekly news cron job             |
| app/api/articles/process/route.ts       | Article processing               |
| app/api/upload/route.ts                 | Image upload to Vercel Blob      |
| app/globals.css                         | Theme and global styles          |
| components/admin/article-list.tsx       | Admin article list sidebar       |
| components/admin/article-editor.tsx     | Admin article editor             |
| components/layout/navigation.tsx        | Main navigation                  |
| components/layout/footer.tsx            | Site footer                      |
| components/auth/login-form.tsx          | Login UI                         |
| components/auth/signup-form.tsx         | Signup UI                        |
| components/auth/onboarding-form.tsx     | Onboarding UI                    |
| components/profile/profile-form.tsx     | Profile management UI            |
| components/profile/preferences-form.tsx | User preferences UI              |
| components/article/article-card.tsx     | Article preview card             |
| components/article/hero-section.tsx     | Homepage hero section            |

---

## Recent Changes

### 2025-11-26: AI-Powered Hero Image Generation

- **Image Generation Integration:**
  - Integrated Google Gemini 3 Pro Preview (Nano Banana) for automated hero image generation
  - Uses `gemini-3-pro-preview` model with native image generation capabilities
  - Added image generation step to article processing workflow (`/api/articles/process`)
  - Images generated based on article headlines with landscape orientation
  - Automatic upload to Vercel Blob storage
  - Article records updated with image URLs
  - Graceful fallback if Gemini API key not configured

- **Dependencies:**
  - Installed `@google/generative-ai` package
  - Added `GEMINI_API_KEY` environment variable requirement

- **Updated Documentation:**
  - Updated stack and key features in Project Overview
  - Added GEMINI_API_KEY to Configuration section
  - Updated Article Generation Flow to include image generation step
  - Updated API endpoint documentation for `/api/articles/process`

### 2025-11-25: Component Reorganization & Testing Infrastructure

- **Reorganized component folder structure:**

  - Organized components into logical subfolders: `article/`, `auth/`, `profile/`, `layout/`
  - Moved test files into separate `test/` subdirectories within each component folder
  - Updated all import paths across the codebase (25 files modified)
  - All 120 tests pass with new structure
  - Updated documentation to reflect new organization
  - Improved code organization and maintainability

- **Added comprehensive unit testing infrastructure:**
  - Set up Vitest with React Testing Library
  - Created test utilities and mocking helpers in `lib/test-utils.tsx`
  - Wrote tests for all custom components (13 test files, 120 tests total)
  - Added test scripts to package.json (test, test:watch, test:ui, test:coverage)
  - Updated Development Guidelines with testing requirements
  - Test coverage includes: rendering, user interactions, form validation, error states, loading states

### 2025-11-25: Admin Dashboard & CMS Implementation

- **Roles System:** Created roles table schema with admin/user roles
- **Authorization:** Implemented auth helpers (requireAdmin, isAdmin, hasRole)
- **Admin API:** Built complete REST API for article CRUD operations
  - GET /api/admin/articles - List/search articles
  - GET /api/admin/articles/[id] - Get single article
  - PUT /api/admin/articles/[id] - Update article
  - DELETE /api/admin/articles/[id] - Delete article
- **Admin Dashboard:** Full-featured CMS at /admin route
  - Two-panel layout: sidebar + main editor
  - Article list with real-time search
  - Visual status badges (Draft/Published/Archived)
  - Complete article editor with all fields editable
  - Publish/unpublish toggle switch
  - Image upload to Vercel Blob + manual URL input
  - Actions dropdown with Archive and Delete options
  - Unsaved changes warning
  - Toast notifications for all operations
  - Confirmation dialogs for destructive actions
- **ShadCN Components:** Added Badge, Textarea, Switch, ScrollArea, AlertDialog, DropdownMenu, Skeleton, Toast/Sonner
- **Image Upload:** Integrated Vercel Blob storage for image uploads
- **Seed Data:** Updated to create admin user (admin@example.com / admin123)
- **UI/UX:** Loading skeletons, empty states, responsive design, accessible labels

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
   - Password reset functionality
   - Email verification

2. **Articles:**

   - Article listing page
   - Article detail pages
   - Category filtering
   - Search functionality
   - ~~Automated hero image generation~~ ✅ Completed (using Gemini 3 Pro Preview)

3. **Admin Features:**

   - ~~Admin panel for article review~~ ✅ Completed
   - ~~Manual article editing~~ ✅ Completed
   - ~~Publishing workflow~~ ✅ Completed
   - Analytics dashboard
   - Bulk actions (publish/archive multiple articles)
   - Article scheduling/auto-publish dates

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

**Images not generating for articles:**

- Add `GEMINI_API_KEY` to `.env` file (get from Google AI Studio)
- Restart development server
- Check console logs for image generation errors
- Image generation is optional - articles will save without images if key is missing
- Verify Vercel Blob is configured and accessible

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

Last Updated: 2025-11-25
