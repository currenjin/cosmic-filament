import type { CosmicWeb } from '../domain/types'

const LABEL_MAX_LENGTH = 20

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

export function getEmphasisIds(web: CosmicWeb, anchorId?: string): GraphEmphasis {
  if (!anchorId) {
    return { hot: new Set(), neighbors: new Set(), dimmed: new Set() }
  }

  const neighbors = new Set<string>()
  for (const edge of web.edges) {
    if (edge.source === anchorId) neighbors.add(edge.target)
    if (edge.target === anchorId) neighbors.add(edge.source)
  }

  const dimmed = new Set(
    web.nodes
      .map((node) => node.id)
      .filter((id) => id !== anchorId && !neighbors.has(id)),
  )

  return { hot: new Set([anchorId]), neighbors, dimmed }
}
