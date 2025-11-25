import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PreferencesForm } from '../preferences-form'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock auth client
const mockUseSession = vi.fn()
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => mockUseSession(),
  },
}))

// Mock global fetch and confirm
global.fetch = vi.fn()
global.confirm = vi.fn()

describe('PreferencesForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows login prompt when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null })

    render(<PreferencesForm />)

    expect(screen.getByText('Du skal være logget ind for at ændre dine præferencer.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log ind/i })).toBeInTheDocument()
  })

  it('shows loading state while fetching preferences', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.fetch as any).mockImplementation(() => new Promise(() => {}))

    render(<PreferencesForm />)

    expect(screen.getByText('Indlæser...')).toBeInTheDocument()
  })

  it('loads and displays existing preferences', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        newsCategory: 'investment',
        emailFrequency: 'immediate',
      })
    })

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    const investmentRadio = screen.getByRole('radio', { name: /investeringsnyheder/i }) as HTMLInputElement
    const immediateRadio = screen.getByRole('radio', { name: /send mig en mail hver gang der er en relevant nyhed/i }) as HTMLInputElement

    expect(investmentRadio).toBeChecked()
    expect(immediateRadio).toBeChecked()
  })

  it('renders all preference options', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({})
    })

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    // News categories
    expect(screen.getByText('Alle nyheder')).toBeInTheDocument()
    expect(screen.getByText('Investeringsnyheder')).toBeInTheDocument()
    expect(screen.getByText('Bygudvikling')).toBeInTheDocument()

    // Email frequencies
    expect(screen.getByText(/send mig en mail hver gang der er en relevant nyhed/i)).toBeInTheDocument()
    expect(screen.getByText(/send mig relevante nyheder 1 gang om dagen/i)).toBeInTheDocument()
  })

  it('updates preferences successfully', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          newsCategory: 'all',
          emailFrequency: 'daily',
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('radio', { name: /investeringsnyheder/i }))
    await user.click(screen.getByRole('button', { name: /bekræft/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsCategory: 'investment',
          emailFrequency: 'daily',
        }),
      })
      expect(screen.getByText('Dine præferencer er blevet gemt')).toBeInTheDocument()
    })
  })

  it('displays error message on failed save', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      })

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /bekræft/i }))

    await waitFor(() => {
      expect(screen.getByText('Der opstod en fejl. Prøv venligst igen.')).toBeInTheDocument()
    })
  })

  it('handles unsubscribe successfully', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.confirm as any).mockReturnValue(true)
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByText(/afmeld alle mails/i))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/preferences/unsubscribe', {
        method: 'POST',
      })
      expect(screen.getByText('Du er nu afmeldt alle nyhedsmails')).toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })
  })

  it('does not unsubscribe when user cancels confirmation', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.confirm as any).mockReturnValue(false)
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({})
    })

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByText(/afmeld alle mails/i))

    // Should only call fetch once for loading preferences, not for unsubscribe
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('shows loading text during save', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /bekræft/i }))

    expect(screen.getByText('Gemmer...')).toBeInTheDocument()
  })

  it('has back to profile link', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    })
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({})
    })

    render(<PreferencesForm />)

    await waitFor(() => {
      expect(screen.queryByText('Indlæser...')).not.toBeInTheDocument()
    })

    const backLink = screen.getByRole('link', { name: /tilbage til profil/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/profile')
  })
})
