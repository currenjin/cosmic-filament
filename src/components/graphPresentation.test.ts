import { describe, expect, it } from 'vitest'
import type { FilamentGraph } from '../domain/types'
import { createInteractiveForceLayoutOptions, getEmphasisIds, getViewPresentation, graphLabel } from './graphPresentation'

const graph: FilamentGraph = {
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
    expect(getEmphasisIds(graph, 'index:x')).toEqual({
      hot: new Set(['index:x']),
      neighbors: new Set(['thought:a', 'thought:b']),
      dimmed: new Set(['index:y']),
    })
  })

  it('keeps the full graph visible when there is no hover or focus anchor', () => {
    expect(getEmphasisIds(graph)).toEqual({
      hot: new Set(),
      neighbors: new Set(),
      dimmed: new Set(),
    })
  })

  it('highlights overlaps without fading the rest of the graph', () => {
    expect(getViewPresentation(graph, 'overlap')).toEqual({
      visible: new Set(['thought:a', 'index:x', 'thought:b', 'index:y']),
      highlighted: new Set(['thought:a', 'index:x', 'thought:b']),
    })
  })

  it('shortens long labels in the same compact graph style', () => {
    expect(graphLabel('123456789012345678901')).toBe('1234567890123456789…')
    expect(graphLabel('짧은 제목')).toBe('짧은 제목')
  })

  it('keeps force physics alive while allowing dragged nodes to spring back into the graph', () => {
    const options = createInteractiveForceLayoutOptions()
    expect(options).toMatchObject({
      name: 'd3-force',
      animate: true,
      infinite: true,
      ungrabifyWhileSimulating: false,
      fixedAfterDragging: false,
      linkDistance: 120,
    })
    expect(options.linkId({ id: 'thought:a' })).toBe('thought:a')
  })
})
