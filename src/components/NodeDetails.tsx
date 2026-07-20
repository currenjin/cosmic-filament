import { findRelatedThoughts } from '../domain/graph'
import type { FilamentGraph, FilamentNode } from '../domain/types'

interface NodeDetailsProps {
  nodeId: string
  graph: FilamentGraph
  basePath: string
  onClose: () => void
  onSelect: (nodeId: string) => void
}

function safeCardUrl(basePath: string, cardPath?: string): string | undefined {
  if (!cardPath || !cardPath.startsWith('cards/') || cardPath.includes('..')) return undefined
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`
  return `${base}${cardPath}`
}

function connectedNodes(graph: FilamentGraph, nodeId: string): FilamentNode[] {
  const ids = new Set<string>()
  for (const edge of graph.edges) {
    if (edge.source === nodeId) ids.add(edge.target)
    if (edge.target === nodeId) ids.add(edge.source)
  }
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]))
  return [...ids].map((id) => nodesById.get(id)).filter((node): node is FilamentNode => node !== undefined)
}

export function NodeDetails({ nodeId, graph, basePath, onClose, onSelect }: NodeDetailsProps) {
  const node = graph.nodes.find((candidate) => candidate.id === nodeId)
  if (!node) return null

  if (node.kind === 'index') {
    const thoughts = connectedNodes(graph, nodeId)
      .filter((candidate) => candidate.kind === 'thought')
      .sort((a, b) => a.label.localeCompare(b.label, 'ko'))
    return (
      <aside className="node-details" aria-label="색인 상세">
        <div className="sheet-handle" aria-hidden="true" />
        <button className="close-details" type="button" onClick={onClose} aria-label="닫기">×</button>
        <span className="eyebrow">COSMIC JUNCTION</span>
        <h2>{node.label}</h2>
        <p>{thoughts.length}개의 생각이 이 접점에서 연결됨</p>
        <div className="detail-list">
          {thoughts.map((thought) => (
            <button type="button" key={thought.id} aria-label={`${thought.label} 보기`} onClick={() => onSelect(thought.id)}>
              <strong>{thought.label}</strong>
              <span>생각으로 이동</span>
            </button>
          ))}
        </div>
      </aside>
    )
  }

  const indexes = connectedNodes(graph, nodeId)
    .filter((candidate) => candidate.kind === 'index')
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'))
  const related = findRelatedThoughts(graph, nodeId)
  const cardUrl = safeCardUrl(basePath, node.thought.card_path)

  return (
    <aside className="node-details" aria-label="생각 상세">
      <div className="sheet-handle" aria-hidden="true" />
      <button className="close-details" type="button" onClick={onClose} aria-label="닫기">×</button>
      <span className="eyebrow">LUMINOUS THOUGHT</span>
      <h2>{node.label}</h2>
      {node.thought.summary && <p>{node.thought.summary}</p>}
      <div className="index-pills" aria-label="색인">
        {indexes.map((index) => (
          <button type="button" key={index.id} aria-label={`${index.label} 색인 보기`} onClick={() => onSelect(index.id)}>
            {index.label}
          </button>
        ))}
      </div>
      {related.length > 0 && (
        <section className="related-thoughts">
          <h3>같은 필라멘트에 있는 생각</h3>
          {related.map((item) => (
            <button type="button" key={item.thoughtId} onClick={() => onSelect(item.thoughtId)}>
              <strong>{item.thoughtTitle}</strong>
              <span>{item.sharedIndexes.join(' · ')}으로 연결</span>
            </button>
          ))}
        </section>
      )}
      {cardUrl && <a className="open-card" href={cardUrl} target="_blank" rel="noreferrer">원문 보기</a>}
    </aside>
  )
}
