'use client'
// src/app/page.tsx
import { useState, useCallback, useRef } from 'react'
import MovieCard from '@/components/MovieCard'
import MovieModal from '@/components/MovieModal'
import WatchlistPanel from '@/components/WatchlistPanel'
import { useWatchlist } from '@/hooks/useWatchlist'
import { PLATFORMS, DEFAULT_ACTIVE } from '@/lib/platforms'
import type { Movie, PlatformName, TabId, SearchFilters, SortOption } from '@/types'

const GENRE_OPTIONS = [
  { value: '', label: '🎭 Tüm Türler' },
  { value: '28',    label: 'Aksiyon' },
  { value: '35',    label: 'Komedi' },
  { value: '18',    label: 'Drama' },
  { value: '27',    label: 'Korku' },
  { value: '878',   label: 'Bilim Kurgu' },
  { value: '53',    label: 'Gerilim' },
  { value: '10749', label: 'Romantik' },
  { value: '16',    label: 'Animasyon' },
  { value: '99',    label: 'Belgesel' },
  { value: '80',    label: 'Suç' },
]

const YEAR_OPTIONS = [
  { value: '',          label: '📅 Tüm Yıllar' },
  { value: '2024-2025', label: '2024–2025' },
  { value: '2020-2023', label: '2020–2023' },
  { value: '2015-2019', label: '2015–2019' },
  { value: '2010-2014', label: '2010–2014' },
  { value: '2000-2009', label: '2000–2009' },
  { value: '1990-1999', label: '1990–1999' },
]

const SCORE_OPTIONS = [
  { value: 0,  label: '⭐ Tüm Puanlar' },
  { value: 9,  label: '9+ Puan' },
  { value: 8,  label: '8+ Puan' },
  { value: 7,  label: '7+ Puan' },
  { value: 6,  label: '6+ Puan' },
]

type ResultState = 'idle' | 'loading' | 'results' | 'empty' | 'error'

export default function Home() {
  // --- State ---
  const [query, setQuery]           = useState('')
  const [activeTab, setActiveTab]   = useState<TabId>('search')
  const [results, setResults]       = useState<Movie[]>([])
  const [resultState, setRS]        = useState<ResultState>('idle')
  const [resultLabel, setRL]        = useState('')
  const [sortBy, setSortBy]         = useState<SortOption>('score')
  const [selectedMovie, setMovie]   = useState<Movie | null>(null)
  const [wlOpen, setWlOpen]         = useState(false)
  const [activePlatforms, setAP]    = useState<Set<PlatformName>>(new Set(DEFAULT_ACTIVE))
  const [filters, setFilters]       = useState<SearchFilters>({
    type: 'all', genre: '', yearRange: '', minScore: 0
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const wl = useWatchlist()

  // --- Platform toggle ---
  const togglePlatform = (name: PlatformName) => {
    setAP(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  // --- Fetch helpers ---
  const fetchSearch = useCallback(async (q: string) => {
    const params = new URLSearchParams({
      q,
      type: filters.type === 'all' ? '' : filters.type,
      platforms: Array.from(activePlatforms).join(','),
    })
    const res = await fetch(`/api/search?${params}`)
    if (!res.ok) throw new Error('search failed')
    const data = await res.json()
    return data.results as Movie[]
  }, [filters.type, activePlatforms])

  const fetchTrending = useCallback(async () => {
    const res = await fetch('/api/trending')
    if (!res.ok) throw new Error('trending failed')
    const data = await res.json()
    return data.results as Movie[]
  }, [])

  const fetchNew = useCallback(async () => {
    const res = await fetch('/api/new')
    if (!res.ok) throw new Error('new failed')
    const data = await res.json()
    return data.results as Movie[]
  }, [])

  // --- Actions ---
  const doSearch = async () => {
    const q = query.trim()
    if (!q) { inputRef.current?.focus(); return }
    setActiveTab('search')
    setRS('loading')
    setRL(`"${q}" için`)
    try {
      const items = await fetchSearch(q)
      setResults(items)
      setRS(items.length ? 'results' : 'empty')
    } catch { setRS('error') }
  }

  const switchTab = async (tab: TabId) => {
    setActiveTab(tab)
    if (tab === 'search') { setRS('idle'); return }
    setRS('loading')
    setRL(tab === 'trending' ? '🔥 Trend İçerikler' : '✨ Yeni Eklenenler')
    try {
      const items = tab === 'trending' ? await fetchTrending() : await fetchNew()
      setResults(items)
      setRS(items.length ? 'results' : 'empty')
    } catch { setRS('error') }
  }

  // --- Filter / Sort ---
  const applyFilters = (items: Movie[]) => {
    let out = [...items]
    if (filters.type !== 'all') out = out.filter(m => m.media_type === filters.type)
    if (filters.minScore > 0)   out = out.filter(m => m.vote_average >= filters.minScore)
    if (filters.yearRange) {
      const [y1, y2] = filters.yearRange.split('-').map(Number)
      out = out.filter(m => m.year >= y1 && m.year <= y2)
    }
    // sort
    if (sortBy === 'score') out.sort((a, b) => b.vote_average - a.vote_average)
    if (sortBy === 'year')  out.sort((a, b) => b.year - a.year)
    if (sortBy === 'az')    out.sort((a, b) => a.title.localeCompare(b.title))
    return out
  }

  const displayResults = applyFilters(results)

  // --- Render ---
  return (
    <div className="min-h-screen bg-bg">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px]
                        bg-[radial-gradient(ellipse,rgba(240,165,0,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-[300px] right-[-100px] w-[400px] h-[400px]
                        bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_70%)] rounded-full" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-20 flex items-center justify-between
                         px-6 md:px-12 py-5 border-b border-border1
                         bg-bg/70 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-acc to-acc2
                          flex items-center justify-center text-black font-extrabold text-base">
            ▶
          </div>
          <span className="font-syne font-extrabold text-lg tracking-wide">
            Stream<span className="text-acc">Finder</span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-acc
                           bg-acc/10 border border-acc/25 px-2 py-0.5 rounded-full">
            TR
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted2
                          bg-s2 border border-border1 px-3 py-1.5 rounded-lg">
            🇹🇷 Türkiye
          </div>
          <button
            onClick={() => setWlOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                       bg-s2 border border-border2 text-muted2
                       hover:border-acc hover:text-acc transition-all"
          >
            🔖 Liste
            {wl.count > 0 && (
              <span className="bg-acc text-black text-[10px] font-bold
                               w-5 h-5 rounded-full flex items-center justify-center">
                {wl.count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 text-center px-6 pt-16 pb-12">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 text-acc text-xs font-bold
                        tracking-widest uppercase bg-acc/10 border border-acc/25
                        px-4 py-2 rounded-full mb-7">
          ✦ Türkiye&apos;deki Tüm Platformlar
        </div>

        {/* Heading */}
        <h1 className="font-syne font-extrabold leading-[0.9] mb-5"
            style={{ fontSize: 'clamp(44px, 8vw, 88px)' }}>
          <span className="block gradient-text">TÜM PLATFORMLARDA</span>
          <span className="block gradient-text-acc">TEK ARAMA</span>
        </h1>
        <p className="text-muted2 font-light text-base max-w-md mx-auto mb-10 leading-relaxed">
          <strong className="text-text font-medium">TMDB</strong> verisiyle gerçek film bilgileri,{' '}
          <strong className="text-text font-medium">AI</strong> ile platform tespiti.
          Netflix, BluTV, GAIN, TOD ve daha fazlası.
        </p>

        {/* ── PLATFORM CHIPS ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
          {PLATFORMS.map(p => {
            const on = activePlatforms.has(p.name)
            return (
              <button
                key={p.name}
                onClick={() => togglePlatform(p.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
                            transition-all duration-200
                            ${on
                              ? 'text-text border-border2 bg-s2'
                              : 'text-muted border-border1 bg-s1 opacity-50'
                            }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: on ? p.color : '#4a6480' }}
                />
                {p.name}
              </button>
            )
          })}
        </div>

        {/* ── SEARCH BOX ── */}
        <div className="max-w-2xl mx-auto">
          <div className={`flex items-center gap-2 bg-s2 border rounded-2xl px-5 py-2
                          transition-all duration-300
                          ${query ? 'border-acc shadow-[0_0_0_3px_rgba(240,165,0,0.12)]' : 'border-border2'}`}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Film veya dizi adı… (ör: Inception, Squid Game, Atatürk)"
              className="flex-1 bg-transparent outline-none text-text text-base py-3
                         placeholder:text-muted font-light"
            />
            <button
              onClick={doSearch}
              disabled={resultState === 'loading'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black
                         bg-gradient-to-r from-acc to-acc2
                         hover:opacity-90 active:scale-95 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resultState === 'loading' && activeTab === 'search' ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : '🔍'}
              ARA
            </button>
          </div>

          {/* ── FILTERS ── */}
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            <select
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value as any }))}
              className="bg-s2 border border-border2 text-muted2 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-border1 transition-colors"
            >
              <option value="">🎬 Film + Dizi</option>
              <option value="movie">🎥 Sadece Film</option>
              <option value="tv">📺 Sadece Dizi</option>
            </select>
            <select
              value={filters.genre}
              onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}
              className="bg-s2 border border-border2 text-muted2 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-border1 transition-colors"
            >
              {GENRE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={filters.yearRange}
              onChange={e => setFilters(f => ({ ...f, yearRange: e.target.value }))}
              className="bg-s2 border border-border2 text-muted2 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-border1 transition-colors"
            >
              {YEAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={filters.minScore}
              onChange={e => setFilters(f => ({ ...f, minScore: Number(e.target.value) }))}
              className="bg-s2 border border-border2 text-muted2 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-border1 transition-colors"
            >
              {SCORE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex gap-1 border-b border-border1">
          {([
            { id: 'search',   label: '🔍 Arama' },
            { id: 'trending', label: '🔥 Trend' },
            { id: 'new',      label: '✨ Yeni' },
          ] as { id: TabId; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all
                          ${activeTab === t.id
                            ? 'text-acc border-acc'
                            : 'text-muted border-transparent hover:text-muted2'
                          }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS AREA ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-8 pb-20">

        {/* Idle */}
        {resultState === 'idle' && (
          <div className="text-center py-24 text-muted">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="font-syne font-bold text-xl text-text mb-2">Aramaya Hazır</h3>
            <p className="text-sm max-w-sm mx-auto leading-relaxed">
              Film veya dizi adı yaz, Türkiye&apos;deki hangi platformlarda yayınlandığını öğren.
            </p>
          </div>
        )}

        {/* Loading */}
        {resultState === 'loading' && (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-2 border-border2 border-t-acc rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted2 text-sm">Platformlar taranıyor…</p>
          </div>
        )}

        {/* Empty */}
        {resultState === 'empty' && (
          <div className="text-center py-24 text-muted">
            <div className="text-5xl mb-4">🔭</div>
            <h3 className="font-syne font-bold text-xl text-text mb-2">Sonuç Bulunamadı</h3>
            <p className="text-sm max-w-sm mx-auto">
              Farklı bir yazım deneyin veya daha fazla platform seçin.
            </p>
          </div>
        )}

        {/* Error */}
        {resultState === 'error' && (
          <div className="text-center py-24 text-muted">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="font-syne font-bold text-xl text-text mb-2">Bağlantı Hatası</h3>
            <p className="text-sm">API anahtarlarını kontrol edin ve tekrar deneyin.</p>
          </div>
        )}

        {/* Results */}
        {resultState === 'results' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne font-bold text-muted2 text-base">
                {resultLabel} —{' '}
                <span className="text-text">{displayResults.length} sonuç</span>
              </h2>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-s2 border border-border2 text-muted2 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="score">Puana Göre</option>
                <option value="year">Yıla Göre</option>
                <option value="az">A–Z</option>
              </select>
            </div>

            <div className="grid gap-5"
                 style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {displayResults.map((movie, i) => (
                <MovieCard
                  key={`${movie.id}-${movie.media_type}`}
                  movie={movie}
                  index={i}
                  inWatchlist={wl.isInList(movie)}
                  onToggleWL={wl.toggle}
                  onOpen={setMovie}
                />
              ))}
            </div>
          </>
        )}

        {/* TMDB Credit */}
        <div className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-border1
                        text-xs text-muted">
          <span className="bg-[#01b4e4] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
            TMDB
          </span>
          Bu ürün TMDB API&apos;sini kullanmaktadır • Platform verisi Claude AI desteklidir
        </div>
      </main>

      {/* ── MODAL ── */}
      <MovieModal
        movie={selectedMovie}
        inWatchlist={selectedMovie ? wl.isInList(selectedMovie) : false}
        onToggleWL={wl.toggle}
        onClose={() => setMovie(null)}
      />

      {/* ── WATCHLIST PANEL ── */}
      <WatchlistPanel
        open={wlOpen}
        items={wl.items}
        onClose={() => setWlOpen(false)}
        onRemove={wl.remove}
        onOpen={m => { setMovie(m); setWlOpen(false) }}
      />
    </div>
  )
}
