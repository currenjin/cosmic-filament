import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { JunctionToggle } from './JunctionToggle'

describe('JunctionToggle', () => {
  it('toggles the highlight for indexes shared by multiple thoughts', () => {
    const onChange = vi.fn()
    render(<JunctionToggle active={false} onChange={onChange} />)
    const button = screen.getByRole('button', { name: '만나는 지점 강조' })

    expect(button).toHaveTextContent('만남')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})