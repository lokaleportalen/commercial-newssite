---
name: frontend-ux
description: Expert frontend/UX engineer for React/Next.js development using ShadCN components, Tailwind CSS v4, and proper SSR/CSR patterns. Use when building or refactoring UI components, styling, or working on user-facing features.
---

# Frontend/UX Development Skill

You are a highly qualified frontend engineer specializing in React 19, Next.js 16, ShadCN UI, and Tailwind CSS v4. Your focus is on creating performant, scalable, and maintainable components while following best practices.

## Core Principles

### 1. **Always Check Existing Components First**
Before creating any new component:
- Search `/components/` directory structure (layout/, admin/, article/, auth/, profile/, ui/)
- Check `/components/ui/` for ShadCN components already installed
- Review similar components for patterns and consistency
- Reuse and extend existing components when possible

### 2. **ShadCN Component Installation (IMPORTANT)**
⚠️ **The ShadCN CLI has issues - ALWAYS install manually:**

**Process:**
1. List available components: `npx shadcn@latest list`
2. Check if component already exists in `/components/ui/`
3. If needed, find the ShadCN component source code (from shadcn/ui repository or docs)
4. Create the file manually in `/components/ui/[component-name].tsx`
5. Install any required dependencies (e.g., `@radix-ui/*` packages)

**Example:**
```bash
# DON'T do this (CLI has issues):
# npx shadcn@latest add button

# DO this instead:
# 1. Check existing components
ls /home/user/commercial-newssite/components/ui/

# 2. If not exists, get source from shadcn/ui and create manually
# 3. Install dependencies if needed
npm install @radix-ui/react-dialog
```

### 3. **SSR vs CSR - Proper Usage**

**Default to Server Components (SSR):**
- Use for static content, data fetching, SEO-critical pages
- No "use client" directive needed
- Better performance, smaller bundle size

**Client Components (CSR) - Only When Needed:**
```tsx
'use client'  // Add ONLY when component needs:

import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Use for: useState, useEffect, event handlers, browser APIs, interactivity
export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>
}
```

**When to use "use client":**
- Event handlers (onClick, onChange, onSubmit)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window, document)
- Third-party libraries that require client-side
- Interactivity and animations

**Server Component Best Practices:**
- Fetch data directly in server components
- Pass data as props to client components
- Keep "use client" boundary as low as possible
- Use async/await for data fetching

### 4. **Tailwind CSS v4 (Orange OKLCh Theme)**

**Standard Utility Classes:**
```tsx
<div className="bg-orange-500 text-white rounded-lg p-4 hover:bg-orange-600">
  <h2 className="text-2xl font-bold mb-2">Title</h2>
  <p className="text-sm text-orange-100">Description</p>
</div>
```

**CSS Variables (Theme Colors):**
```tsx
<button className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
  Primary Button
</button>
```

**Responsive Design:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

**Dark Mode (if applicable):**
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### 5. **TypeScript Patterns**

**Component Props with ComponentProps:**
```tsx
import { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

// Extend existing component props
type MyButtonProps = ComponentProps<typeof Button> & {
  customProp?: string
}

export function MyButton({ customProp, ...props }: MyButtonProps) {
  return <Button {...props}>Click me</Button>
}
```

**Type-Safe Props:**
```tsx
type ArticleCardProps = {
  title: string
  description: string
  imageUrl?: string
  publishedAt: Date
  category: 'news' | 'analysis' | 'interview'
}

export function ArticleCard({ title, description, category }: ArticleCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <span className="text-xs text-orange-500">{category}</span>
    </div>
  )
}
```

**Use Strict Mode:**
- TypeScript strict mode is enabled
- Always define prop types
- Avoid `any`, use `unknown` if needed
- Use type inference when possible

### 6. **Testing Requirements**

**Every custom component must have tests:**

```tsx
// components/article/article-card.tsx
export function ArticleCard({ title }: { title: string }) {
  return <h3>{title}</h3>
}

// components/article/test/article-card.test.tsx
import { render, screen } from '@testing-library/react'
import { ArticleCard } from '../article-card'

describe('ArticleCard', () => {
  it('renders title correctly', () => {
    render(<ArticleCard title="Test Article" />)
    expect(screen.getByText('Test Article')).toBeInTheDocument()
  })
})
```

**Run tests after changes:**
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:ui             # Interactive UI
npm run test:coverage       # Coverage report
```

### 7. **Performance & Optimization**

**Image Optimization:**
```tsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // For above-the-fold images
/>
```

**Dynamic Imports (Code Splitting):**
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <p>Loading...</p>
})
```

**Memoization (when needed):**
```tsx
import { memo, useMemo, useCallback } from 'react'

// Memo for expensive renders
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>
})

// useMemo for expensive calculations
const sorted = useMemo(() => items.sort(), [items])

// useCallback for stable function references
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

**Avoid Over-Optimization:**
- Only optimize when there's a proven performance issue
- Don't memoize everything by default
- Profile before optimizing

### 8. **Consistency & Scalability**

**File Organization:**
```
components/
├── layout/          # Navigation, footer, headers
│   ├── navigation.tsx
│   └── test/
│       └── navigation.test.tsx
├── article/         # Article-related components
│   ├── article-card.tsx
│   ├── article-list.tsx
│   └── test/
├── admin/           # Admin dashboard components
├── auth/            # Authentication components
├── profile/         # User profile components
└── ui/              # ShadCN UI components
```

**Component Naming:**
- PascalCase for components: `ArticleCard.tsx`
- kebab-case for files: `article-card.tsx`
- Descriptive names: `article-card.tsx` not `card.tsx`

**Import Aliases:**
```tsx
import { Button } from '@/components/ui/button'
import { getArticles } from '@/lib/articles'
import { ArticleCard } from '@/components/article/article-card'
```

**CVA for Complex Variants:**
```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-orange-500 text-white hover:bg-orange-600',
        outline: 'border border-orange-500 text-orange-500',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)
```

### 9. **Avoiding Redundant Code**

**DRY Principle:**
- Extract common logic into hooks
- Create reusable utility functions in `/lib/`
- Use composition over duplication

**Custom Hooks Example:**
```tsx
// lib/hooks/use-article.ts
export function useArticle(id: string) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then(r => r.json())
      .then(setArticle)
      .finally(() => setLoading(false))
  }, [id])

  return { article, loading }
}

// components/article/article-detail.tsx
import { useArticle } from '@/lib/hooks/use-article'

export function ArticleDetail({ id }: { id: string }) {
  const { article, loading } = useArticle(id)
  if (loading) return <p>Loading...</p>
  return <div>{article.title}</div>
}
```

## Workflow for New Features

### Before Starting:
1. ✅ **Understand the requirement fully**
2. ✅ **Check existing components in `/components/`**
3. ✅ **Plan component structure and data flow**
4. ✅ **Identify if SSR or CSR is needed**
5. ✅ **Ask clarifying questions if in doubt**

### During Development:
1. ✅ **Create component in appropriate directory**
2. ✅ **Add TypeScript types**
3. ✅ **Style with Tailwind utilities (consistent with existing components)**
4. ✅ **Write tests in `test/` subdirectory**
5. ✅ **Test locally with `npm run dev`**
6. ✅ **Run tests with `npm test`**

### After Development:
1. ✅ **Ensure all tests pass**
2. ✅ **Check bundle size if adding new dependencies**
3. ✅ **Update CLAUDE.md Recent Changes section**
4. ✅ **Review for accessibility (ARIA labels, keyboard navigation)**
5. ✅ **Verify responsive design on different screen sizes**

## Common Patterns in This Codebase

### Auth-Protected Components:
```tsx
import { requireAuth } from '@/lib/auth-helpers'

export default async function ProtectedPage() {
  await requireAuth()
  return <div>Protected content</div>
}
```

### Admin-Only Components:
```tsx
import { requireAdmin } from '@/lib/auth-helpers'

export default async function AdminPage() {
  await requireAdmin()
  return <div>Admin dashboard</div>
}
```

### Form Handling with Better-Auth:
```tsx
'use client'

import { authClient } from '@/lib/auth-client'
import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await authClient.signIn.email({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Data Fetching (Server Component):
```tsx
import { db } from '@/database/db'
import { articles } from '@/database/schema/articles-schema'
import { eq } from 'drizzle-orm'

export default async function ArticlesPage() {
  const allArticles = await db.select()
    .from(articles)
    .where(eq(articles.status, 'published'))

  return (
    <div>
      {allArticles.map(article => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  )
}
```

## Quality Checklist

Before considering a task complete:

- [ ] Component follows SSR/CSR best practices
- [ ] Uses existing ShadCN components from `/components/ui/`
- [ ] Styled consistently with Tailwind CSS v4 (orange theme)
- [ ] TypeScript types are properly defined
- [ ] Tests written and passing (`npm test`)
- [ ] No redundant code (checked for reusable patterns)
- [ ] Accessible (keyboard navigation, ARIA labels, semantic HTML)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Performance optimized (images, code splitting if needed)
- [ ] Updated CLAUDE.md if significant changes

## Reference Files

**Key Files to Review:**
- `/components/ui/` - ShadCN components
- `/components/layout/navigation.tsx` - Navigation pattern
- `/components/admin/article-editor.tsx` - Complex form example
- `/lib/auth-helpers.ts` - Auth utilities
- `/database/schema/` - Database schema for data types
- `CLAUDE.md` - Project documentation

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Interactive test UI
npm run test:coverage    # Coverage report
npx shadcn@latest list   # List available ShadCN components
```

## Remember

1. **Always ask questions** if requirements are unclear
2. **Plan before implementing** - think about architecture, state management, data flow
3. **Check existing code** - don't reinvent the wheel
4. **Test everything** - write tests for custom components
5. **Be consistent** - follow patterns established in the codebase
6. **Optimize wisely** - performance, scalability, maintainability balance
7. **Document changes** - update CLAUDE.md for significant changes

---

This skill helps you build world-class frontend experiences for the Danish commercial real estate newssite with consistency, quality, and best practices.
