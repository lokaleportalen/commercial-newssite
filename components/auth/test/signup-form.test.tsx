import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '../signup-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}))

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockSignUp = authClient.signUp.email as ReturnType<typeof vi.fn>

vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
  refresh: mockRefresh,
} as any)

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signup form with all elements', () => {
    render(<SignupForm />)

    expect(screen.getByText('Opret en konto')).toBeInTheDocument()
    expect(screen.getByLabelText('Fulde navn')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Adgangskode')).toBeInTheDocument()
    expect(screen.getByLabelText('Bekræft adgangskode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /opret konto/i })).toBeInTheDocument()
    expect(screen.getByText(/Har du allerede en konto?/i)).toBeInTheDocument()
  })

  it('updates input values when user types', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const nameInput = screen.getByLabelText('Fulde navn') as HTMLInputElement
    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Adgangskode') as HTMLInputElement
    const confirmPasswordInput = screen.getByLabelText('Bekræft adgangskode') as HTMLInputElement

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    expect(nameInput.value).toBe('Test User')
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
    expect(confirmPasswordInput.value).toBe('password123')
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByLabelText('Fulde navn'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'password123')
    await user.type(screen.getByLabelText('Bekræft adgangskode'), 'password456')
    await user.click(screen.getByRole('button', { name: /opret konto/i }))

    await waitFor(() => {
      expect(screen.getByText('Adgangskoderne matcher ikke')).toBeInTheDocument()
    })

    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByLabelText('Fulde navn'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'pass')
    await user.type(screen.getByLabelText('Bekræft adgangskode'), 'pass')
    await user.click(screen.getByRole('button', { name: /opret konto/i }))

    await waitFor(() => {
      expect(screen.getByText('Adgangskoden skal være mindst 8 tegn lang')).toBeInTheDocument()
    })

    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null })

    render(<SignupForm />)

    await user.type(screen.getByLabelText('Fulde navn'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'password123')
    await user.type(screen.getByLabelText('Bekræft adgangskode'), 'password123')
    await user.click(screen.getByRole('button', { name: /opret konto/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/onboarding')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('displays error message on failed signup', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already exists' }
    })

    render(<SignupForm />)

    await user.type(screen.getByLabelText('Fulde navn'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'existing@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'password123')
    await user.type(screen.getByLabelText('Bekræft adgangskode'), 'password123')
    await user.click(screen.getByRole('button', { name: /opret konto/i }))

    await waitFor(() => {
      expect(screen.getByText('Der opstod en fejl. Prøv venligst igen.')).toBeInTheDocument()
    })
  })

  it('disables form inputs during submission', async () => {
    const user = userEvent.setup()
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100)))

    render(<SignupForm />)

    await user.type(screen.getByLabelText('Fulde navn'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'password123')
    await user.type(screen.getByLabelText('Bekræft adgangskode'), 'password123')
    await user.click(screen.getByRole('button', { name: /opret konto/i }))

    const nameInput = screen.getByLabelText('Fulde navn') as HTMLInputElement
    const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement
    const submitButton = screen.getByRole('button') as HTMLButtonElement

    expect(nameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('shows loading text during submission', async () => {
    const user = userEvent.setup()
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100)))

    render(<SignupForm />)

    await user.type(screen.getByLabelText('Fulde navn'), 'Test User')
    await user.type(screen.getByLabelText('E-mail'), 'test@example.com')
    await user.type(screen.getByLabelText('Adgangskode'), 'password123')
    await user.type(screen.getByLabelText('Bekræft adgangskode'), 'password123')
    await user.click(screen.getByRole('button', { name: /opret konto/i }))

    expect(screen.getByText('Opretter konto...')).toBeInTheDocument()
  })
})
