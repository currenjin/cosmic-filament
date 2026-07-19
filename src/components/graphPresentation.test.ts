import { describe, expect, it } from 'vitest'
import type { CosmicWeb } from '../domain/types'
import { getEmphasisIds, graphLabel } from './graphPresentation'

const web: CosmicWeb = {
  nodes: [
    { id: 'thought:a', label: '첫 생각', kind: 'thought', connectionCount: 1, thought: { id: 'a', title: '첫 생각' } },
    { id: 'index:x', label: '성찰', kind: 'index', connectionCount: 2, concept: { id: 'x', name: '성찰' } },
    { id: 'thought:b', label: '둘째 생각', kind: 'thought', connectionCount: 1, thought: { id: 'b', title: '둘째 생각' } },
    { id: 'index:y', label: '고립 색인', kind: 'index', connectionCount: 0, concept: { id: 'y', name: '고립 색인' } },
  ],
  edges: [
    { id: 'a-x', source: 'thought:a', target: 'index:x', type: 'mentions' },
    { id: 'b-x', source: 'thought:b', target: 'index:x', type: 'mentions' },
  ],
  diagnostics: [],
}

describe('currenjin graph presentation', () => {
  it('emphasizes the anchor and its direct neighbors while dimming unrelated nodes', () => {
    expect(getEmphasisIds(web, 'index:x')).toEqual({
      hot: new Set(['index:x']),
      neighbors: new Set(['thought:a', 'thought:b']),
      dimmed: new Set(['index:y']),
    })
  })

  it('keeps the full graph visible when there is no hover or focus anchor', () => {
    expect(getEmphasisIds(web)).toEqual({
      hot: new Set(),
      neighbors: new Set(),
      dimmed: new Set(),
    })
  })

  it('shortens long labels in the same compact graph style', () => {
    expect(graphLabel('123456789012345678901')).toBe('1234567890123456789…')
    expect(graphLabel('짧은 제목')).toBe('짧은 제목')
  })
})
