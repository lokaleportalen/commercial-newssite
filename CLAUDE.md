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

**Schema:** user, session, account, verification, role, article, category (PostgreSQL via Drizzle)
**Seed Users:** admin@example.com / admin123, test@example.com / password123

**IMPORTANT - Database Migrations:**
- NEVER create manual migration files (`.sql` files in `database/migrations/`)
- Schema changes are applied using `cd database && npm run push` (drizzle-kit push)
- For production data reset: `cd database && npm run reset` (runs seed/reset.ts)
- Drizzle handles schema diffing automatically via push command
- Migration files are not needed in this project workflow

## Auth & API

**Better-Auth:** `/api/auth/*` (sign-up/in/out), `lib/auth-helpers.ts` (`requireAdmin()`, `isAdmin()`, `hasRole()`)

**Public:** `/api/auth/*`, `/api/upload`
**Admin:** `/api/admin/articles` (CRUD), `/api/admin/trigger-cron` (POST - manually trigger weekly news task)
**Trigger.dev:** `trigger/weekly-news.ts` (scheduled), `trigger/article-processor.ts` (helper)

## Admin CMS

`/admin` - Two-panel layout (list + editor), search, edit all fields, image upload, publish/archive/delete, toast notifications
`/admin/categories` - Category management with hero image upload (Vercel Blob), edit name/slug/description
`/admin/ai-prompts` - AI prompt version management

## Configuration

**Required Env Vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - GPT-4o for article generation
- `GEMINI_API_KEY` - Gemini 3 Pro for image generation
- `TRIGGER_SECRET_KEY` - Trigger.dev authentication
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob for image uploads (article images, category hero images)

**Optional:** `CRON_SECRET` (deprecated - only needed if using old HTTP cron endpoint)

**Config:** TypeScript strict, Tailwind v4 (orange OKLCh theme), ShadCN (new-york style), Drizzle PostgreSQL

## Commands

```bash
# App
npm run dev|build|start|lint

# Database (cd database/)
npm run studio|generate|push|migrate|seed

# Seed Production
cd database && DATABASE_URL="postgresql://..." npx tsx seed/reset.ts
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



## Recent Changes

**2025-12-07:**
- Category hero images - Static hero images for category pages (stored in DB or `public/categories/hero/`)
- User preferences overhaul - Multiple category selection via checkboxes, grid layout, database-driven categories, email frequency changed to weekly
- Admin category management - Upload/manage hero images via `/admin/categories` (Vercel Blob)
- CategoryHero component redesign - Removed featured article logic, simplified to static branding

**2025-12-01:** Article paywall implementation - unauthenticated users see preview (first 400 chars) with blurred content and sign-up CTA, authenticated users see full articles
**2025-11-28:** Trigger.dev v4 integration for weekly news - scheduled tasks (Wednesdays 6 AM CET), Europe/Copenhagen timezone, no timeouts, automatic retries, manual trigger endpoint
**2025-11-26:** Gemini 3 Pro image generation for articles, Vercel Blob upload
**2025-11-25:** Component reorganization (article/, auth/, profile/, layout/), Vitest + RTL testing (120 tests), Admin CMS with CRUD API, roles system, image upload
**Earlier:** Auth (Better-Auth), GPT-4o article generation, cron job, ShadCN UI, Drizzle ORM, category pages, hero section

## Future Enhancements

**Auth:** OAuth, password reset, email verification
**Articles:** Listing/detail pages, category filtering, search, ~~image generation~~ ✅, ~~paywall~~ ✅
**Admin:** ~~Panel/editing/publishing~~ ✅, analytics, bulk actions, scheduling
**Technical:** Form validation (zod), protected routes, error boundaries, RSS, duplicate detection
**SEO:** Metadata, image optimization, static generation, sitemap

## Troubleshooting

**Missing API keys:** Add to `.env`, restart server
**DB errors:** Check `DATABASE_URL`, verify PostgreSQL running, apply migrations (`cd database && npm run push`)
**Unauthorized:** Verify `CRON_SECRET` and `Authorization: Bearer <secret>` header
**Articles missing:** Check status="published", view in Drizzle Studio
**Rate limits:** Implement retry logic, reduce items per run
**Images not generating:** Add `GEMINI_API_KEY` (optional - articles save without images)

---

Last Updated: 2025-12-01


<!-- TRIGGER.DEV config START -->
# Trigger.dev Configuration (v4)

**Basic Config:** `defineConfig({ project, dirs: ["./trigger"], runtime: "node", retries, build: { extensions } })`

**Build Extensions:**
- **Prisma:** `prismaExtension({ schema, migrate: true })`
- **Python:** `pythonExtension({ scripts: ["./python/**/*.py"], requirementsFile })`
- **Browser:** `playwright({ browsers: ["chromium"] })`, `puppeteer()`
- **Media:** `ffmpeg({ version: "7" })`, `audioWaveform()`
- **System:** `aptGet({ packages: ["imagemagick"] })`, `additionalFiles({ files: ["./assets/**"] })`
- **Env:** `syncEnvVars(async (ctx) => [{ name, value }])`

**Machine Presets:** micro (0.25 vCPU, 0.25GB) → small-1x (0.5, 0.5) → medium-1x (1, 2) → large-2x (8, 16GB)

<!-- TRIGGER.DEV config END -->

<!-- TRIGGER.DEV advanced-tasks START -->
# Trigger.dev Advanced Tasks (v4)

**Tags:** `tags.add("user_123")`, trigger with `{ tags: ["priority"] }` (max 10, 1-64 chars)
**Queues:** `queue({ name, concurrencyLimit: 5 })`, task-level: `queue: { concurrencyLimit: 1 }`
**Retries:** `retry: { maxAttempts: 10, factor: 1.8, minTimeoutInMs, maxTimeoutInMs }`, `catchError`, `retry.onThrow()`, `retry.fetch()`
**Machines:** `machine: { preset: "large-2x" }`, override on trigger
**Idempotency:** `idempotencyKeys.create("payment-123")`, trigger with `{ idempotencyKey, idempotencyKeyTTL: "24h" }`
**Metadata:** `metadata.set("progress", 50)`, `.increment()`, `.append()`, `metadata.parent.set()`, `metadata.root.increment()`
**Advanced Trigger:** `delay: "2h"`, `ttl: "24h"`, `priority: 100`, `tags`, `queue`, `machine`, `maxAttempts`
**Logging:** `logger.info/debug/error()`, `logger.trace("operation", async (span) => { span.setAttribute() })`
**Usage:** `usage.getCurrent()`, `usage.measure(async () => { })`
**Management:** `runs.cancel/replay/retrieve("run_123")`

**Best Practices:** Queues for rate limiting, exponential backoff, idempotency for critical ops, metadata for progress, match machine to workload, external storage for >10MB

<!-- TRIGGER.DEV advanced-tasks END -->

<!-- TRIGGER.DEV basic START -->
# Trigger.dev Basic Tasks (v4)

**MUST use `@trigger.dev/sdk` (v4), NEVER `client.defineJob` (v2)**

**Basic Task:** `task({ id, retry: { maxAttempts, factor, minTimeoutInMs, maxTimeoutInMs }, run: async (payload) => { } })`
**Schema Task:** `schemaTask({ id, schema: z.object({ }), run: async (payload) => { } })`
**Scheduled:** `schedules.task({ id, cron: "0 9 * * *", run: async (payload) => { } })`

**Trigger from Backend:** `tasks.trigger<typeof taskName>("task-id", payload)`, `tasks.batchTrigger()`
**Trigger from Task:** `childTask.trigger(payload)`, `childTask.triggerAndWait(payload)` (returns `Result { ok, output, error }`), `.unwrap()`, `batchTriggerAndWait()`
**Wait:** `wait.for({ seconds/minutes/hours/days })`, `wait.until({ date })`, `wait.forToken({ token, timeoutInSeconds })`

**Important:** NEVER wrap `triggerAndWait`, `batchTriggerAndWait`, or `wait` in `Promise.all/allSettled`. Check `result.ok` before accessing `result.output`.

<!-- TRIGGER.DEV basic END -->