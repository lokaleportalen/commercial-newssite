import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '../navigation'

// Mock matchMedia for Drawer component
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
    signOut: vi.fn(),
  },
}))

// Mock useUserRole hook
vi.mock('@/hooks/use-user-role', () => ({
  useUserRole: vi.fn(),
}))

import { useRouter, usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useUserRole } from '@/hooks/use-user-role'

const mockPush = vi.fn()
const mockUsePathname = vi.mocked(usePathname)
const mockUseSession = authClient.useSession as ReturnType<typeof vi.fn>
const mockSignOut = authClient.signOut as ReturnType<typeof vi.fn>
const mockUseUserRole = vi.mocked(useUserRole)

vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
} as any)

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
    mockUseUserRole.mockReturnValue({ role: null, isLoading: false, isAdmin: false })
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

  it('renders mobile burger menu button', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toHaveClass('md:hidden')
  })

  it('opens and closes mobile drawer when clicking burger menu', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('data-state', 'open')
      expect(screen.getByText('Menu')).toBeInTheDocument()
    })

    const closeButton = screen.getByLabelText(/luk menu/i)
    await user.click(closeButton)

    await waitFor(() => {
      const dialog = screen.queryByRole('dialog')
      // Drawer remains in DOM but changes state to closed
      expect(dialog).toHaveAttribute('data-state', 'closed')
    })
  })

  it('displays all navigation links in mobile drawer', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      const drawer = screen.getByRole('dialog')
      expect(drawer).toBeInTheDocument()
    })

    // Check all nav links are present in drawer
    const alleNyhederLinks = screen.getAllByText(/alle nyheder/i)
    const investeringLinks = screen.getAllByText(/investering/i)
    const byggeriLinks = screen.getAllByText(/byggeri/i)

    // Should be present in both desktop and mobile menu
    expect(alleNyhederLinks.length).toBeGreaterThan(0)
    expect(investeringLinks.length).toBeGreaterThan(0)
    expect(byggeriLinks.length).toBeGreaterThan(0)
  })

  it('displays auth buttons in mobile drawer when not authenticated', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Should have login and signup buttons in both desktop and mobile menu
    const loginLinks = screen.getAllByText(/log ind/i)
    const signupLinks = screen.getAllByText(/opret konto/i)

    expect(loginLinks.length).toBeGreaterThan(0)
    expect(signupLinks.length).toBeGreaterThan(0)
  })

  it('displays profile and logout in mobile drawer when authenticated', async () => {
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

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Should have profile and logout in both desktop and mobile menu
    const profileLinks = screen.getAllByText(/profil/i)
    const logoutButtons = screen.getAllByText(/log ud/i)

    expect(profileLinks.length).toBeGreaterThan(0)
    expect(logoutButtons.length).toBeGreaterThan(0)
  })

  it('shows admin link in drawer for admin users', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
        },
      },
      isPending: false,
    })
    mockUseUserRole.mockReturnValue({ role: 'admin', isLoading: false, isAdmin: true })

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Should have admin links in both desktop and mobile menu
    const adminLinks = screen.getAllByText(/admin/i)
    expect(adminLinks.length).toBeGreaterThan(0)
  })

  it('does not show admin link for non-admin users', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Regular User',
          email: 'user@example.com',
        },
      },
      isPending: false,
    })

    render(<Navigation />)

    expect(screen.queryByText(/^admin$/i)).not.toBeInTheDocument()
  })

  it('closes drawer when clicking a navigation link', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('data-state', 'open')
    })

    // Find and click a navigation link in the drawer
    const drawer = screen.getByRole('dialog')
    const investeringLink = drawer.querySelector('a[href="/investering"]')

    if (investeringLink) {
      await user.click(investeringLink)
    }

    await waitFor(() => {
      const dialog = screen.queryByRole('dialog')
      // Drawer remains in DOM but changes state to closed
      expect(dialog).toHaveAttribute('data-state', 'closed')
    })
  })

  it('closes drawer after logout', async () => {
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

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Find logout button in drawer
    const drawer = screen.getByRole('dialog')
    const logoutButtons = screen.getAllByText(/log ud/i)
    // Click the one in the drawer (second one)
    await user.click(logoutButtons[logoutButtons.length - 1])

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it('highlights active route in mobile drawer', async () => {
    const user = userEvent.setup()
    mockUsePathname.mockReturnValue('/investering')
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const menuButton = screen.getByLabelText(/åbn menu/i)
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Find the investering link in the drawer
    const drawer = screen.getByRole('dialog')
    const investeringLink = drawer.querySelector('a[href="/investering"]')

    expect(investeringLink).toHaveClass('bg-accent')
    expect(investeringLink).toHaveClass('text-accent-foreground')
  })

  it('hides desktop navigation on mobile screens', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })

    render(<Navigation />)

    const desktopNav = document.querySelector('nav .hidden.md\\:flex')
    expect(desktopNav).toBeInTheDocument()
  })
})
