import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryLink } from './category-link'

describe('CategoryLink', () => {
  it('renders category name', () => {
    render(<CategoryLink category="Investering" />)
    expect(screen.getByText('Investering')).toBeInTheDocument()
  })

  it('converts category to URL slug', () => {
    render(<CategoryLink category="Investering" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/investering')
  })

  it('handles Danish characters in slug conversion', () => {
    render(<CategoryLink category="Bygudvikling" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/bygudvikling')
  })

  it('handles æ, ø, å in slug conversion', () => {
    render(<CategoryLink category="Århus Område" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/arhus-omrade')
  })

  it('handles spaces and special characters in slug', () => {
    render(<CategoryLink category="Erhverv & Investering" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/erhverv-investering')
  })

  it('removes leading and trailing hyphens', () => {
    render(<CategoryLink category="  Test Category  " />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test-category')
  })

  it('renders with default variant styling', () => {
    render(<CategoryLink category="Test" />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('text-xs')
  })

  it('renders with badge variant styling', () => {
    render(<CategoryLink category="Test" variant="badge" />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('rounded-full')
  })

  it('applies custom className', () => {
    render(<CategoryLink category="Test" className="custom-class" />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('custom-class')
  })

  it('applies custom className with badge variant', () => {
    render(<CategoryLink category="Test" variant="badge" className="bg-red-500" />)
    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-red-500')
    expect(link).toHaveClass('rounded-full')
  })

  it('converts uppercase to lowercase in slug', () => {
    render(<CategoryLink category="INVESTERING" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/investering')
  })

  it('handles multiple spaces in category name', () => {
    render(<CategoryLink category="Test   Multiple   Spaces" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test-multiple-spaces')
  })

  it('removes diacritics from characters', () => {
    render(<CategoryLink category="Café" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/cafe')
  })
})
