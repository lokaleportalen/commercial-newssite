import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from './profile-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
    signOut: vi.fn(),
  },
}))

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockUseSession = authClient.useSession as ReturnType<typeof vi.fn>
const mockSignOut = authClient.signOut as ReturnType<typeof vi.fn>

vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
  refresh: mockRefresh,
} as any)

// Mock global fetch
global.fetch = vi.fn()
global.confirm = vi.fn()

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows login prompt when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null })

    render(<ProfileForm />)

    expect(screen.getByText('Du skal være logget ind for at se din profil.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log ind/i })).toBeInTheDocument()
  })

  it('renders profile form with session data', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })

    render(<ProfileForm />)

    expect(screen.getByText('Administrer dine data')).toBeInTheDocument()
    expect(screen.getByLabelText('Navn')).toHaveValue('Test User')
    expect(screen.getByLabelText('E-mail')).toHaveValue('test@example.com')
  })

  it('updates profile successfully', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    render(<ProfileForm />)

    const nameInput = screen.getByLabelText('Navn')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')

    await user.click(screen.getByRole('button', { name: /opdater data/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Name',
          email: 'test@example.com',
        }),
      })
      expect(screen.getByText('Dine data er blevet opdateret')).toBeInTheDocument()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('displays error message on failed update', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500
    })

    render(<ProfileForm />)

    await user.click(screen.getByRole('button', { name: /opdater data/i }))

    await waitFor(() => {
      expect(screen.getByText('Der opstod en fejl. Prøv venligst igen.')).toBeInTheDocument()
    })
  })

  it('handles account deletion successfully', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })
    ;(global.confirm as any).mockReturnValue(true)
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    render(<ProfileForm />)

    await user.click(screen.getByRole('button', { name: /slet alle data/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'DELETE',
      })
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('does not delete account when user cancels confirmation', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })
    ;(global.confirm as any).mockReturnValue(false)

    render(<ProfileForm />)

    await user.click(screen.getByRole('button', { name: /slet alle data/i }))

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('displays error message on failed deletion', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })
    ;(global.confirm as any).mockReturnValue(true)
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500
    })

    render(<ProfileForm />)

    await user.click(screen.getByRole('button', { name: /slet alle data/i }))

    await waitFor(() => {
      expect(screen.getByText('Der opstod en fejl ved sletning af konto. Prøv venligst igen.')).toBeInTheDocument()
    })
  })

  it('has link to preferences page', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })

    render(<ProfileForm />)

    const preferencesLink = screen.getByRole('link', { name: /rediger nyhedspræferencer/i })
    expect(preferencesLink).toBeInTheDocument()
    expect(preferencesLink).toHaveAttribute('href', '/profile/preferences')
  })
})
