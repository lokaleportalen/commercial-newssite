# Commercial Newssite Architecture Documentation

## Project Overview

This is a Next.js 16 full-stack web application for "Nyheder" (News), a commercial newssite that is part of Lokaleportalen.dk. It implements a complete authentication system with PostgreSQL database, comprehensive UI components, and production-ready architecture.

### Technology Stack
- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Drizzle ORM  
- **Authentication**: Better-Auth with email/password support
- **Styling**: Tailwind CSS v4 with custom orange theme
- **UI Components**: ShadCN/UI built on Radix UI primitives
- **Type Safety**: TypeScript with strict mode

---

## Directory Structure

```
app/                   # Next.js App Router
  ├── api/auth/       # Better-Auth API routes
  ├── login/          # Login page
  ├── signup/         # Signup page  
  ├── page.tsx        # Home page
  ├── layout.tsx      # Root layout
  └── globals.css     # Global styles

components/           # React components
  ├── ui/             # ShadCN UI library
  ├── login-form.tsx  # Login form
  └── signup-form.tsx # Signup form

database/             # Database setup
  ├── db.ts           # Drizzle connection
  ├── schema/         # Table definitions
  ├── drizzle/        # Migrations
  └── seed/           # Seeding scripts

lib/                  # Utilities
  ├── auth.ts         # Better-Auth server
  ├── auth-client.ts  # Better-Auth client
  └── utils.ts        # Helper functions
```

---

## Technology Stack

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.0.1 | React framework |
| react | 19.2.0 | UI library |
| better-auth | 1.3.34 | Authentication |
| drizzle-orm | 0.44.7 | Database ORM |
| pg | 8.16.3 | PostgreSQL driver |
| tailwindcss | 4 | CSS framework |
| lucide-react | 0.553.0 | Icons |
| class-variance-authority | 0.7.1 | Variants |

---

## Database Architecture

### Connection (database/db.ts)

PostgreSQL via Drizzle ORM with node-postgres pool:
- Pool-based connection management
- DATABASE_URL from environment
- Type-safe query API

### Schema (database/schema/auth-schema.ts)

Four main tables:

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

### Migrations

File: database/drizzle/0000_unique_mattie_franklin.sql

Creates all tables with:
- Primary keys
- UNIQUE constraints
- Foreign keys with CASCADE
- Default timestamp values

### Seeding

- seed.ts: Main entry point
- auth-seed.ts: Creates test user
  - Email: test@example.com
  - Password: password123

---

## Authentication System

### Server Config (lib/auth.ts)

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true }
})
```

PostgreSQL database, email/password auth enabled.

### Client Config (lib/auth-client.ts)

```typescript
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000"
})
```

Client-side state and API calls.

### API Routes (app/api/auth/[...all]/route.ts)

Catch-all handler:
- POST /api/auth/sign-up
- POST /api/auth/sign-in
- POST /api/auth/sign-out
- Session and OAuth endpoints

---

## Application Routes

**Home** (app/page.tsx): Empty, ready for content

**Login** (app/login/page.tsx): LoginForm in centered layout

**Signup** (app/signup/page.tsx): SignupForm in centered layout

**Root Layout** (app/layout.tsx): Title "Nyheder", global styles

---

## Components

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

**Button**: Variants (default, destructive, outline, secondary, ghost, link), sizes (sm, default, lg, icon)

**Card**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction

**Input**: Styled input element with focus states

**Field**: Complex form system - Field, FieldGroup, FieldLabel, FieldContent, FieldDescription, FieldError, FieldSeparator, FieldSet, FieldLegend

**Other**: Label, Separator, NavigationMenu

---

## Styling & Theme

### Global Styles (app/globals.css)

Tailwind v4 with OKLCh colors:

**Primary: Orange**
- Light: oklch(0.646 0.222 41.116)
- Dark: oklch(0.705 0.213 47.604)

**Color System**:
- Background/Foreground
- Card, Popover
- Primary, Secondary
- Muted, Accent
- Destructive, Border, Input, Ring
- Chart colors (1-5)
- Sidebar colors

**Radius**: 0.65rem base with sm, md, lg, xl variants

**Dark Mode**: Via .dark class selector

---

## Configuration

### TypeScript (tsconfig.json)
- ES2017 target
- Strict mode
- @ alias to ./

### Environment (.env)
```
DATABASE_URL=postgresql://user:password@host:5432/db
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

## Development

### Scripts
```
npm run dev    - Dev server (:3000)
npm run build  - Production build
npm run start  - Production server
npm run lint   - ESLint
```

### Database
```
drizzle-kit generate  - Generate migration
drizzle-kit migrate   - Apply migrations
tsx database/seed/seed.ts - Seed database
drizzle-kit studio    - Visual editor
```

---

## Data Flow

### Authentication
1. User submits form
2. POST /api/auth/sign-in or sign-up
3. Better-Auth validates
4. Drizzle queries PostgreSQL
5. Session created if valid
6. Token returned
7. Client stores session

### Components
```
Page (Server)
  └── Form (Client)
      ├── Card
      ├── FieldGroup
      │  └── Field
      │     ├── Input
      │     └── Label
      └── Button
```

---

## Key Patterns

### React
- Function components
- "use client" where needed
- Server components default
- Hooks: useMemo in Field
- ComponentProps<T> for typing

### TypeScript
- Strict mode
- ComponentProps<T>
- VariantProps from CVA

### Styling
- Tailwind classes
- CVA variants
- CSS variables
- Dark mode

### Database
- Drizzle ORM
- FK with CASCADE
- Auto-update timestamps
- UNIQUE constraints

---

## Key Files

| File | Purpose |
|------|---------|
| lib/auth.ts | Auth server |
| lib/auth-client.ts | Auth client |
| database/db.ts | DB connection |
| database/schema/auth-schema.ts | Tables |
| app/api/auth/[...all]/route.ts | Auth API |
| app/globals.css | Theme |
| components/login-form.tsx | Login UI |
| components/signup-form.tsx | Signup UI |

---

## Recent Changes

- Added ShadCN components and orange theme
- Implemented Drizzle with PostgreSQL
- Set up Better-Auth authentication
- Created seed data

---

## Future Enhancements

1. OAuth (Google/GitHub)
2. Form validation (zod/react-hook-form)
3. Home page content
4. Protected routes
5. Password reset
6. Error boundaries
7. Loading states
8. Session persistence
9. Article database schema
10. API client wrapper

---

## Quality Features

- TypeScript strict mode
- Accessibility (ARIA, semantic HTML)
- Type-safe queries
- Referential integrity
- Secure sessions
- Modern CSS (Tailwind v4)
