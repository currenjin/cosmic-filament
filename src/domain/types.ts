export interface Thought {
  id: string
  title: string
  summary?: string
  created?: string
  source?: string
  status?: string
  thought_form?: string
  card_path?: string
}

export interface Concept {
  id: string
  name: string
  status?: string
  aliases?: string[]
  mention_count?: number
}

export interface ThoughtLink {
  id: string
  source: string
  target: string
  type: string
  confidence?: string
  basis?: string
  reason?: string
  created?: string
}

export interface ThoughtDatabase {
  thoughts: Thought[]
  concepts: Concept[]
  edges: ThoughtLink[]
}

interface BaseFilamentNode {
  id: string
  label: string
  connectionCount: number
}

export interface ThoughtNode extends BaseFilamentNode {
  kind: 'thought'
  thought: Thought
}

export interface IndexNode extends BaseFilamentNode {
  kind: 'index'
  concept: Concept
}

export type FilamentNode = ThoughtNode | IndexNode

export interface FilamentEdge {
  id: string
  source: string
  target: string
  type: string
  confidence?: string
  basis?: string
  reason?: string
}

export interface FilamentGraph {
  nodes: FilamentNode[]
  edges: FilamentEdge[]
  diagnostics: string[]
}

export interface RelatedThought {
  thoughtId: string
  thoughtTitle: string
  sharedIndexes: string[]
}
