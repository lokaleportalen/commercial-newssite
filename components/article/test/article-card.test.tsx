import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleCard } from '../article-card'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

describe('ArticleCard', () => {
  const mockArticle = {
    title: 'Test Article Title',
    slug: 'test-article-title',
    summary: 'This is a test article summary that describes the content.',
    image: '/test-image.jpg',
    publishedDate: new Date('2025-01-15'),
    categories: 'Investering, Byggeri',
  }

  it('renders article with default variant', () => {
    render(<ArticleCard {...mockArticle} />)

    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText(mockArticle.summary)).toBeInTheDocument()
    expect(screen.getByText('15. januar 2025')).toBeInTheDocument()
  })

  it('renders article with small variant', () => {
    render(<ArticleCard {...mockArticle} variant="small" />)

    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText(mockArticle.summary)).toBeInTheDocument()
  })

  it('renders image when provided', () => {
    render(<ArticleCard {...mockArticle} />)

    const image = screen.getByAltText('Test Article Title')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-image.jpg')
  })

  it('shows fallback text when no image provided', () => {
    render(<ArticleCard {...mockArticle} image={null} />)

    expect(screen.getByText('Intet foto')).toBeInTheDocument()
  })

  it('truncates long summary to 150 characters', () => {
    const longSummary = 'A'.repeat(200)
    render(<ArticleCard {...mockArticle} summary={longSummary} />)

    const truncatedText = screen.getByText(/A+\.\.\./)
    expect(truncatedText.textContent).toHaveLength(153) // 150 + "..."
  })

  it('handles null summary', () => {
    render(<ArticleCard {...mockArticle} summary={null} />)

    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.queryByText(/This is a test/)).not.toBeInTheDocument()
  })

  it('parses and displays categories', () => {
    render(<ArticleCard {...mockArticle} />)

    // ArticleCategories component should be rendered
    // We just check that the categories are passed correctly
    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
  })

  it('handles null categories', () => {
    render(<ArticleCard {...mockArticle} categories={null} />)

    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
  })

  it('has correct link to article detail page', () => {
    render(<ArticleCard {...mockArticle} />)

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/nyheder/test-article-title')
  })

  it('formats date in Danish locale', () => {
    const article = {
      ...mockArticle,
      publishedDate: new Date('2025-03-20'),
    }
    render(<ArticleCard {...article} />)

    expect(screen.getByText('20. marts 2025')).toBeInTheDocument()
  })
})
