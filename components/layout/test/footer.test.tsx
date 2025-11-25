import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

describe('Footer', () => {
  let originalDate: typeof Date
  let mockDate: Date

  beforeEach(() => {
    // Mock Date to return consistent year
    originalDate = global.Date
    mockDate = new Date('2025-01-15')
    global.Date = class extends originalDate {
      constructor() {
        super()
        return mockDate
      }
      static now() {
        return mockDate.getTime()
      }
    } as any
  })

  afterEach(() => {
    global.Date = originalDate
  })

  it('renders all main sections', () => {
    render(<Footer />)

    expect(screen.getByText('Om')).toBeInTheDocument()
    expect(screen.getByText('Nyhedsbrev')).toBeInTheDocument()
    expect(screen.getByText('Arkiv')).toBeInTheDocument()
    expect(screen.getByText('Følg os')).toBeInTheDocument()
  })

  it('renders About section links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: /om os/i })).toHaveAttribute('href', '/om-os')
    expect(screen.getByRole('link', { name: /kontakt/i })).toHaveAttribute('href', '/kontakt')
  })

  it('renders Newsletter section', () => {
    render(<Footer />)

    expect(screen.getByText('Få de seneste nyheder direkte i din indbakke')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tilmeld dig her/i })).toHaveAttribute('href', '/nyhedsbrev')
  })

  it('renders Archive section links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: /alle artikler/i })).toHaveAttribute('href', '/arkiv')
    expect(screen.getByRole('link', { name: /kategorier/i })).toHaveAttribute('href', '/kategorier')
  })

  it('renders social media links with correct attributes', () => {
    render(<Footer />)

    const facebookLink = screen.getByRole('link', { name: /facebook/i })
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/lokaleportalen')
    expect(facebookLink).toHaveAttribute('target', '_blank')
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')

    const linkedInLink = screen.getByRole('link', { name: /linkedin/i })
    expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/company/lokaleportalen')
    expect(linkedInLink).toHaveAttribute('target', '_blank')
    expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders copyright with current year', () => {
    render(<Footer />)

    expect(screen.getByText(/© 2025 Nyheder/)).toBeInTheDocument()
  })

  it('renders Lokaleportalen.dk link in copyright', () => {
    render(<Footer />)

    const lokaleportalenLink = screen.getByRole('link', { name: /lokaleportalen\.dk/i })
    expect(lokaleportalenLink).toHaveAttribute('href', 'https://www.lokaleportalen.dk')
    expect(lokaleportalenLink).toHaveAttribute('target', '_blank')
    expect(lokaleportalenLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
