import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingForm } from './onboarding-form'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('OnboardingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders onboarding form with all elements', () => {
    render(<OnboardingForm />)

    expect(screen.getByText('Definér hvilke nyheder du vil have')).toBeInTheDocument()
    expect(screen.getByText('Nyhedskategorier')).toBeInTheDocument()
    expect(screen.getByText('Hyppighed for nyheder')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bekræft/i })).toBeInTheDocument()
  })

  it('renders all news category options', () => {
    render(<OnboardingForm />)

    expect(screen.getByText('Alle nyheder')).toBeInTheDocument()
    expect(screen.getByText('Investeringsnyheder')).toBeInTheDocument()
    expect(screen.getByText('Bygudvikling')).toBeInTheDocument()
    expect(screen.getByText('D nyt')).toBeInTheDocument()
    expect(screen.getByText('E nyt')).toBeInTheDocument()
  })

  it('renders email frequency options', () => {
    render(<OnboardingForm />)

    expect(screen.getByText(/Send mig en mail hver gang der er en relevant nyhed/i)).toBeInTheDocument()
    expect(screen.getByText(/Send mig relevante nyheder 1 gang om dagen/i)).toBeInTheDocument()
  })

  it('has default values selected', () => {
    render(<OnboardingForm />)

    const allNewsRadio = screen.getByRole('radio', { name: /alle nyheder/i }) as HTMLInputElement
    const dailyRadio = screen.getByRole('radio', { name: /send mig relevante nyheder 1 gang om dagen/i }) as HTMLInputElement

    expect(allNewsRadio).toBeChecked()
    expect(dailyRadio).toBeChecked()
  })

  it('allows user to change news category', async () => {
    const user = userEvent.setup()
    render(<OnboardingForm />)

    const investmentRadio = screen.getByRole('radio', { name: /investeringsnyheder/i }) as HTMLInputElement
    await user.click(investmentRadio)

    expect(investmentRadio).toBeChecked()
  })

  it('allows user to change email frequency', async () => {
    const user = userEvent.setup()
    render(<OnboardingForm />)

    const immediateRadio = screen.getByRole('radio', { name: /send mig en mail hver gang der er en relevant nyhed/i }) as HTMLInputElement
    await user.click(immediateRadio)

    expect(immediateRadio).toBeChecked()
  })

  it('submits form with selected preferences', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    render(<OnboardingForm />)

    await user.click(screen.getByRole('radio', { name: /investeringsnyheder/i }))
    await user.click(screen.getByRole('radio', { name: /send mig en mail hver gang der er en relevant nyhed/i }))
    await user.click(screen.getByRole('button', { name: /bekræft/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsCategory: 'investment',
          emailFrequency: 'immediate',
        }),
      })
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('displays error message on failed submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500
    })

    render(<OnboardingForm />)

    await user.click(screen.getByRole('button', { name: /bekræft/i }))

    await waitFor(() => {
      expect(screen.getByText('Der opstod en fejl. Prøv venligst igen.')).toBeInTheDocument()
    })
  })

  it('handles skip button click', async () => {
    const user = userEvent.setup()
    render(<OnboardingForm />)

    const skipButton = screen.getByText(/Du kan altid ændrede nyheder hurtigt og slet/i)
    await user.click(skipButton)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('disables submit button during submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<OnboardingForm />)

    await user.click(screen.getByRole('button', { name: /bekræft/i }))

    const submitButton = screen.getByRole('button', { name: /gemmer/i }) as HTMLButtonElement
    expect(submitButton).toBeDisabled()
  })

  it('shows loading text during submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<OnboardingForm />)

    await user.click(screen.getByRole('button', { name: /bekræft/i }))

    expect(screen.getByText('Gemmer...')).toBeInTheDocument()
  })
})
