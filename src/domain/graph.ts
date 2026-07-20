import type { FilamentGraph, RelatedThought, ThoughtDatabase, FilamentEdge, FilamentNode } from './types'

function adjacencyFor(graph: FilamentGraph): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>()
  for (const node of graph.nodes) adjacency.set(node.id, new Set())
  for (const edge of graph.edges) {
    adjacency.get(edge.source)?.add(edge.target)
    adjacency.get(edge.target)?.add(edge.source)
  }
  return adjacency
}

export function buildFilamentGraph(database: ThoughtDatabase): FilamentGraph {
  const thoughtsById = new Map(database.thoughts.map((thought) => [thought.id, thought]))
  const conceptsById = new Map(database.concepts.map((concept) => [concept.id, concept]))
  const diagnostics: string[] = []
  const validEdges: FilamentEdge[] = []

  for (const edge of database.edges) {
    if (!thoughtsById.has(edge.source)) {
      diagnostics.push(`${edge.id}: missing source ${edge.source}`)
      continue
    }
    if (!conceptsById.has(edge.target)) {
      diagnostics.push(`${edge.id}: missing target ${edge.target}`)
      continue
    }
    validEdges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      confidence: edge.confidence,
      basis: edge.basis,
      reason: edge.reason,
    })
  }

  const connectedThoughtsByIndex = new Map<string, Set<string>>()
  const connectionsByThought = new Map<string, number>()
  for (const edge of validEdges) {
    const connected = connectedThoughtsByIndex.get(edge.target) ?? new Set<string>()
    connected.add(edge.source)
    connectedThoughtsByIndex.set(edge.target, connected)
    connectionsByThought.set(edge.source, (connectionsByThought.get(edge.source) ?? 0) + 1)
  }

  const nodes: FilamentNode[] = [
    ...database.thoughts.map((thought): FilamentNode => ({
      id: thought.id,
      label: thought.title,
      kind: 'thought',
      thought,
      connectionCount: connectionsByThought.get(thought.id) ?? 0,
    })),
    ...database.concepts.map((concept): FilamentNode => ({
      id: concept.id,
      label: concept.name,
      kind: 'index',
      concept,
      connectionCount: connectedThoughtsByIndex.get(concept.id)?.size ?? 0,
    })),
  ]

  return { nodes, edges: validEdges, diagnostics }
}

export function getNeighborhoodIds(graph: FilamentGraph, selectedId: string): Set<string> {
  const adjacency = adjacencyFor(graph)
  if (!adjacency.has(selectedId)) return new Set()
  const result = new Set([selectedId])
  let frontier = new Set([selectedId])
  for (let depth = 0; depth < 2; depth += 1) {
    const next = new Set<string>()
    for (const id of frontier) {
      for (const neighbor of adjacency.get(id) ?? []) {
        if (!result.has(neighbor)) next.add(neighbor)
        result.add(neighbor)
      }
    }
    frontier = next
  }
  return result
}

export function getOverlapIds(graph: FilamentGraph): Set<string> {
  const adjacency = adjacencyFor(graph)
  const result = new Set<string>()
  for (const node of graph.nodes) {
    if (node.kind !== 'index' || node.connectionCount < 2) continue
    result.add(node.id)
    for (const thoughtId of adjacency.get(node.id) ?? []) result.add(thoughtId)
  }
  return result
}

export function findRelatedThoughts(graph: FilamentGraph, thoughtId: string): RelatedThought[] {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]))
  const adjacency = adjacencyFor(graph)
  const related = new Map<string, Set<string>>()

  for (const indexId of adjacency.get(thoughtId) ?? []) {
    const indexNode = nodesById.get(indexId)
    if (indexNode?.kind !== 'index') continue
    for (const candidateId of adjacency.get(indexId) ?? []) {
      if (candidateId === thoughtId) continue
      const candidate = nodesById.get(candidateId)
      if (candidate?.kind !== 'thought') continue
      const shared = related.get(candidateId) ?? new Set<string>()
      shared.add(indexNode.label)
      related.set(candidateId, shared)
    }
  }

  return [...related.entries()]
    .map(([candidateId, sharedIndexes]) => {
      const candidate = nodesById.get(candidateId)
      if (!candidate || candidate.kind !== 'thought') return null
      return {
        thoughtId: candidateId,
        thoughtTitle: candidate.label,
        sharedIndexes: [...sharedIndexes].sort((a, b) => a.localeCompare(b, 'ko')),
      }
    })
    .filter((item): item is RelatedThought => item !== null)
    .sort((a, b) => b.sharedIndexes.length - a.sharedIndexes.length || a.thoughtTitle.localeCompare(b.thoughtTitle, 'ko'))
}
