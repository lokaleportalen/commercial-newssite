# Commercial Newssite - Architecture Documentation

## Project Overview

This is a Next.js 16 full-stack web application for "Nyheder" (News), a commercial newssite focused on Danish commercial real estate that is part of Lokaleportalen.dk.

### Key Features

- Complete authentication system with Better-Auth
- PostgreSQL database with Drizzle ORM
- Automated news gathering and AI-powered article generation using OpenAI GPT-4o
- Weekly cron job for automated content publishing
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
| tailwindcss              | 4       | CSS framework                   |
| lucide-react             | 0.553.0 | Icon library                    |
| class-variance-authority | 0.7.1   | Component variants              |
| openai                   | latest  | AI article generation           |

---

## Directory Structure

```
commercial-newssite/
├── app/                          # Next.js App Router
│   ├── admin/
│   │   └── page.tsx             # Admin dashboard (protected)
│   ├── api/
│   │   ├── admin/
│   │   │   └── articles/        # Admin article CRUD endpoints
│   │   │       ├── route.ts     # List/search articles
│   │   │       └── [id]/        # Get/update/delete article
│   │   ├── auth/[...all]/       # Better-Auth API routes
│   │   ├── cron/
│   │   │   └── weekly-news/     # Weekly news fetching cron
│   │   ├── articles/
│   │   │   └── process/         # Article processing endpoint
│   │   └── upload/              # Image upload to Vercel Blob
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout with Toaster
│   └── globals.css              # Global styles
│
├── components/                  # React components
│   ├── admin/                   # Admin dashboard components
│   │   ├── article-list.tsx    # Article list with search
│   │   └── article-editor.tsx  # Article editor with full CRUD
│   ├── ui/                      # ShadCN UI library
│   │   ├── badge.tsx            # Status badges
│   │   ├── textarea.tsx         # Multi-line text input
│   │   ├── switch.tsx           # Publish toggle
│   │   ├── scroll-area.tsx      # Custom scrollbar
│   │   ├── alert-dialog.tsx     # Confirmation dialogs
│   │   ├── dropdown-menu.tsx    # Actions menu
│   │   ├── skeleton.tsx         # Loading placeholders
│   │   └── sonner.tsx           # Toast notifications
│   ├── navigation.tsx           # Main navigation
│   ├── login-form.tsx           # Login form
│   └── signup-form.tsx          # Signup form
│
├── database/                    # Database setup
│   ├── db.ts                    # Drizzle connection
│   ├── schema/
│   │   ├── index.ts             # Schema exports
│   │   ├── auth-schema.ts       # Auth tables
│   │   ├── roles-schema.ts      # User roles table
│   │   └── articles-schema.ts   # Articles table
│   ├── drizzle/                 # Generated migrations
│   ├── seed/                    # Seeding scripts
│   │   ├── seed.ts              # Main entry point
│   │   └── auth-seed.ts         # Creates admin + test users
│   └── drizzle.config.ts        # Drizzle configuration
│
├── lib/                         # Utilities
│   ├── auth.ts                  # Better-Auth server
│   ├── auth-client.ts           # Better-Auth client
│   ├── auth-helpers.ts          # Authorization utilities
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

### Migrations

- `0000_unique_mattie_franklin.sql` - Auth tables
- `0001_solid_ser_duncan.sql` - Articles table

### Roles Table (database/schema/roles-schema.ts)

**role** - User roles

- id (text, PK) - Unique role identifier
- userId (text, FK to user, CASCADE, UNIQUE) - One role per user
- role (text, default: 'user') - Role type: 'admin' or 'user'
- createdAt, updatedAt (timestamps)

### Seeding

- `seed.ts` - Main entry point
- `auth-seed.ts` - Creates admin user (admin@example.com / admin123) and test user (test@example.com / password123)

---

## Authentication System

### Server Config (lib/auth.ts)

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
});
```

PostgreSQL database, email/password auth enabled.

### Client Config (lib/auth-client.ts)

```typescript
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});
```

Client-side state and API calls with `useSession()` hook.

### API Routes (app/api/auth/[...all]/route.ts)

Catch-all handler for:

- POST /api/auth/sign-up
- POST /api/auth/sign-in
- POST /api/auth/sign-out
- Session and OAuth endpoints

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

---

## Admin Dashboard & CMS

### Overview

A complete Content Management System for managing articles, accessible only to users with admin role. The admin dashboard provides full CRUD functionality for all articles generated by the automated news system.

### Access Control

**Route:** `/admin`

**Authorization:**
- Requires authenticated user session
- User must have `admin` role in the `role` table
- Non-admin users are automatically redirected to home page
- Uses `lib/auth-helpers.ts` for server-side authorization checks

### Roles System (database/schema/roles-schema.ts)

**role** - User roles table

- id (text, PK) - Unique role identifier
- userId (text, FK to user, CASCADE, UNIQUE) - One role per user
- role (text, default: 'user') - Role type: 'admin' or 'user'
- createdAt, updatedAt (timestamps)

**Seed Data:**
- Admin user: `admin@example.com` / `admin123`
- Test user: `test@example.com` / `password123`

### Admin API Endpoints

All admin endpoints require authentication and admin role. Returns 401 for unauthenticated requests, 403 for non-admin users.

#### GET /api/admin/articles
**Location:** `app/api/admin/articles/route.ts`

List all articles with optional search.

**Query Parameters:**
- `search` (optional) - Search by title, summary, or categories

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Article Title",
      "status": "draft|published|archived",
      "summary": "Brief summary",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      ...
    }
  ]
}
```

#### GET /api/admin/articles/[id]
**Location:** `app/api/admin/articles/[id]/route.ts`

Get a single article by ID.

**Response:**
```json
{
  "article": {
    "id": "uuid",
    "title": "Article Title",
    "slug": "article-slug",
    "content": "Full markdown content",
    "summary": "Brief summary",
    "metaDescription": "SEO description",
    "image": "image-url",
    "sourceUrl": "source-url",
    "categories": "comma,separated,categories",
    "status": "draft|published|archived",
    ...
  }
}
```

#### PUT /api/admin/articles/[id]
Update an article. All fields are editable.

**Request Body:**
```json
{
  "title": "Updated Title",
  "slug": "updated-slug",
  "content": "Updated content",
  "summary": "Updated summary",
  "metaDescription": "Updated meta",
  "image": "new-image-url",
  "sourceUrl": "source-url",
  "categories": "updated,categories",
  "status": "published"
}
```

**Response:**
```json
{
  "article": { ... },
  "message": "Article updated successfully"
}
```

#### DELETE /api/admin/articles/[id]
Permanently delete an article.

**Response:**
```json
{
  "message": "Article deleted successfully"
}
```

### Image Upload API

#### POST /api/upload
**Location:** `app/api/upload/route.ts`

Upload images to Vercel Blob storage.

**Query Parameters:**
- `filename` (required) - Original filename

**Request Body:** Binary file data

**Response:**
```json
{
  "url": "https://blob-url.vercel-storage.com/filename",
  "pathname": "/filename",
  "contentType": "image/jpeg",
  "contentDisposition": "inline; filename=\"filename\""
}
```

### Dashboard UI Components

#### Admin Dashboard Page (app/admin/page.tsx)
Main dashboard layout with two-panel design:
- **Sidebar (left):** Article list with search
- **Main area (right):** Article editor or empty state

Features:
- Session validation on mount
- Admin role verification via API test request
- Loading states with skeletons
- Automatic redirection for non-admin users

#### ArticleList Component (components/admin/article-list.tsx)
Sidebar component for article browsing and selection.

**Features:**
- Real-time search (filters by title and summary)
- Visual status badges (Draft/Published/Archived)
- Active article highlighting
- Scrollable list with custom scrollbar
- Article count footer
- Loading skeletons
- Empty state handling

**UI Elements:**
- Search input with icon
- Clickable article cards showing:
  - Title (truncated, 2 lines max)
  - Status badge (color-coded)
  - Summary (truncated, 2 lines max)
  - Last updated date

#### ArticleEditor Component (components/admin/article-editor.tsx)
Main content editor with complete CRUD functionality.

**Features:**
- **Editing:**
  - All fields editable: title, slug, content, summary, meta description, image, categories, source URL
  - Markdown content editor with monospace font
  - Character counter for meta description (160 chars max)
  - Image preview after upload/URL entry

- **Publishing:**
  - Toggle switch to publish/unpublish articles
  - Visual status badge at top
  - Cannot publish archived articles

- **Change Detection:**
  - Save/Cancel buttons only appear when changes are made
  - Unsaved changes warning before page navigation (browser prompt)
  - Reset to original state on cancel

- **Image Management:**
  - Upload button to select and upload to Vercel Blob
  - Manual URL input option
  - Image preview with responsive sizing
  - Upload progress indication

- **Actions Menu (3-dot menu):**
  - **Archive:** Moves article to archived status (with confirmation)
  - **Delete:** Permanently removes article (with confirmation)

- **Confirmations:**
  - Alert dialogs for destructive actions (archive, delete)
  - Clear descriptions of action consequences

- **Feedback:**
  - Toast notifications for all operations (save, delete, archive, upload)
  - Error handling with user-friendly messages
  - Loading states during async operations

**UI Layout:**
- Header with status badge, publish toggle, actions menu, close button
- Save/Cancel buttons appear below header when changes detected
- Main content area with scrollable form
- All inputs properly labeled with accessible labels
- Responsive design with max-width constraint

### Authorization Helpers (lib/auth-helpers.ts)

Utility functions for server-side authorization:

```typescript
// Get current user session
getSession(): Promise<Session | null>

// Get current user
getCurrentUser(): Promise<User | null>

// Check if user has specific role
hasRole(roleToCheck: string): Promise<boolean>

// Check if user is admin
isAdmin(): Promise<boolean>

// Require authentication (throws if not authenticated)
requireAuth(): Promise<User>

// Require admin role (throws if not admin)
requireAdmin(): Promise<User>
```

**Usage in API routes:**
```typescript
export async function GET(request: NextRequest) {
  await requireAdmin(); // Throws error if not admin
  // ... rest of handler
}
```

### Workflow

1. **Access Dashboard:** Navigate to `/admin` (requires login + admin role)
2. **Browse Articles:** View all articles in sidebar, use search to filter
3. **Select Article:** Click article to load in editor
4. **Edit Article:** Modify any fields, upload images, change status
5. **Save Changes:** Click "Gem" button when ready (appears after changes)
6. **Publish/Unpublish:** Toggle switch to change visibility
7. **Archive:** Use actions menu to archive (keeps data, hides from public)
8. **Delete:** Use actions menu to permanently remove article

### Article Status States

- **draft** (default) - Created by cron, not visible to public, not ready
- **published** - Visible to public, approved by admin
- **archived** - Hidden from public, preserved for records

### Security Features

- Server-side authorization on all admin endpoints
- Session validation with Better-Auth
- Role-based access control (RBAC)
- Protected API routes with error handling
- Automatic redirects for unauthorized access
- No client-side security bypasses

### Error Handling

- 401 Unauthorized - User not authenticated
- 403 Forbidden - User lacks admin role
- 404 Not Found - Article doesn't exist
- 500 Internal Server Error - Server-side failures
- User-friendly toast notifications for all errors

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
   - Image generation with DALL-E

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
