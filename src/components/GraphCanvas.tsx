import cytoscape, { type Core, type ElementDefinition, type StylesheetStyle } from 'cytoscape'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getNeighborhoodIds, getOverlapIds } from '../domain/graph'
import type { CosmicWeb } from '../domain/types'
import { getEmphasisIds, graphLabel } from './graphPresentation'
import type { ViewMode } from './ViewModeSwitch'

interface GraphCanvasProps {
  web: CosmicWeb
  mode: ViewMode
  selectedId?: string
  query: string
  showLabels: boolean
  onSelect: (nodeId: string) => void
}

const graphStyle = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'font-family': 'Pretendard, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      'font-size': 11,
      'font-weight': 600,
      color: '#d0d6e0',
      'text-opacity': 0,
      'text-outline-color': '#08090a',
      'text-outline-width': 2,
      'text-valign': 'bottom',
      'text-margin-y': 7,
      width: 'mapData(connectionCount, 0, 8, 8, 18)',
      height: 'mapData(connectionCount, 0, 8, 8, 18)',
      'background-color': '#8a8f98',
      'border-width': 0,
      'transition-property': 'opacity, background-color, border-width, width, height, text-opacity',
      'transition-duration': 150,
    },
  },
  {
    selector: 'node[kind = "index"]',
    style: {
      shape: 'ellipse',
      'background-color': '#7170ff',
      color: '#c9c8ff',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 'mapData(weight, 1, 3, 0.55, 1.65)',
      'line-color': '#686d84',
      opacity: 0.74,
      'curve-style': 'haystack',
      'haystack-radius': 0.35,
      'transition-property': 'opacity, line-color, width',
      'transition-duration': 150,
    },
  },
  { selector: '.faded', style: { opacity: 0.07 } },
  { selector: 'edge.faded', style: { opacity: 0.025 } },
  { selector: 'node.zoom-labeled', style: { 'text-opacity': 1 } },
  { selector: 'node.labels-visible', style: { 'text-opacity': 1 } },
  { selector: 'node.hover-neighbor', style: { 'text-opacity': 1 } },
  { selector: 'node.hover-dim', style: { opacity: 0.1, 'text-opacity': 0 } },
  { selector: 'edge.hover-dim', style: { opacity: 0.04 } },
  {
    selector: 'node.hover-hot',
    style: {
      'background-color': '#ffffff',
      'border-color': 'rgba(255,255,255,0.22)',
      'border-width': 3,
      color: '#ffffff',
      'text-opacity': 1,
    },
  },
  { selector: 'edge.hover-active', style: { opacity: 0.9, width: 2.2 } },
  {
    selector: 'node.selected',
    style: {
      'background-color': '#ffffff',
      'border-color': '#eeeefe',
      'border-width': 2,
      color: '#ffffff',
      'text-opacity': 1,
      'font-size': 11,
      'font-weight': 600,
    },
  },
  {
    selector: 'node.search-hit',
    style: { 'border-color': '#a8ecff', 'border-width': 2, color: '#ffffff', 'text-opacity': 1 },
  },
  {
    selector: 'edge.active',
    style: { 'line-color': '#828fff', opacity: 0.95, width: 1.8 },
  },
] as unknown as StylesheetStyle[]

function toElements(web: CosmicWeb): ElementDefinition[] {
  const duplicatePairs = new Map<string, number>()
  for (const edge of web.edges) {
    const key = `${edge.source}::${edge.target}`
    duplicatePairs.set(key, (duplicatePairs.get(key) ?? 0) + 1)
  }
  return [
    ...web.nodes.map((node) => ({
      data: { id: node.id, label: graphLabel(node.label), kind: node.kind, connectionCount: node.connectionCount },
    })),
    ...web.edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        weight: duplicatePairs.get(`${edge.source}::${edge.target}`) ?? 1,
      },
    })),
  ]
}

export function GraphCanvas({ web, mode, selectedId, query, showLabels, onSelect }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [ready, setReady] = useState(false)
  const elements = useMemo(() => toElements(web), [web])

  useEffect(() => {
    if (!containerRef.current) return
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: graphStyle,
      minZoom: 0.25,
      maxZoom: 2.8,
      wheelSensitivity: 0.22,
      selectionType: 'single',
      boxSelectionEnabled: false,
      layout: {
        name: 'cose',
        animate: false,
        fit: true,
        padding: 32,
        nodeRepulsion: () => 7200,
        idealEdgeLength: () => 120,
        edgeElasticity: () => 90,
        gravity: 0.13,
        numIter: 1400,
        randomize: true,
      },
    })
    cy.on('tap', 'node', (event) => onSelect(event.target.id()))
    cy.on('mouseover', 'node', (event) => {
      const anchorId = event.target.id()
      const emphasis = getEmphasisIds(web, anchorId)
      cy.batch(() => {
        cy.elements().removeClass('hover-hot hover-neighbor hover-dim hover-active')
        cy.nodes().forEach((node) => {
          if (emphasis.hot.has(node.id())) node.addClass('hover-hot')
          else if (emphasis.neighbors.has(node.id())) node.addClass('hover-neighbor')
          else if (emphasis.dimmed.has(node.id())) node.addClass('hover-dim')
        })
        cy.edges().forEach((edge) => {
          if (edge.source().id() === anchorId || edge.target().id() === anchorId) edge.addClass('hover-active')
          else edge.addClass('hover-dim')
        })
      })
    })
    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('hover-hot hover-neighbor hover-dim hover-active')
    })
    const updateZoomLabels = () => {
      cy.nodes().toggleClass('zoom-labeled', cy.zoom() > 1.65)
    }
    cy.on('zoom', updateZoomLabels)
    updateZoomLabels()
    cyRef.current = cy
    setReady(true)
    window.requestAnimationFrame(() => {
      cy.fit(undefined, 32)
      if (containerRef.current && containerRef.current.clientWidth < 600 && cy.zoom() < 0.68) {
        cy.zoom({
          level: 0.68,
          renderedPosition: {
            x: containerRef.current.clientWidth / 2,
            y: containerRef.current.clientHeight / 2,
          },
        })
      }
    })
    return () => {
      setReady(false)
      cy.destroy()
      cyRef.current = null
    }
  }, [elements, onSelect, web])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy || !ready) return
    const visible = mode === 'nearby' && selectedId
      ? getNeighborhoodIds(web, selectedId)
      : mode === 'overlap'
        ? getOverlapIds(web)
        : new Set(web.nodes.map((node) => node.id))
    const normalizedQuery = query.trim().toLocaleLowerCase('ko')

    cy.batch(() => {
      cy.elements().removeClass('faded active selected search-hit')
      cy.nodes().forEach((node) => {
        if (!visible.has(node.id())) node.addClass('faded')
        if (node.id() === selectedId) node.addClass('selected')
        if (normalizedQuery && String(node.data('label')).toLocaleLowerCase('ko').includes(normalizedQuery)) {
          node.addClass('search-hit')
        }
      })
      cy.edges().forEach((edge) => {
        if (!visible.has(edge.source().id()) || !visible.has(edge.target().id())) edge.addClass('faded')
        if (selectedId && (edge.source().id() === selectedId || edge.target().id() === selectedId)) edge.addClass('active')
      })
    })
  }, [mode, query, ready, selectedId, web])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy || !ready) return
    cy.nodes().toggleClass('labels-visible', showLabels)
  }, [ready, showLabels])

  function zoomBy(factor: number) {
    const cy = cyRef.current
    if (cy) cy.animate({ zoom: cy.zoom() * factor, duration: 180 })
  }

  return (
    <section className="graph-stage" aria-label="Cosmic Web 그래프">
      <div ref={containerRef} className="cytoscape-canvas" />
      <div className="graph-controls" aria-label="그래프 조절">
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="확대">＋</button>
        <button type="button" onClick={() => zoomBy(0.8)} aria-label="축소">−</button>
        <button type="button" onClick={() => cyRef.current?.fit(undefined, 32)} aria-label="전체 맞춤">⌂</button>
      </div>
      <div className="legend" aria-label="범례">
        <span><i className="thought-dot" />생각</span>
        <span><i className="index-dot" />색인</span>
        <span><i className="filament-line" />필라멘트</span>
      </div>
    </section>
  )
}
