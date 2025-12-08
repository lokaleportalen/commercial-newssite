import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryHero } from '../category-hero'
import type { Category } from '@/lib/category-helpers'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

describe('CategoryHero', () => {
  const mockCategories: Category[] = [
    { id: '1', name: 'Investering', slug: 'investering', description: null },
    { id: '2', name: 'Byggeri', slug: 'byggeri', description: null },
  ]

  const mockFeaturedArticle = {
    id: '1',
    title: 'Featured Category Article',
    slug: 'featured-category-article',
    summary: 'This is the featured article in this category',
    image: '/category-featured.jpg',
    publishedDate: new Date('2025-01-15'),
    categories: mockCategories,
  }

  describe('with featured article', () => {
    it('renders category name badge', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription="Investment news"
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      expect(screen.getByText('Investering')).toBeInTheDocument()
    })

    it('renders article count badge', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      expect(screen.getByText('25 artikler')).toBeInTheDocument()
    })

    it('renders single article count correctly', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={1}
        />
      )

      expect(screen.getByText('1 artikel')).toBeInTheDocument()
    })

    it('displays category description when provided', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription="Investment news and updates"
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      expect(screen.getByText('Investment news and updates')).toBeInTheDocument()
    })

    it('renders featured article title', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      expect(screen.getByText('Featured Category Article')).toBeInTheDocument()
    })

    it('renders featured article summary', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      expect(screen.getByText('This is the featured article in this category')).toBeInTheDocument()
    })

    it('displays featured article image', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      const image = screen.getByAltText('Featured Category Article')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/category-featured.jpg')
    })

    it('shows fallback when featured article has no image', () => {
      const articleWithoutImage = {
        ...mockFeaturedArticle,
        image: null,
      }

      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={articleWithoutImage}
          totalArticles={25}
        />
      )

      expect(screen.getByText('Intet foto')).toBeInTheDocument()
    })

    it('renders "Se artikel" button', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      expect(screen.getByRole('button', { name: /se artikel/i })).toBeInTheDocument()
    })

    it('has correct link to featured article', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      const links = screen.getAllByRole('link')
      const articleLinks = links.filter(link =>
        link.getAttribute('href') === '/nyheder/featured-category-article'
      )
      expect(articleLinks.length).toBeGreaterThan(0)
    })

    it('displays "Seneste artikel" label', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      expect(screen.getByText('Seneste artikel')).toBeInTheDocument()
    })

    it('handles article without summary', () => {
      const articleWithoutSummary = {
        ...mockFeaturedArticle,
        summary: null,
      }

      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={articleWithoutSummary}
          totalArticles={25}
        />
      )

      expect(screen.getByText('Featured Category Article')).toBeInTheDocument()
      expect(screen.queryByText('This is the featured article in this category')).not.toBeInTheDocument()
    })
  })

  describe('without featured article', () => {
    it('renders text-only header', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription="Investment news"
          featuredArticle={null}
          totalArticles={25}
        />
      )

      expect(screen.getByText('Investering')).toBeInTheDocument()
      expect(screen.getByText('Investment news')).toBeInTheDocument()
    })

    it('shows article count badge in text-only mode', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={null}
          totalArticles={10}
        />
      )

      expect(screen.getByText('10 artikler')).toBeInTheDocument()
    })

    it('does not render article-specific elements', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={null}
          totalArticles={25}
        />
      )

      expect(screen.queryByText('Seneste artikel')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /se artikel/i })).not.toBeInTheDocument()
    })

    it('renders with zero articles', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={null}
          totalArticles={0}
        />
      )

      expect(screen.getByText('0 artikler')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('uses semantic header element for text-only variant', () => {
      const { container } = render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={null}
          totalArticles={25}
        />
      )

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('uses semantic section element for hero variant', () => {
      const { container } = render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('has heading hierarchy with h1 in text-only mode', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={null}
          totalArticles={25}
        />
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Investering')
    })

    it('has heading hierarchy with h2 for article title in hero mode', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          featuredArticle={mockFeaturedArticle}
          totalArticles={25}
        />
      )

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Featured Category Article')
    })
  })
})
