import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LabelToggle } from './LabelToggle'

describe('LabelToggle', () => {
  it('exposes the node-label visibility state and toggles it', () => {
    const onChange = vi.fn()
    render(<LabelToggle visible={false} onChange={onChange} />)

    const button = screen.getByRole('button', { name: '노드 이름 표시' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
