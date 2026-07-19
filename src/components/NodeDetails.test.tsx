import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildCosmicWeb } from '../domain/graph'
import type { ThoughtDatabase } from '../domain/types'
import { NodeDetails } from './NodeDetails'

const database: ThoughtDatabase = {
  thoughts: [
    { id: 'thought-light', title: '우주 속의 빛', summary: '광대한 우주에서 밝은 빛을 바라본다.', created: '2026-07-14T00:49:28+09:00', card_path: 'cards/thought-light.md' },
    { id: 'thought-boy', title: '빛에 감싸인 소년', summary: '작은 소년이 빛에 감싸인다.', card_path: 'cards/thought-boy.md' },
  ],
  concepts: [{ id: 'concept-light', name: '빛' }],
  edges: [
    { id: 'edge-a', source: 'thought-light', target: 'concept-light', type: 'mentions', reason: "원문에 '빛'이 등장" },
    { id: 'edge-b', source: 'thought-boy', target: 'concept-light', type: 'mentions', reason: '빛에 감싸인 장면' },
  ],
}
const web = buildCosmicWeb(database)

describe('NodeDetails', () => {
  it('shows a thought, its indexes, and thoughts joined through shared indexes', () => {
    render(<NodeDetails nodeId="thought-light" web={web} basePath="/thoughts/" onClose={() => undefined} onSelect={() => undefined} />)
    expect(screen.getByRole('heading', { name: '우주 속의 빛' })).toBeVisible()
    expect(screen.getByText('광대한 우주에서 밝은 빛을 바라본다.')).toBeVisible()
    expect(screen.getByRole('button', { name: '빛 색인 보기' })).toBeVisible()
    expect(screen.getByText('빛에 감싸인 소년')).toBeVisible()
    expect(screen.getByText('빛으로 연결')).toBeVisible()
    expect(screen.getByRole('link', { name: '원문 보기' })).toHaveAttribute('href', '/thoughts/cards/thought-light.md')
  })

  it('lets the reader travel from an index to a connected thought', () => {
    const onSelect = vi.fn()
    render(<NodeDetails nodeId="concept-light" web={web} basePath="/thoughts/" onClose={() => undefined} onSelect={onSelect} />)
    expect(screen.getByRole('heading', { name: '빛' })).toBeVisible()
    expect(screen.getByText('2개의 생각이 이 지점에서 만남')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '우주 속의 빛 보기' }))
    expect(onSelect).toHaveBeenCalledWith('thought-light')
  })
})
