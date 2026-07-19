import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { NodeDetails } from './components/NodeDetails'
import { ViewModeSwitch, type ViewMode } from './components/ViewModeSwitch'
import { loadThoughtDatabase } from './domain/data'
import { buildCosmicWeb } from './domain/graph'
import type { ThoughtDatabase } from './domain/types'
import './styles.css'

interface AppProps { initialDatabase?: ThoughtDatabase }
const basePath = import.meta.env.BASE_URL
const GraphCanvas = lazy(async () => {
  const module = await import('./components/GraphCanvas')
  return { default: module.GraphCanvas }
})

export default function App({ initialDatabase }: AppProps) {
  const [database, setDatabase] = useState<ThoughtDatabase | undefined>(initialDatabase)
  const [error, setError] = useState<string>()
  const [selectedId, setSelectedId] = useState<string>()
  const [mode, setMode] = useState<ViewMode>('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (initialDatabase) return
    const controller = new AbortController()
    loadThoughtDatabase(`${basePath}data/`, controller.signal)
      .then(setDatabase)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : '생각 지도를 불러오지 못했습니다.')
      })
    return () => controller.abort()
  }, [initialDatabase])

  const web = useMemo(() => database ? buildCosmicWeb(database) : undefined, [database])
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ko')
    if (!web || !normalized) return []
    return web.nodes.filter((node) => node.label.toLocaleLowerCase('ko').includes(normalized)).slice(0, 8)
  }, [query, web])

  const selectNode = useCallback((nodeId: string) => {
    setSelectedId(nodeId)
    setSearchOpen(false)
    setQuery('')
  }, [])

  if (error) {
    return (
      <main className="status-screen">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <h1>Cosmic Filament</h1>
        <p>우주망을 불러오지 못했습니다.</p>
        <code>{error}</code>
        <button type="button" onClick={() => window.location.reload()}>다시 시도</button>
      </main>
    )
  }

  if (!web) {
    return (
      <main className="status-screen" aria-live="polite">
        <span className="brand-mark pulse" aria-hidden="true">✦</span>
        <h1>Cosmic Filament</h1>
        <p>흩어진 빛을 따라가는 중…</p>
      </main>
    )
  }

  const thoughtCount = web.nodes.filter((node) => node.kind === 'thought').length
  const indexCount = web.nodes.filter((node) => node.kind === 'index').length

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="identity">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <div>
            <h1>Cosmic Filament</h1>
            <p>{thoughtCount}개의 생각 · {indexCount}개의 색인 · 하나의 Cosmic Web</p>
          </div>
        </div>
        <button className="icon-button" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="생각과 색인 검색" aria-expanded={searchOpen}>⌕</button>
      </header>

      {searchOpen && (
        <section className="search-panel" aria-label="생각과 색인 검색창">
          <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="생각이나 색인을 찾아보세요" aria-label="검색어" />
          {query && (
            <div className="search-results">
              {searchResults.length === 0 ? <p>이 이름의 빛은 아직 없음</p> : searchResults.map((node) => (
                <button type="button" key={node.id} onClick={() => selectNode(node.id)}>
                  <span>{node.kind === 'thought' ? '생각' : '색인'}</span>
                  <strong>{node.label}</strong>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <Suspense fallback={<div className="graph-loading">Cosmic Web을 펼치는 중…</div>}>
        <GraphCanvas web={web} mode={mode} selectedId={selectedId} query={query} onSelect={selectNode} />
      </Suspense>
      <ViewModeSwitch value={mode} onChange={setMode} nearbyDisabled={!selectedId} />

      {web.diagnostics.length > 0 && (
        <div className="diagnostic" title={web.diagnostics.join('\n')}>{web.diagnostics.length}개의 연결을 표시하지 못함</div>
      )}

      {selectedId && (
        <NodeDetails
          nodeId={selectedId}
          web={web}
          basePath={basePath}
          onClose={() => {
            setSelectedId(undefined)
            if (mode === 'nearby') setMode('all')
          }}
          onSelect={selectNode}
        />
      )}
    </main>
  )
}
