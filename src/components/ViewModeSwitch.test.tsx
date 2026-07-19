import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ViewModeSwitch } from './ViewModeSwitch'

describe('ViewModeSwitch', () => {
  it('exposes the Cosmic Web exploration modes and changes the active mode', () => {
    const onChange = vi.fn()
    render(<ViewModeSwitch value="all" onChange={onChange} />)
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '내 주변' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '겹침' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: '겹침' }))
    expect(onChange).toHaveBeenCalledWith('overlap')
  })
})
