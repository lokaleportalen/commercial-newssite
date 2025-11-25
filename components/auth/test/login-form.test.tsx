import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../login-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}))

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockSignIn = authClient.signIn.email as ReturnType<typeof vi.fn>

vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
  refresh: mockRefresh,
} as any)

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with all elements', () => {
    render(<LoginForm />)

    expect(screen.getByText('Log ind på din konto')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Adgangskode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log ind/i })).toBeInTheDocument()
    expect(screen.getByText('Glemt adgangskode?')).toBeInTheDocument()
    expect(screen.getByText(/Har du ikke en konto?/i)).toBeInTheDocument()
  })

  it('updates input values when user types', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Adgangskode') as HTMLInputElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('submits form with correct credentials', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ data: { user: { id: '1' } }, error: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'password123')
    await user.click(screen.getByRole('button', { name: /log ind/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' }
    })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /log ind/i }))

    await waitFor(() => {
      expect(screen.getByText('Forkert e-mail eller adgangskode')).toBeInTheDocument()
    })
  })

  it('disables form inputs and button during submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100)))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Adgangskode') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /log ind/i }) as HTMLButtonElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('shows loading indicator during submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100)))

    render(<LoginForm />)

    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'password123')
    await user.click(screen.getByRole('button', { name: /log ind/i }))

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
