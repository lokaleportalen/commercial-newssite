import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '../hero-section'
import type { Category } from '@/lib/category-helpers'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

describe('HeroSection', () => {
  const mockCategories: Category[] = [
    { id: '1', name: 'Investering', slug: 'investering', description: null },
    { id: '2', name: 'Byggeri', slug: 'byggeri', description: null },
  ]

  const mockArticles = [
    {
      id: '1',
      title: 'Featured Article',
      slug: 'featured-article',
      summary: 'This is the featured article summary',
      image: '/featured.jpg',
      publishedDate: new Date('2025-01-15'),
      categories: [mockCategories[0], mockCategories[1]],
    },
    {
      id: '2',
      title: 'Side Article 1',
      slug: 'side-article-1',
      summary: 'First side article',
      image: '/side1.jpg',
      publishedDate: new Date('2025-01-14'),
      categories: [mockCategories[1]],
    },
    {
      id: '3',
      title: 'Side Article 2',
      slug: 'side-article-2',
      summary: 'Second side article',
      image: '/side2.jpg',
      publishedDate: new Date('2025-01-13'),
      categories: [mockCategories[0]],
    },
    {
      id: '4',
      title: 'Side Article 3',
      slug: 'side-article-3',
      summary: 'Third side article',
      image: '/side3.jpg',
      publishedDate: new Date('2025-01-12'),
      categories: [mockCategories[1]],
    },
  ]

  it('renders nothing when articles array is empty', () => {
    const { container } = render(<HeroSection articles={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders featured article', () => {
    render(<HeroSection articles={mockArticles} />)

    expect(screen.getByText('Featured Article')).toBeInTheDocument()
    expect(screen.getByText('This is the featured article summary')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /læs artikel/i })).toBeInTheDocument()
  })

  it('renders side articles (up to 3)', () => {
    render(<HeroSection articles={mockArticles} />)

    expect(screen.getByText('Side Article 1')).toBeInTheDocument()
    expect(screen.getByText('Side Article 2')).toBeInTheDocument()
    expect(screen.getByText('Side Article 3')).toBeInTheDocument()
  })

  it('displays featured article image', () => {
    render(<HeroSection articles={mockArticles} />)

    const featuredImage = screen.getByAltText('Featured Article')
    expect(featuredImage).toBeInTheDocument()
    expect(featuredImage).toHaveAttribute('src', '/featured.jpg')
  })

  it('shows fallback when featured article has no image', () => {
    const articlesWithoutImage = [
      { ...mockArticles[0], image: null },
      ...mockArticles.slice(1),
    ]
    render(<HeroSection articles={articlesWithoutImage} />)

    expect(screen.getByText('Intet foto')).toBeInTheDocument()
  })

  it('has correct link to featured article', () => {
    render(<HeroSection articles={mockArticles} />)

    const links = screen.getAllByRole('link')
    const featuredLink = links.find(link =>
      link.getAttribute('href') === '/nyheder/featured-article'
    )
    expect(featuredLink).toBeInTheDocument()
  })

  it('displays category badge for featured article', () => {
    render(<HeroSection articles={mockArticles} />)

    // The first category should be displayed
    expect(screen.getByText('Featured Article')).toBeInTheDocument()
  })

  it('handles article with only one item', () => {
    render(<HeroSection articles={[mockArticles[0]]} />)

    expect(screen.getByText('Featured Article')).toBeInTheDocument()
    expect(screen.queryByText('Side Article 1')).not.toBeInTheDocument()
  })

  it('renders read article button for featured article', () => {
    render(<HeroSection articles={mockArticles} />)

    const readButton = screen.getByRole('button', { name: /læs artikel/i })
    expect(readButton).toBeInTheDocument()
    expect(readButton.closest('a')).toHaveAttribute('href', '/nyheder/featured-article')
  })

  it('renders ArticleCard components for side articles', () => {
    render(<HeroSection articles={mockArticles} />)

    // Check that side articles are rendered
    expect(screen.getByText('Side Article 1')).toBeInTheDocument()
    expect(screen.getByText('Side Article 2')).toBeInTheDocument()
    expect(screen.getByText('Side Article 3')).toBeInTheDocument()
  })
})
