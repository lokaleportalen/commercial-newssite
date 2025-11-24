import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from './navigation'

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
const mockUseSession = authClient.useSession as ReturnType<typeof vi.fn>
const mockSignOut = authClient.signOut as ReturnType<typeof vi.fn>

vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
} as any)

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation with logo and category links', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    expect(screen.getByText('Nyheder')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /alle nyheder/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /investering/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /byggeri/i })).toBeInTheDocument()
  })

  it('shows login and signup buttons when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    expect(screen.getByRole('link', { name: /log ind/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /opret konto/i })).toBeInTheDocument()
  })

  it('shows profile and logout buttons when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      isPending: false,
    })

    render(<Navigation />)

    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log ud/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /log ind/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /opret konto/i })).not.toBeInTheDocument()
  })

  it('shows loading skeletons when session is pending', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true })

    render(<Navigation />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /log ind/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log ud/i })).not.toBeInTheDocument()
  })

  it('handles logout successfully', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      isPending: false,
    })
    mockSignOut.mockResolvedValue({})

    render(<Navigation />)

    await user.click(screen.getByRole('button', { name: /log ud/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        fetchOptions: {
          onSuccess: expect.any(Function),
        },
      })
    })
  })

  it('navigates to home after logout', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      isPending: false,
    })
    mockSignOut.mockImplementation(async ({ fetchOptions }) => {
      if (fetchOptions?.onSuccess) {
        fetchOptions.onSuccess()
      }
    })

    render(<Navigation />)

    await user.click(screen.getByRole('button', { name: /log ud/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('has correct href attributes for navigation links', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const allLinks = screen.getAllByRole('link')
    const homeLink = allLinks.find(link => link.textContent === 'Nyheder')
    const alleNyhederLink = screen.getByRole('link', { name: /alle nyheder/i })
    const investeringLink = screen.getByRole('link', { name: /investering/i })
    const byggeriLink = screen.getByRole('link', { name: /byggeri/i })

    expect(homeLink).toHaveAttribute('href', '/')
    expect(alleNyhederLink).toHaveAttribute('href', '/')
    expect(investeringLink).toHaveAttribute('href', '/investering')
    expect(byggeriLink).toHaveAttribute('href', '/byggeri')
  })

  it('has correct href attributes for auth links when logged out', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    expect(screen.getByRole('link', { name: /log ind/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /opret konto/i })).toHaveAttribute('href', '/signup')
  })

  it('has correct href attribute for profile link when logged in', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      isPending: false,
    })

    render(<Navigation />)

    expect(screen.getByRole('link', { name: /profil/i })).toHaveAttribute('href', '/profile')
  })
})
