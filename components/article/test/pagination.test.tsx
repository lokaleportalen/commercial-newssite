import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pagination } from '../pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders pagination when totalPages is greater than 1', () => {
    render(<Pagination currentPage={1} totalPages={5} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders all page numbers when totalPages is 5 or less', () => {
    render(<Pagination currentPage={1} totalPages={5} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} />)

    // The previous button should be disabled (contain a span, not a link)
    const buttons = screen.getAllByRole('button')
    const prevButton = buttons[0]
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} />)

    const buttons = screen.getAllByRole('button')
    const nextButton = buttons[buttons.length - 1]
    expect(nextButton).toBeDisabled()
  })

  it('enables previous button when not on first page', () => {
    render(<Pagination currentPage={2} totalPages={5} />)

    const prevLink = screen.getAllByRole('link')[0]
    expect(prevLink).toHaveAttribute('href', '/?page=1')
  })

  it('enables next button when not on last page', () => {
    render(<Pagination currentPage={1} totalPages={5} />)

    const links = screen.getAllByRole('link')
    const nextLink = links[links.length - 1]
    expect(nextLink).toHaveAttribute('href', '/?page=2')
  })

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} />)

    const buttons = screen.getAllByRole('button')
    const currentPageButton = buttons.find(btn => btn.textContent === '3' && !btn.querySelector('a'))
    expect(currentPageButton).toBeDefined()
  })

  it('uses custom baseUrl', () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl="/articles" />)

    const link = screen.getByRole('link', { name: '2' })
    expect(link).toHaveAttribute('href', '/articles?page=2')
  })

  it('shows ellipsis for large page counts', () => {
    render(<Pagination currentPage={1} totalPages={10} />)

    const ellipsis = screen.getAllByText('...')
    expect(ellipsis.length).toBeGreaterThan(0)
  })

  it('always shows first and last page numbers', () => {
    render(<Pagination currentPage={5} totalPages={10} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows pages around current page', () => {
    render(<Pagination currentPage={5} totalPages={10} />)

    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('page number links have correct href', () => {
    render(<Pagination currentPage={1} totalPages={5} />)

    const page2Link = screen.getByRole('link', { name: '2' })
    expect(page2Link).toHaveAttribute('href', '/?page=2')

    const page3Link = screen.getByRole('link', { name: '3' })
    expect(page3Link).toHaveAttribute('href', '/?page=3')
  })

  it('shows correct range when current page is near start', () => {
    render(<Pagination currentPage={2} totalPages={10} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows correct range when current page is near end', () => {
    render(<Pagination currentPage={9} totalPages={10} />)

    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders with totalPages equal to 2', () => {
    render(<Pagination currentPage={1} totalPages={2} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
