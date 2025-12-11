import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryHero } from '../category-hero'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

describe('CategoryHero', () => {
  describe('with hero image', () => {
    it('renders category name', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription="Investment news"
          heroImage="/hero-investering.jpg"
          totalArticles={25}
        />
      )

      expect(screen.getByRole('heading', { level: 1, name: 'Investering' })).toBeInTheDocument()
    })

    it('renders article count badge', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          heroImage="/hero-investering.jpg"
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
          heroImage="/hero-investering.jpg"
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
          heroImage="/hero-investering.jpg"
          totalArticles={25}
        />
      )

      expect(screen.getByText('Investment news and updates')).toBeInTheDocument()
    })

    it('does not display description when null', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          heroImage="/hero-investering.jpg"
          totalArticles={25}
        />
      )

      // Only the heading and badge should be present
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText('25 artikler')).toBeInTheDocument()
    })

    it('displays hero image', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          heroImage="/hero-investering.jpg"
          totalArticles={25}
        />
      )

      const image = screen.getByAltText('Investering hero image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/hero-investering.jpg')
    })

    it('uses section element with hero image', () => {
      const { container } = render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          heroImage="/hero-investering.jpg"
          totalArticles={25}
        />
      )

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })
  })

  describe('without hero image (text-only mode)', () => {
    it('renders category name', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription="Investment news"
          totalArticles={25}
        />
      )

      expect(screen.getByRole('heading', { level: 1, name: 'Investering' })).toBeInTheDocument()
    })

    it('renders article count badge', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          totalArticles={10}
        />
      )

      expect(screen.getByText('10 artikler')).toBeInTheDocument()
    })

    it('displays category description when provided', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription="Investment news and updates"
          totalArticles={25}
        />
      )

      expect(screen.getByText('Investment news and updates')).toBeInTheDocument()
    })

    it('renders with zero articles', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          totalArticles={0}
        />
      )

      expect(screen.getByText('0 artikler')).toBeInTheDocument()
    })

    it('uses header element without hero image', () => {
      const { container } = render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          totalArticles={25}
        />
      )

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('does not render hero image when null', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription="Investment news"
          heroImage={null}
          totalArticles={25}
        />
      )

      const images = screen.queryAllByRole('img')
      expect(images).toHaveLength(0)
    })
  })

  describe('accessibility', () => {
    it('uses semantic header element for text-only variant', () => {
      const { container } = render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
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
          heroImage="/hero.jpg"
          totalArticles={25}
        />
      )

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('has proper heading hierarchy with h1', () => {
      render(
        <CategoryHero
          categoryName="Investering"
          categoryDescription={null}
          totalArticles={25}
        />
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Investering')
    })

    it('hero image has descriptive alt text', () => {
      render(
        <CategoryHero
          categoryName="Byggeri"
          categoryDescription={null}
          heroImage="/hero-byggeri.jpg"
          totalArticles={15}
        />
      )

      const image = screen.getByAltText('Byggeri hero image')
      expect(image).toBeInTheDocument()
    })
  })

  describe('article count pluralization', () => {
    it('shows "artikel" for 1 article', () => {
      render(
        <CategoryHero
          categoryName="Test"
          totalArticles={1}
        />
      )

      expect(screen.getByText('1 artikel')).toBeInTheDocument()
    })

    it('shows "artikler" for 0 articles', () => {
      render(
        <CategoryHero
          categoryName="Test"
          totalArticles={0}
        />
      )

      expect(screen.getByText('0 artikler')).toBeInTheDocument()
    })

    it('shows "artikler" for multiple articles', () => {
      render(
        <CategoryHero
          categoryName="Test"
          totalArticles={42}
        />
      )

      expect(screen.getByText('42 artikler')).toBeInTheDocument()
    })
  })
})
