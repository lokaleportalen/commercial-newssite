# Commercial Newssite - Lokaleportalen.dk

A fully automated AI-powered newssite for Danish commercial real estate, featuring automated content generation, intelligent email delivery, and a comprehensive admin CMS.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [AI Content Generation](#ai-content-generation)
- [Email System](#email-system)
- [Admin CMS](#admin-cms)
- [API Documentation](#api-documentation)
- [Trigger.dev Tasks](#triggerdev-tasks)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Overview

This is an enterprise-grade newssite built with Next.js 16 that automatically generates high-quality articles about Danish commercial real estate using AI. The system runs fully autonomously, from content generation to user engagement through personalized email notifications.

**Primary Use Case:** Automatically publish weekly news articles about commercial real estate trends, market analysis, and industry insights, delivered to subscribers based on their category preferences and email frequency settings.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   Frontend   │  │  API Routes  │  │  Admin Dashboard   │   │
│  │ (React 19)   │  │              │  │      (CMS)         │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │           Core Services Layer               │
        ├─────────────────────────────────────────────┤
        │  Better-Auth  │  Drizzle ORM  │  Vercel    │
        │  (Session)    │  (PostgreSQL) │  Blob      │
        └─────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴───────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────────┐                    ┌──────────────────────┐
│  Trigger.dev v4  │                    │   AI Services        │
│  ────────────    │                    │   ──────────────     │
│  • Weekly News   │                    │   • OpenAI GPT-5    │
│  • Email Digest  │                    │   • Google Gemini    │
│  • Notifications │                    │     3 Pro            │
└──────────────────┘                    └──────────────────────┘
        │                                             │
        └─────────────────────┬───────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Mailgun API     │
                    │  (Email Delivery)│
                    └──────────────────┘
```

### Data Flow

#### 1. Article Generation Flow
```
Sunday 6 AM (Trigger.dev Cron)
    │
    ├─→ Fetch news topics (GPT-5 web search)
    │
    ├─→ For each topic:
    │   ├─→ Research & write article (GPT-5)
    │   ├─→ Generate image (Gemini 3 Pro)
    │   ├─→ Upload to Vercel Blob
    │   └─→ Save to PostgreSQL (status: draft)
    │
    └─→ Admin reviews & publishes via CMS
        │
        └─→ Triggers immediate email notifications
```

#### 2. Email Delivery Flow
```
Article Published
    │
    ├─→ Immediate Notifications (Trigger.dev)
    │   ├─→ Filter users: frequency = "immediate"
    │   ├─→ Filter by category preferences
    │   └─→ Send via Mailgun
    │
User Signup
    │
    └─→ Welcome Email (Better-Auth Hook)
        └─→ Send via Mailgun

Saturday 10 AM (Trigger.dev Cron)
    │
    └─→ Weekly Digest
        ├─→ Fetch past week's articles
        ├─→ Filter users by category preferences
        └─→ Send digest via Mailgun
```

#### 3. Authentication Flow
```
User Signs Up
    │
    ├─→ Better-Auth creates session
    ├─→ Role assigned (default: user)
    ├─→ Session stored with role data
    ├─→ Welcome email sent
    └─→ Redirect to /profile/preferences

User Signs In
    │
    ├─→ Better-Auth validates credentials
    ├─→ Session created with custom data
    │   └─→ Includes: userId, email, role
    └─→ Role available instantly (no DB query)
```

## Technology Stack

### Core Framework
- **Next.js 16** - App Router, React Server Components
- **React 19** - Latest features with server/client components
- **TypeScript** - Strict mode for type safety

### Database & ORM
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe database queries
- **Drizzle Kit** - Schema management (push-based, no migrations)

### Authentication
- **Better-Auth v1.3** - Session-based auth with custom session data
- **Custom Session Plugin** - Stores role data in session for zero-latency access

### AI Services
- **OpenAI GPT-5** - Article research, writing, and topic generation
- **Google Gemini 3 Pro** - AI image generation for articles

### Background Tasks
- **Trigger.dev v4** - Scheduled tasks and event-driven workflows
  - No timeout limitations
  - Automatic retries
  - Built-in progress tracking
  - Europe/Copenhagen timezone support

### Email System
- **React Email** - Component-based email templates
- **Mailgun API** - Email delivery service
- **Tailwind CSS** - Email template styling

### Storage
- **Vercel Blob** - Image storage (article images, category hero images)

### UI Framework
- **Tailwind CSS v4** - Utility-first styling with OKLCh color space
- **ShadCN UI** - Accessible component library (new-york style)
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library

### Rich Text Editing
- **Tiptap** - WYSIWYG editor for article content
- **Novel** - Enhanced Tiptap wrapper with AI features

### Testing
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **JSDOM** - DOM implementation for tests

## Key Features

### 1. Automated Content Generation
- Weekly automated news fetching (Sundays 6 AM)
- AI-powered article writing with GPT-5
- Automatic image generation with Gemini 3 Pro
- Drafts saved for admin review before publishing

### 2. Intelligent Email System
- Welcome emails on signup
- Immediate article notifications (filtered by preferences)
- Weekly digest emails (Saturdays 10 AM)
- Password reset emails
- One-click unsubscribe
- Category-based filtering

### 3. Admin CMS
- Two-panel layout (article list + editor)
- Real-time search and filtering
- Rich text editor (Tiptap)
- Image upload and regeneration
- Publish/archive/delete workflows
- Category management with hero images
- AI prompt version control

### 4. User Preferences
- Multiple category subscriptions
- Email frequency control (immediate/weekly)
- Preference-based content filtering
- One-click preference updates

### 5. Paywall System
- Unauthenticated users see 400-character preview
- Blurred content with signup CTA
- Full access for authenticated users

### 6. Security Features
- Session-based role storage (zero-latency)
- Admin-only API routes
- CORS and origin validation
- Token-based unsubscribe
- Environment variable protection

## Getting Started

### Prerequisites

```bash
Node.js >= 20.x
PostgreSQL >= 14.x
npm or yarn or pnpm
```

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd commercial-newssite
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Set up the database
```bash
cd database
npm install
npm run push      # Apply schema to database
npm run seed      # Seed with test data
cd ..
```

5. Run development server
```bash
npm run dev
```

6. Access the application
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- Email Preview: http://localhost:3001 (run `npm run email:dev`)

### Default Login Credentials

After seeding:
- **Admin:** admin@example.com / admin123
- **Test User:** test@example.com / password123

## Project Structure

```
commercial-newssite/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin dashboard pages
│   │   ├── categories/           # Category management
│   │   ├── ai-prompts/           # AI prompt version control
│   │   └── page.tsx              # Main admin CMS
│   ├── api/                      # API routes
│   │   ├── auth/[...all]/        # Better-Auth endpoints
│   │   ├── admin/                # Admin-only APIs
│   │   │   ├── articles/         # Article CRUD
│   │   │   ├── categories/       # Category CRUD
│   │   │   └── trigger-cron/     # Manual task triggers
│   │   ├── email/                # Email endpoints
│   │   │   └── unsubscribe/      # One-click unsubscribe
│   │   └── upload/               # Image upload
│   ├── (auth)/                   # Auth pages (login, signup, etc.)
│   ├── categories/[slug]/        # Category pages
│   └── artikler/[slug]/          # Article detail pages
│
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   │   ├── article-editor.tsx    # Rich text editor
│   │   ├── article-list.tsx      # Article management
│   │   └── category-form.tsx     # Category editor
│   ├── article/                  # Article display components
│   ├── auth/                     # Auth forms and UI
│   ├── profile/                  # User profile components
│   ├── layout/                   # Layout components (nav, footer)
│   └── ui/                       # ShadCN UI components
│
├── database/                     # Database configuration
│   ├── schema/                   # Drizzle schema definitions
│   │   ├── auth-schema.ts        # User, session, account
│   │   ├── articles-schema.ts    # Article table
│   │   ├── categories-schema.ts  # Category table
│   │   ├── roles-schema.ts       # Role table
│   │   ├── user-preferences-schema.ts
│   │   ├── email-logs-schema.ts
│   │   ├── ai-prompts-schema.ts
│   │   └── index.ts              # Schema exports
│   ├── seed/                     # Seed scripts
│   │   └── reset.ts              # Database reset & seed
│   └── db.ts                     # Database connection
│
├── emails/                       # React Email templates
│   ├── welcome-email.tsx         # Welcome email
│   ├── article-notification.tsx  # New article notification
│   ├── weekly-digest.tsx         # Weekly digest
│   └── password-reset.tsx        # Password reset
│
├── lib/                          # Utility functions
│   ├── auth.ts                   # Better-Auth server config
│   ├── auth-client.ts            # Better-Auth client
│   ├── auth-helpers.ts           # Auth helper functions
│   ├── email.ts                  # Email sending functions
│   └── utils.ts                  # General utilities
│
├── trigger/                      # Trigger.dev tasks
│   ├── weekly-news.ts            # Fetch & generate weekly news
│   ├── article-processor.ts      # Process individual articles
│   ├── weekly-digest.ts          # Send weekly email digest
│   └── send-article-notifications.ts # Immediate notifications
│
└── test/                         # Test files (co-located)
    └── */test/                   # Component-specific tests
```

## Database Schema

### Core Tables

#### Users & Authentication
- **user** - User accounts (email, name, createdAt)
- **session** - Active sessions with custom data (role, userId)
- **account** - OAuth accounts (future use)
- **verification** - Email verification tokens
- **role** - User roles (admin, editor, user)

#### Content
- **article** - Articles (title, content, category, status, imageUrl)
- **category** - Content categories (name, slug, description, heroImageUrl)

#### User Preferences
- **userPreference** - Category subscriptions and email frequency
  - userId (FK → user)
  - categoryId (FK → category)
  - emailFrequency ('immediate' | 'weekly')

#### AI Management
- **aiPrompt** - AI prompt templates
- **aiPromptVersion** - Version history for prompts

#### Email Tracking
- **emailLog** - Email delivery history
- **emailTemplate** - Email template storage

#### System
- **systemSetting** - Application configuration

### Key Relationships

```
user (1) ─────→ (N) session
user (1) ─────→ (N) userPreference
category (1) ──→ (N) userPreference
category (1) ──→ (N) article
aiPrompt (1) ──→ (N) aiPromptVersion
```

### Database Management

```bash
# Navigate to database directory
cd database

# View database in Drizzle Studio
npm run studio

# Apply schema changes (no migrations needed!)
npm run push

# Reset database (production)
DATABASE_URL="postgresql://..." npx tsx seed/reset.ts

# Generate TypeScript types
npm run generate
```

**Important:** This project uses Drizzle's push-based workflow. No manual migration files are needed. Schema changes are applied directly using `npm run push`.

## Authentication & Authorization

### Better-Auth Configuration

The system uses Better-Auth v1.3 with a custom session plugin for performance optimization.

#### Session-Based Role Storage

Instead of querying the database for role information on every request, roles are stored directly in the session:

```typescript
// Session structure
{
  userId: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  createdAt: Date;
}
```

#### Auth Helper Functions

Located in `lib/auth-helpers.ts`:

- **getSession()** - Retrieve current session with role data
- **requireAuth()** - Ensure user is authenticated
- **requireAdmin()** - Ensure user has admin role
- **isAdmin(session)** - Check if session has admin role
- **hasRole(session, role)** - Check specific role

### Protected Routes

- **/admin/*** - Admin role required
- **/api/admin/*** - Admin role required
- **/profile/*** - Authentication required
- **/api/auth/*** - Public (signup, login, etc.)

## AI Content Generation

### Article Generation Pipeline

The system uses a multi-stage AI pipeline to generate high-quality articles:

#### Stage 1: Topic Discovery (GPT-5)
- Web search for latest commercial real estate news
- Filters for Danish market relevance
- Returns structured list of topics

#### Stage 2: Article Creation (GPT-5)
- Deep research on selected topic
- Structured writing with Danish language
- SEO-optimized content
- JSON mode for consistent output

#### Stage 3: Image Generation (Gemini 3 Pro)
- Generates relevant visual for article
- Based on article content and custom descriptions
- Uploaded to Vercel Blob
- Fallback handling if generation fails

### AI Prompt Management

Admins can manage AI prompts via `/admin/ai-prompts`:
- Version control for prompts
- A/B testing different prompts
- Rollback to previous versions
- Track performance metrics

### Article Regeneration

Admins can regenerate article images:
1. Click "Generer nyt billede" in editor
2. Optional: Add custom description
3. View side-by-side comparison
4. Choose preferred image
5. Rejected image auto-deleted from Vercel Blob

## Email System

### Email Templates

All templates built with React Email and styled with Tailwind CSS:

1. **welcome-email.tsx** - Sent on user signup
2. **article-notification.tsx** - Immediate article alerts
3. **weekly-digest.tsx** - Weekly roundup (Saturdays 10 AM)
4. **password-reset.tsx** - Password reset flow

### Email Delivery Flow

#### Welcome Email
```
User signs up → Better-Auth hook → sendWelcomeEmail() → Mailgun
```

#### Immediate Notifications
```
Admin publishes article → Trigger.dev task → Filter users (immediate + category match) → Send via Mailgun
```

#### Weekly Digest
```
Saturday 10 AM cron → Fetch past week's articles → Filter by user preferences → Send digest
```

### Email Functions

All email sending functions are located in `lib/email.ts` and integrate with Mailgun for delivery.

### Unsubscribe System

One-click unsubscribe flow:
1. Email contains unsubscribe link with token
2. User clicks link → `/api/email/unsubscribe?token=xxx`
3. System removes all category preferences
4. Sets email frequency to 'weekly' (effectively unsubscribed)
5. Confirmation page shown

### Email Preview

```bash
npm run email:dev
# Opens preview at http://localhost:3001
```

## Admin CMS

### Features

- **Two-Panel Layout** - Article list on left, editor on right
- **Real-Time Search** - Filter articles by title/content
- **Rich Text Editor** - Tiptap-based WYSIWYG editor
- **Image Management** - Upload, regenerate, compare images
- **Status Workflow** - Draft → Published → Archived
- **Category Management** - Create/edit categories with hero images
- **Toast Notifications** - User feedback for all actions

### Admin Workflows

#### Publishing an Article
1. Navigate to `/admin`
2. Select draft article from list
3. Review content in editor
4. Optionally regenerate image
5. Click "Publicer artikel"
6. Immediate notifications triggered automatically

#### Managing Categories
1. Navigate to `/admin/categories`
2. Create new category or edit existing
3. Upload hero image (Vercel Blob)
4. Set name, slug, description
5. Save changes

#### Managing AI Prompts
1. Navigate to `/admin/ai-prompts`
2. View all prompts and versions
3. Create new version
4. Activate/deactivate versions
5. Track performance

## API Documentation

### Public Endpoints

#### Authentication
- `POST /api/auth/sign-up` - Create account
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password

#### Email
- `GET /api/email/unsubscribe?token=xxx` - Unsubscribe from emails

#### File Upload
- `POST /api/upload` - Upload images (authenticated)

### Admin Endpoints

#### Articles
- `GET /api/admin/articles` - List all articles
- `GET /api/admin/articles/[id]` - Get single article
- `POST /api/admin/articles` - Create article
- `PATCH /api/admin/articles/[id]` - Update article
- `DELETE /api/admin/articles/[id]` - Delete article (deletes blob image)
- `POST /api/admin/articles/notify` - Manually trigger notifications

#### Categories
- `GET /api/admin/categories` - List categories
- `GET /api/admin/categories/[id]` - Get category
- `POST /api/admin/categories` - Create category
- `PATCH /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category (deletes blob image)

#### System
- `POST /api/admin/trigger-cron` - Manually trigger weekly news task

### API Response Format

```typescript
// Success
{
  data: T;
  message?: string;
}

// Error
{
  error: string;
  details?: unknown;
}
```

## Trigger.dev Tasks

All background tasks run on Trigger.dev v4 with no timeout limitations.

### Scheduled Tasks

#### weekly-news.ts
```typescript
Schedule: Sundays at 6 AM (Europe/Copenhagen)
Purpose: Fetch and generate weekly articles
Flow:
  1. GPT-5 fetches news topics
  2. For each topic:
     - Research with GPT-5
     - Write article with GPT-5
     - Generate image with Gemini
     - Upload to Vercel Blob
     - Save as draft
  3. Admin reviews before publishing
```

#### weekly-digest.ts
```typescript
Schedule: Saturdays at 10 AM (Europe/Copenhagen)
Purpose: Send weekly email digest
Flow:
  1. Fetch articles from past week
  2. Get users with 'weekly' frequency
  3. Filter by category preferences
  4. Send digest via Mailgun
  5. Log email delivery
```

### Event-Driven Tasks

#### send-article-notifications.ts
```typescript
Trigger: When article status changes to 'published'
Purpose: Send immediate notifications
Flow:
  1. Get users with 'immediate' frequency
  2. Filter by category preferences
  3. Send notification via Mailgun
  4. Log email delivery
```

#### article-processor.ts
```typescript
Trigger: Called by weekly-news task
Purpose: Process individual article
Flow:
  1. Research topic with GPT-5
  2. Write article with GPT-5
  3. Generate image with Gemini
  4. Upload to Vercel Blob
  5. Return article data
```

### Manual Triggers

```bash
# Trigger weekly news manually
curl -X POST http://localhost:3000/api/admin/trigger-cron \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Trigger article notification
curl -X POST http://localhost:3000/api/admin/articles/notify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"articleId": "123"}'
```

### Development

```bash
# Run Trigger.dev dev server
npx trigger.dev@latest dev

# Deploy tasks
npx trigger.dev@latest deploy
```

### Monitoring

View task runs at: https://cloud.trigger.dev

## Testing

### Test Structure

Tests are co-located with components in `test/` subdirectories:

```
components/
  article/
    article-preview.tsx
    test/
      article-preview.test.tsx
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Interactive UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Testing Guidelines

1. Write tests for all custom components
2. Test user interactions with user-event
3. Mock API calls and external dependencies
4. Test edge cases and error states
5. Maintain >80% code coverage

## Deployment

### Vercel Deployment (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

### Environment Setup

Required for production:
- PostgreSQL database (Vercel Postgres, Railway, etc.)
- Vercel Blob storage
- Trigger.dev account (cloud or self-hosted)
- Mailgun account
- OpenAI API key
- Google Gemini API key

### Database Migration

```bash
# Production database setup
cd database
DATABASE_URL="postgresql://prod-url" npm run push
DATABASE_URL="postgresql://prod-url" npx tsx seed/reset.ts
```

### Trigger.dev Deployment

```bash
# Deploy tasks to Trigger.dev cloud
npx trigger.dev@latest deploy
```

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication (Better-Auth)
BETTER_AUTH_SECRET=random-32-char-string
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Services
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...

# Email (Mailgun)
MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_HOST=https://api.eu.mailgun.net

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Background Tasks (Trigger.dev)
TRIGGER_SECRET_KEY=tr_dev_...
```

### Optional Variables

```bash
# Legacy cron (deprecated)
CRON_SECRET=your-secret

# Development
NODE_ENV=development
```

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Better-Auth Documentation](https://better-auth.vercel.app)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [React Email Documentation](https://react.email)
- [Mailgun API Documentation](https://documentation.mailgun.com)

## License

Private and proprietary.

## Contributors

For development questions and implementation details, see CLAUDE.md.

---

Last Updated: 2026-01-08
