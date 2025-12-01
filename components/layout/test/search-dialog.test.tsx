import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchDialog } from '../search-dialog'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('SearchDialog', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders dialog when open', () => {
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Søg i artikler')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Søg efter artikler...')).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(<SearchDialog open={false} onOpenChange={mockOnOpenChange} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows message when query is less than 4 characters', async () => {
    const user = userEvent.setup()
    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText('Søg efter artikler...')
    await user.type(input, 'abc')

    expect(screen.getByText('Indtast mindst 4 tegn for at søge')).toBeInTheDocument()
  })

  it('searches when query is 4 or more characters', async () => {
    const user = userEvent.setup()
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article',
        slug: 'test-article',
        image: '/test.jpg',
        publishedDate: '2024-01-01T00:00:00.000Z',
      },
    ]

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response)

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText('Søg efter artikler...')
    await user.type(input, 'test')

    // Wait for debounce and fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/articles?search=test')
    })

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument()
    })
  })

  it('shows loading state while searching', async () => {
    const user = userEvent.setup()

    // Create a promise that we can control
    let resolvePromise: (value: any) => void
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(global.fetch).mockReturnValueOnce(fetchPromise as Promise<Response>)

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText('Søg efter artikler...')
    await user.type(input, 'test')

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    }, { timeout: 500 })

    // Loading spinner should appear
    await waitFor(() => {
      const loader = document.querySelector('.animate-spin')
      expect(loader).toBeInTheDocument()
    })

    // Resolve the fetch
    resolvePromise!({
      ok: true,
      json: async () => ({ articles: [] }),
    })
  })

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup()

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: [] }),
    } as Response)

    render(<SearchDialog open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText('Søg efter artikler...')
    await user.type(input, 'test')

    await waitFor(() => {
      expect(screen.getByText('Ingen resultater fundet')).toBeInTheDocument()
    })
  })
})
