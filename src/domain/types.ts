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

interface BaseWebNode {
  id: string
  label: string
  connectionCount: number
}

export interface ThoughtNode extends BaseWebNode {
  kind: 'thought'
  thought: Thought
}

export interface IndexNode extends BaseWebNode {
  kind: 'index'
  concept: Concept
}

export type WebNode = ThoughtNode | IndexNode

export interface WebEdge {
  id: string
  source: string
  target: string
  type: string
  confidence?: string
  basis?: string
  reason?: string
}

export interface CosmicWeb {
  nodes: WebNode[]
  edges: WebEdge[]
  diagnostics: string[]
}

export interface RelatedThought {
  thoughtId: string
  thoughtTitle: string
  sharedIndexes: string[]
}
