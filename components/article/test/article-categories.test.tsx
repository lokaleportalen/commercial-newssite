import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticleCategories } from '../article-categories'

describe('ArticleCategories', () => {
  it('renders nothing when categories array is empty', () => {
    const { container } = render(<ArticleCategories categories={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all categories when less than or equal to 3', () => {
    const categories = ['Investering', 'Byggeri', 'Udvikling']
    render(<ArticleCategories categories={categories} />)

    expect(screen.getByText('Investering')).toBeInTheDocument()
    expect(screen.getByText('Byggeri')).toBeInTheDocument()
    expect(screen.getByText('Udvikling')).toBeInTheDocument()
  })

  it('renders separators between categories', () => {
    const categories = ['Investering', 'Byggeri']
    render(<ArticleCategories categories={categories} />)

    const separators = screen.getAllByText('|')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('shows only first 3 categories when more than 3', () => {
    const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5']
    render(<ArticleCategories categories={categories} />)

    expect(screen.getByText('Cat1')).toBeInTheDocument()
    expect(screen.getByText('Cat2')).toBeInTheDocument()
    expect(screen.getByText('Cat3')).toBeInTheDocument()
    expect(screen.queryByText('Cat4')).not.toBeInTheDocument()
    expect(screen.queryByText('Cat5')).not.toBeInTheDocument()
  })

  it('shows expand button when more than 3 categories', () => {
    const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5']
    render(<ArticleCategories categories={categories} />)

    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('expands to show all categories when expand button clicked', async () => {
    const user = userEvent.setup()
    const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5']
    render(<ArticleCategories categories={categories} />)

    const expandButton = screen.getByText('+2')
    await user.click(expandButton)

    expect(screen.getByText('Cat1')).toBeInTheDocument()
    expect(screen.getByText('Cat2')).toBeInTheDocument()
    expect(screen.getByText('Cat3')).toBeInTheDocument()
    expect(screen.getByText('Cat4')).toBeInTheDocument()
    expect(screen.getByText('Cat5')).toBeInTheDocument()
  })

  it('shows collapse button after expanding', async () => {
    const user = userEvent.setup()
    const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5']
    render(<ArticleCategories categories={categories} />)

    await user.click(screen.getByText('+2'))

    expect(screen.getByText('Vis mindre')).toBeInTheDocument()
    expect(screen.queryByText('+2')).not.toBeInTheDocument()
  })

  it('collapses categories when collapse button clicked', async () => {
    const user = userEvent.setup()
    const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5']
    render(<ArticleCategories categories={categories} />)

    // Expand first
    await user.click(screen.getByText('+2'))
    expect(screen.getByText('Cat4')).toBeInTheDocument()

    // Then collapse
    await user.click(screen.getByText('Vis mindre'))

    expect(screen.queryByText('Cat4')).not.toBeInTheDocument()
    expect(screen.queryByText('Cat5')).not.toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('prevents event propagation when clicking expand/collapse', async () => {
    const user = userEvent.setup()
    const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4']
    const mockClick = vi.fn()

    const { container } = render(
      <div onClick={mockClick}>
        <ArticleCategories categories={categories} />
      </div>
    )

    const expandButton = screen.getByText('+1')
    await user.click(expandButton)

    // The parent onClick should not be called
    expect(mockClick).not.toHaveBeenCalled()
  })

  it('renders single category without separator', () => {
    const categories = ['Investering']
    render(<ArticleCategories categories={categories} />)

    expect(screen.getByText('Investering')).toBeInTheDocument()
    expect(screen.queryByText('|')).not.toBeInTheDocument()
  })

  it('calculates remaining count correctly', () => {
    const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5', 'Cat6']
    render(<ArticleCategories categories={categories} />)

    expect(screen.getByText('+3')).toBeInTheDocument()
  })
})
