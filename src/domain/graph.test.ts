import { describe, expect, it } from 'vitest'
import { buildFilamentGraph, findRelatedThoughts, getNeighborhoodIds, getOverlapIds } from './graph'
import type { ThoughtDatabase } from './types'

const database: ThoughtDatabase = {
  thoughts: [
    { id: 'thought-light', title: '우주 속의 빛', summary: '광대한 우주에서 빛을 바라본다.', created: '2026-07-14T00:49:28+09:00', card_path: 'cards/thought-light.md' },
    { id: 'thought-boy', title: '빛에 감싸인 소년', summary: '작은 소년이 빛에 감싸인다.', created: '2026-07-14T00:49:55+09:00', card_path: 'cards/thought-boy.md' },
    { id: 'thought-book', title: '종이책의 촉감', summary: '손으로 넘기며 읽는 감각을 묻는다.', created: '2026-07-02T20:12:20+09:00', card_path: 'cards/thought-book.md' },
  ],
  concepts: [
    { id: 'concept-light', name: '빛', status: 'candidate', mention_count: 2 },
    { id: 'concept-space', name: '우주', status: 'candidate', mention_count: 1 },
  ],
  edges: [
    { id: 'edge-1', source: 'thought-light', target: 'concept-light', type: 'mentions', confidence: 'strong', basis: 'explicit', reason: "원문에 '빛'이 등장" },
    { id: 'edge-2', source: 'thought-boy', target: 'concept-light', type: 'relates_to', confidence: 'candidate', basis: 'derived', reason: '빛에 감싸이는 장면' },
    { id: 'edge-3', source: 'thought-light', target: 'concept-space', type: 'mentions', confidence: 'strong', basis: 'explicit', reason: "원문에 '우주'가 등장" },
    { id: 'edge-orphan', source: 'thought-book', target: 'missing-concept', type: 'possible_theme', confidence: 'weak', basis: 'contextual', reason: '존재하지 않는 색인' },
  ],
}

describe('buildFilamentGraph', () => {
  it('keeps valid thought-to-index filaments and reports orphan links', () => {
    const graph = buildFilamentGraph(database)
    expect(graph.nodes).toHaveLength(5)
    expect(graph.edges).toHaveLength(3)
    expect(graph.edges[0]).toMatchObject({ source: 'thought-light', target: 'concept-light', reason: "원문에 '빛'이 등장" })
    expect(graph.diagnostics).toEqual(['edge-orphan: missing target missing-concept'])
  })

  it('marks index nodes by the number of connected thoughts', () => {
    const graph = buildFilamentGraph(database)
    expect(graph.nodes.find((node) => node.id === 'concept-light')).toMatchObject({ kind: 'index', connectionCount: 2 })
    expect(graph.nodes.find((node) => node.id === 'concept-space')).toMatchObject({ kind: 'index', connectionCount: 1 })
  })
})

describe('graph exploration', () => {
  it('finds a thought, its indexes, and thoughts sharing those indexes', () => {
    expect(getNeighborhoodIds(buildFilamentGraph(database), 'thought-light')).toEqual(new Set(['thought-light', 'concept-light', 'concept-space', 'thought-boy']))
  })

  it('defines overlap only through index nodes connected to multiple thoughts', () => {
    expect(getOverlapIds(buildFilamentGraph(database))).toEqual(new Set(['concept-light', 'thought-light', 'thought-boy']))
  })

  it('explains related thoughts with the exact shared indexes', () => {
    expect(findRelatedThoughts(buildFilamentGraph(database), 'thought-light')).toEqual([
      { thoughtId: 'thought-boy', thoughtTitle: '빛에 감싸인 소년', sharedIndexes: ['빛'] },
    ])
  })
})
