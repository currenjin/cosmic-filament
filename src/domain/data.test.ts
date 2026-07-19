import { describe, expect, it } from 'vitest'
import { parseThoughtDatabase } from './data'

describe('parseThoughtDatabase', () => {
  it('accepts the existing Thought DB envelope shape', () => {
    const result = parseThoughtDatabase(
      { thoughts: [{ id: 'thought-1', title: '생각', summary: '요약' }] },
      { concepts: [{ id: 'concept-1', name: '빛' }] },
      { edges: [{ id: 'edge-1', source: 'thought-1', target: 'concept-1', type: 'mentions' }] },
    )
    expect(result).toMatchObject({
      thoughts: [{ id: 'thought-1', title: '생각' }],
      concepts: [{ id: 'concept-1', name: '빛' }],
      edges: [{ source: 'thought-1', target: 'concept-1' }],
    })
  })

  it('rejects malformed public data instead of rendering a misleading web', () => {
    expect(() => parseThoughtDatabase(
      { thoughts: [{ id: 'thought-1' }] },
      { concepts: [] },
      { edges: [] },
    )).toThrow('thoughts[0].title must be a non-empty string')
  })
})
