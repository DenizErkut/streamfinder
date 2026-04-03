// src/lib/watchmode.ts
// Watchmode API — gerçek zamanlı streaming platform verisi

import type { PlatformName } from '@/types'

const KEY = process.env.WATCHMODE_API_KEY
const BASE = 'https://api.watchmode.com/v1'

// Watchmode source_id → PlatformName (TR)
const SOURCE_MAP: Record<number, PlatformName> = {
  203:  'Netflix',
  26:   'Amazon Prime',
  372:  'Disney+',
  371:  'Apple TV+',
  444:  'MUBI',
  // Türkiye yerel platformlar watchmode'da yok → AI/DB ile tamamlanır
}

async function wmFetch(path: string) {
  if (!KEY) throw new Error('WATCHMODE_API_KEY eksik')
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}apiKey=${KEY}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Watchmode ${res.status}`)
  return res.json()
}

// TMDB ID → Watchmode ID
async function getWMId(tmdbId: number, type: 'movie' | 'tv'): Promise<number | null> {
  try {
    const field = type === 'movie' ? 'tmdb_movie_id' : 'tmdb_tv_id'
    const data = await wmFetch(`/search/?search_field=${field}&search_value=${tmdbId}`)
    return data?.title_results?.[0]?.id || null
  } catch {
    return null
  }
}

// Watchmode ID → TR platformlar
async function getSourcesTR(wmId: number): Promise<PlatformName[]> {
  try {
    const sources = await wmFetch(`/title/${wmId}/sources/?regions=TR`)
    const platforms = new Set<PlatformName>()
    for (const s of (sources || [])) {
      if (s.type !== 'sub' && s.type !== 'free') continue
      const mapped = SOURCE_MAP[s.source_id]
      if (mapped) platforms.add(mapped)
    }
    return Array.from(platforms)
  } catch {
    return []
  }
}

export async function getWatchmodePlatforms(
  tmdbId: number,
  type: 'movie' | 'tv',
  active: PlatformName[]
): Promise<PlatformName[]> {
  try {
    const wmId = await getWMId(tmdbId, type)
    if (!wmId) return []
    const platforms = await getSourcesTR(wmId)
    return platforms.filter(p => active.includes(p))
  } catch (err: any) {
    console.warn(`Watchmode [${tmdbId}]:`, err?.message?.slice(0, 60))
    return []
  }
}

// Batch — filmler için paralel sorgula (rate limit: 2/sn)
export async function getWatchmodeBatch(
  movies: { id: number; title: string; media_type: 'movie' | 'tv' }[],
  active: PlatformName[]
): Promise<Record<number, PlatformName[]>> {
  const results: Record<number, PlatformName[]> = {}
  
  // İkişer ikişer sorgula (rate limit koruma)
  for (let i = 0; i < movies.length; i += 2) {
    const chunk = movies.slice(i, i + 2)
    await Promise.all(chunk.map(async m => {
      results[m.id] = await getWatchmodePlatforms(m.id, m.media_type, active)
    }))
    if (i + 2 < movies.length) await new Promise(r => setTimeout(r, 600))
  }
  return results
}
