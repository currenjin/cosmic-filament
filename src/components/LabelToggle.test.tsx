import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LabelToggle } from './LabelToggle'

describe('LabelToggle', () => {
  it('exposes the node-label visibility state and toggles it', () => {
    const onChange = vi.fn()
    render(<LabelToggle visible={false} onChange={onChange} />)

    const button = screen.getByRole('button', { name: '이름 모두 보기' })
    expect(button).toHaveTextContent('이름')
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
