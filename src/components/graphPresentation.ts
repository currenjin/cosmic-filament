import type { FilamentGraph } from '../domain/types'

const LABEL_MAX_LENGTH = 20

export function createInteractiveForceLayoutOptions() {
  return {
    name: 'd3-force',
    animate: true,
    fit: false,
    padding: 32,
    randomize: true,
    infinite: true,
    ungrabifyWhileSimulating: false,
    fixedAfterDragging: false,
    alpha: 1,
    alphaMin: 0.001,
    alphaDecay: 0.03,
    alphaTarget: 0,
    velocityDecay: 0.4,
    collideRadius: 18,
    collideStrength: 0.8,
    linkDistance: 120,
    linkId: (node: { id: string }) => node.id,
    linkStrength: 0.25,
    manyBodyStrength: -500,
    xStrength: 0.05,
    yStrength: 0.05,
  } as const
}

export interface GraphEmphasis {
  hot: Set<string>
  neighbors: Set<string>
  dimmed: Set<string>
}

export function graphLabel(label: string): string {
  return label.length > LABEL_MAX_LENGTH
    ? `${label.slice(0, LABEL_MAX_LENGTH - 1)}…`
    : label
}

export function getEmphasisIds(graph: FilamentGraph, anchorId?: string): GraphEmphasis {
  if (!anchorId) {
    return { hot: new Set(), neighbors: new Set(), dimmed: new Set() }
  }

  const neighbors = new Set<string>()
  for (const edge of graph.edges) {
    if (edge.source === anchorId) neighbors.add(edge.target)
    if (edge.target === anchorId) neighbors.add(edge.source)
  }

  const dimmed = new Set(
    graph.nodes
      .map((node) => node.id)
      .filter((id) => id !== anchorId && !neighbors.has(id)),
  )

  return { hot: new Set([anchorId]), neighbors, dimmed }
}
