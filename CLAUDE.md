# Commercial Real Estate News Site - Development Documentation

## Project Overview
This is a Next.js 16 application for publishing commercial real estate news articles focused on Denmark. The application includes automated news gathering and article generation powered by OpenAI's GPT-4.

## Recent Implementation: Automated News Article System

### Features Implemented
1. **Weekly News Gathering Cron Job** - Automated system to fetch Danish commercial real estate news
2. **AI-Powered Article Writing** - Automated research and article generation using OpenAI
3. **Article Database** - PostgreSQL database schema for storing articles
4. **Protected API Endpoints** - Secure endpoints with token authentication

---

## Database Schema

### Articles Table
Location: `database/schema/articles-schema.ts`

**Fields:**
- `id` (UUID, Primary Key) - Unique article identifier
- `title` (Text, Not Null) - Article headline
- `slug` (Text, Not Null, Unique) - URL-friendly identifier
- `content` (Text, Not Null) - Full article content in markdown
- `summary` (Text) - Brief article summary (2-3 sentences)
- `metaDescription` (Text) - SEO meta description (150-160 chars)
- `image` (Text) - Featured image URL
- `sourceUrl` (Text) - Original news source URL
- `categories` (Text) - Comma-separated categories
- `status` (Text, Default: 'draft') - Article status: draft, published, archived
- `publishedDate` (Timestamp) - When article was published
- `createdAt` (Timestamp, Auto) - Record creation timestamp
- `updatedAt` (Timestamp, Auto) - Last update timestamp

**Migration:**
Generated migration file: `database/drizzle/0001_solid_ser_duncan.sql`

To apply migration to database:
```bash
cd database
npm run push
```

---

## API Endpoints

### 1. Weekly News Cron Job
**Endpoint:** `GET /api/cron/weekly-news`

**Location:** `app/api/cron/weekly-news/route.ts`

**Purpose:**
- Triggered weekly by cron service (Vercel Cron, GitHub Actions, etc.)
- Fetches list of Danish commercial real estate news from ChatGPT
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

---

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

## Environment Variables

### Required Variables
Location: `.env` (copy from `.env.example`)

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

### Getting API Keys

**OpenAI API Key:**
1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env` as `OPENAI_API_KEY`

**Cron Secret:**
Generate random secret:
```bash
openssl rand -base64 32
```

---

## Setting Up Weekly Cron Job

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/weekly-news",
    "schedule": "0 9 * * 1"
  }]
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
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

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

# Apply database migration
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

## Future Enhancements

### Potential Improvements:
1. **Image Generation:** Use DALL-E to generate featured images
2. **Article Review:** Add admin panel for reviewing before publishing
3. **Email Notifications:** Notify admin when articles are created
4. **RSS Feed:** Expose articles via RSS for syndication
5. **SEO Optimization:** Auto-generate additional SEO metadata
6. **Source Verification:** Validate news sources before processing
7. **Duplicate Detection:** Check for existing similar articles
8. **Analytics:** Track article performance and engagement

---

## Troubleshooting

### Common Issues:

**Error: "OpenAI API key not configured"**
- Add `OPENAI_API_KEY` to `.env` file
- Restart development server

**Error: "Please provide required params for Postgres driver: url: undefined"**
- Add `DATABASE_URL` to `.env` file
- Verify PostgreSQL is running

**Error: "Unauthorized"**
- Check `CRON_SECRET` matches in request and `.env`
- Verify `Authorization` header format: `Bearer <secret>`

**Articles not appearing:**
- Check database connection
- Verify migration was applied: `cd database && npm run push`
- Check article `status` field (should be "published")

**OpenAI rate limits:**
- Implement retry logic with exponential backoff
- Reduce number of news items processed per run
- Consider upgrading OpenAI plan

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** OpenAI GPT-4o
- **Authentication:** better-auth
- **UI:** React 19, Tailwind CSS 4, ShadCN components
- **Styling:** Radix UI primitives

---

## File Structure

```
commercial-newssite/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/route.ts
│   │   ├── cron/
│   │   │   └── weekly-news/route.ts      # Weekly news fetching
│   │   └── articles/
│   │       └── process/route.ts           # Article processing
│   ├── layout.tsx
│   └── page.tsx
├── database/
│   ├── schema/
│   │   ├── index.ts
│   │   ├── auth-schema.ts
│   │   └── articles-schema.ts             # Article table schema
│   ├── drizzle/
│   │   └── 0001_solid_ser_duncan.sql      # Article migration
│   ├── db.ts
│   └── drizzle.config.ts
├── .env                                    # Environment variables (gitignored)
├── .env.example                            # Environment template
├── package.json
└── CLAUDE.md                               # This file
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Database operations (run from /database directory)
cd database
npm run studio      # Open Drizzle Studio
npm run generate    # Generate migrations
npm run push        # Push schema to database
npm run migrate     # Run migrations
npm run seed        # Seed database

# Build for production
npm run build
npm start
```

---

Last Updated: 2025-11-13
