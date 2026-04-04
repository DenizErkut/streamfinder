// lib/api.ts
import type { Movie, PlatformName } from '../types'

const BASE_URL = 'https://streamfinder-ten.vercel.app'

export async function searchMovies(
  query: string,
  type: 'all' | 'movie' | 'tv' = 'all',
  platforms?: PlatformName[]
): Promise<Movie[]> {
  const params = new URLSearchParams({ q: query, type: type === 'all' ? '' : type })
  if (platforms?.length) params.set('platforms', platforms.join(','))

  const res = await fetch(`${BASE_URL}/api/search?${params}`)
  if (!res.ok) throw new Error('Arama başarısız')
  const data = await res.json()
  return data.results || []
}

export async function getTrending(): Promise<Movie[]> {
  const res = await fetch(`${BASE_URL}/api/trending`)
  if (!res.ok) throw new Error('Trend verisi alınamadı')
  const data = await res.json()
  return data.results || []
}

export async function getNewReleases(): Promise<Movie[]> {
  const res = await fetch(`${BASE_URL}/api/new`)
  if (!res.ok) throw new Error('Yeni içerikler alınamadı')
  const data = await res.json()
  return data.results || []
}

export const IMG = (path: string | null, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null
