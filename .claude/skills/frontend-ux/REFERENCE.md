# Frontend/UX Reference - Examples & Patterns

This document contains detailed examples and patterns used in the commercial newssite codebase.

## Orange OKLCh Theme Variables

```css
:root {
  /* Primary Orange Colors */
  --color-primary: oklch(65% 0.15 29);
  --color-primary-hover: oklch(55% 0.15 29);
  --color-primary-foreground: #fff;

  /* Using in Tailwind */
  /* bg-orange-500, text-orange-600, border-orange-400, etc. */
}
```

## Component Examples from Codebase

### 1. Button Component (ShadCN)
Location: `/components/ui/button.tsx`

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-orange-500 text-white hover:bg-orange-600',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

### 2. Card Component Pattern
Location: `/components/ui/card.tsx`

```tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
))

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))

// Usage:
<Card>
  <CardHeader>
    <CardTitle>Article Title</CardTitle>
    <CardDescription>Published on...</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Article content here</p>
  </CardContent>
</Card>
```

### 3. Navigation Component (Client Component)
Location: `/components/layout/navigation.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Hjem' },
    { href: '/nyheder', label: 'Nyheder' },
    { href: '/analyser', label: 'Analyser' },
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-500">
            Lokaleportalen
          </Link>

          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-orange-500',
                  pathname === item.href
                    ? 'text-orange-500'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Button asChild>
            <Link href="/auth/sign-in">Log ind</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
```

### 4. Article Card (Composite Component)

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/database/schema/articles-schema'

type ArticleCardProps = {
  article: Pick<Article, 'id' | 'title' | 'excerpt' | 'imageUrl' | 'category' | 'publishedAt'>
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/artikler/${article.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        {article.imageUrl && (
          <div className="relative h-48 w-full">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{article.category}</Badge>
            <time className="text-xs text-muted-foreground">
              {new Date(article.publishedAt).toLocaleDateString('da-DK')}
            </time>
          </div>
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### 5. Admin Article Editor (Complex Form)
Location: `/components/admin/article-editor.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { Article } from '@/database/schema/articles-schema'

type ArticleEditorProps = {
  article?: Article | null
  onSave: (data: Partial<Article>) => Promise<void>
}

export function ArticleEditor({ article, onSave }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title ?? '')
  const [content, setContent] = useState(article?.content ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title || !content) {
      toast.error('Titel og indhold er påkrævet')
      return
    }

    setLoading(true)
    try {
      await onSave({ title, content, excerpt })
      toast.success('Artikel gemt')
    } catch (error) {
      toast.error('Kunne ikke gemme artikel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Artikeltitel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Uddrag</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Kort uddrag..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Indhold</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Artikelindhold..."
          rows={15}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Gemmer...' : 'Gem artikel'}
      </Button>
    </form>
  )
}
```

### 6. Server Component with Data Fetching

```tsx
// app/(main)/artikler/page.tsx
import { db } from '@/database/db'
import { articles } from '@/database/schema/articles-schema'
import { eq, desc } from 'drizzle-orm'
import { ArticleCard } from '@/components/article/article-card'

export default async function ArticlesPage() {
  // Data fetching in server component
  const publishedArticles = await db.select()
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt))
    .limit(20)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Artikler</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {publishedArticles.length === 0 && (
        <p className="text-center text-muted-foreground">
          Ingen artikler fundet
        </p>
      )}
    </div>
  )
}
```

### 7. Custom Hook Example

```tsx
// lib/hooks/use-articles.ts
'use client'

import { useState, useEffect } from 'react'
import type { Article } from '@/database/schema/articles-schema'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(setArticles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { articles, loading, error }
}

// Usage in component:
'use client'

import { useArticles } from '@/lib/hooks/use-articles'
import { ArticleCard } from '@/components/article/article-card'

export function ArticleList() {
  const { articles, loading, error } = useArticles()

  if (loading) return <p>Indlæser...</p>
  if (error) return <p>Fejl: {error}</p>

  return (
    <div className="grid gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
```

## Testing Patterns

### 1. Basic Component Test

```tsx
// components/article/test/article-card.test.tsx
import { render, screen } from '@testing-library/react'
import { ArticleCard } from '../article-card'

describe('ArticleCard', () => {
  const mockArticle = {
    id: '1',
    title: 'Test Article',
    excerpt: 'Test excerpt',
    category: 'news',
    publishedAt: new Date('2025-01-01'),
  }

  it('renders article title', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('Test Article')).toBeInTheDocument()
  })

  it('renders article excerpt', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('Test excerpt')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('news')).toBeInTheDocument()
  })
})
```

### 2. Interactive Component Test

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ArticleEditor } from '../article-editor'

describe('ArticleEditor', () => {
  it('calls onSave with form data', async () => {
    const mockOnSave = vi.fn().mockResolvedValue(undefined)

    render(<ArticleEditor onSave={mockOnSave} />)

    fireEvent.change(screen.getByLabelText('Titel'), {
      target: { value: 'New Article' }
    })

    fireEvent.change(screen.getByLabelText('Indhold'), {
      target: { value: 'Article content' }
    })

    fireEvent.click(screen.getByText('Gem artikel'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Article',
        content: 'Article content',
        excerpt: ''
      })
    })
  })
})
```

## Accessibility Patterns

### 1. Form Accessibility

```tsx
<form onSubmit={handleSubmit}>
  <div>
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      aria-required="true"
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? 'email-error' : undefined}
    />
    {errors.email && (
      <span id="email-error" role="alert" className="text-red-500">
        {errors.email}
      </span>
    )}
  </div>
</form>
```

### 2. Button States

```tsx
<Button
  disabled={loading}
  aria-busy={loading}
  aria-label={loading ? 'Gemmer artikel' : 'Gem artikel'}
>
  {loading ? <Spinner /> : 'Gem'}
</Button>
```

### 3. Navigation Landmarks

```tsx
<header role="banner">
  <Navigation />
</header>

<main role="main">
  <article role="article">
    <h1>{article.title}</h1>
  </article>
</main>

<footer role="contentinfo">
  <Footer />
</footer>
```

## Performance Patterns

### 1. Image Optimization

```tsx
import Image from 'next/image'

// Hero image (above fold)
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  quality={90}
/>

// Article images (lazy load)
<Image
  src={article.imageUrl}
  alt={article.title}
  width={800}
  height={400}
  loading="lazy"
  quality={75}
/>
```

### 2. Dynamic Imports

```tsx
import dynamic from 'next/dynamic'

const AdminPanel = dynamic(() => import('@/components/admin/admin-panel'), {
  loading: () => <Skeleton />,
  ssr: false // Client-only component
})
```

### 3. React.memo for Expensive Components

```tsx
import { memo } from 'react'

const ExpensiveArticleCard = memo(({ article }: { article: Article }) => {
  // Expensive rendering logic
  return <div>{/* ... */}</div>
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.article.id === nextProps.article.id
})
```

## Database Patterns (Drizzle ORM)

```tsx
import { db } from '@/database/db'
import { articles, users } from '@/database/schema'
import { eq, and, desc, like } from 'drizzle-orm'

// Simple select
const allArticles = await db.select().from(articles)

// With where clause
const published = await db.select()
  .from(articles)
  .where(eq(articles.status, 'published'))

// With multiple conditions
const results = await db.select()
  .from(articles)
  .where(and(
    eq(articles.status, 'published'),
    like(articles.title, '%erhverv%')
  ))
  .orderBy(desc(articles.publishedAt))
  .limit(10)

// With joins
const articlesWithAuthors = await db.select()
  .from(articles)
  .leftJoin(users, eq(articles.authorId, users.id))
```

## Utility Functions

### 1. Class Name Merger (cn)

```tsx
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage:
<div className={cn(
  'base-class',
  condition && 'conditional-class',
  className // From props
)} />
```

### 2. Date Formatting

```tsx
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
```

## Common Pitfalls to Avoid

1. **Don't use "use client" everywhere** - Only add when needed
2. **Don't fetch data in client components** - Use server components for data fetching
3. **Don't install ShadCN components with CLI** - Always manual installation
4. **Don't forget tests** - Every custom component needs tests
5. **Don't create new components without checking existing ones**
6. **Don't use inline styles** - Always use Tailwind utilities
7. **Don't forget TypeScript types** - Strict mode is enabled
8. **Don't over-optimize** - Profile before optimizing

---

These patterns represent the established conventions in the commercial newssite codebase. Follow these for consistency and maintainability.
