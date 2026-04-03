// src/lib/tmdb.ts
import { GENRES } from './platforms'
import type { Movie } from '@/types'

const BASE = 'https://api.themoviedb.org/3'
const KEY  = process.env.TMDB_API_KEY

export const IMG = (path: string | null, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  if (!KEY) throw new Error('TMDB_API_KEY eksik — .env.local dosyasını kontrol et')

  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', KEY)
  url.searchParams.set('language', 'tr-TR')
  url.searchParams.set('region', 'TR')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`TMDB ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json()
}

function resolveGenres(ids: number[]): string[] {
  return ids.slice(0, 3).map(id => GENRES[id]).filter(Boolean)
}

function toYear(date: string): number {
  return date ? parseInt(date.slice(0, 4)) : 0
}

export async function searchTMDB(query: string, type: 'all' | 'movie' | 'tv' = 'all'): Promise<Movie[]> {
  let results: any[] = []

  if (type === 'all' || type === 'movie') {
    const d = await tmdbFetch('/search/movie', { query, include_adult: 'false' })
    results.push(...(d.results || []).map((r: any) => ({ ...r, media_type: 'movie' })))
  }
  if (type === 'all' || type === 'tv') {
    const d = await tmdbFetch('/search/tv', { query, include_adult: 'false' })
    results.push(...(d.results || []).map((r: any) => ({
      ...r,
      title: r.name,
      original_title: r.original_name,
      release_date: r.first_air_date,
      media_type: 'tv',
    })))
  }

  results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

  return results.slice(0, 8).map(r => ({
    id: r.id,
    title: r.title || r.name,
    original_title: r.original_title || r.original_name || '',
    overview: r.overview || '',
    poster_path: r.poster_path,
    backdrop_path: r.backdrop_path,
    release_date: r.release_date || r.first_air_date || '',
    year: toYear(r.release_date || r.first_air_date || ''),
    vote_average: Math.round((r.vote_average || 0) * 10) / 10,
    vote_count: r.vote_count || 0,
    genre_ids: r.genre_ids || [],
    genres: resolveGenres(r.genre_ids || []),
    media_type: r.media_type,
    platforms: [],
  }))
}

export async function getTrending(): Promise<Movie[]> {
  const d = await tmdbFetch('/trending/all/week')
  return (d.results || []).slice(0, 12).map((r: any) => ({
    id: r.id,
    title: r.title || r.name,
    original_title: r.original_title || r.original_name || '',
    overview: r.overview || '',
    poster_path: r.poster_path,
    backdrop_path: r.backdrop_path,
    release_date: r.release_date || r.first_air_date || '',
    year: toYear(r.release_date || r.first_air_date || ''),
    vote_average: Math.round((r.vote_average || 0) * 10) / 10,
    vote_count: r.vote_count || 0,
    genre_ids: r.genre_ids || [],
    genres: resolveGenres(r.genre_ids || []),
    media_type: r.media_type || 'movie',
    platforms: [],
  }))
}

export async function getNewReleases(): Promise<Movie[]> {
  const [movies, tv] = await Promise.all([
    tmdbFetch('/movie/now_playing', { page: '1' }),
    tmdbFetch('/tv/on_the_air',     { page: '1' }),
  ])
  const results = [
    ...(movies.results || []).slice(0, 6).map((r: any) => ({ ...r, media_type: 'movie' })),
    ...(tv.results    || []).slice(0, 6).map((r: any) => ({
      ...r, title: r.name, original_title: r.original_name,
      release_date: r.first_air_date, media_type: 'tv',
    })),
  ]
  return results.map(r => ({
    id: r.id,
    title: r.title,
    original_title: r.original_title || '',
    overview: r.overview || '',
    poster_path: r.poster_path,
    backdrop_path: r.backdrop_path,
    release_date: r.release_date || '',
    year: toYear(r.release_date || ''),
    vote_average: Math.round((r.vote_average || 0) * 10) / 10,
    vote_count: r.vote_count || 0,
    genre_ids: r.genre_ids || [],
    genres: resolveGenres(r.genre_ids || []),
    media_type: r.media_type,
    platforms: [],
  }))
}

export async function getMovieDetail(id: number, type: 'movie' | 'tv') {
  const [detail, credits] = await Promise.all([
    tmdbFetch(`/${type}/${id}`, { append_to_response: 'videos' }),
    tmdbFetch(`/${type}/${id}/credits`),
  ])

  const director = type === 'movie'
    ? credits.crew?.find((c: any) => c.job === 'Director')?.name
    : detail.created_by?.[0]?.name

  const cast = (credits.cast || []).slice(0, 5).map((c: any) => c.name)

  const runtime = type === 'movie'
    ? detail.runtime ? `${detail.runtime} dk` : undefined
    : detail.number_of_seasons ? `${detail.number_of_seasons} Sezon` : undefined

  const trailer = detail.videos?.results?.find(
    (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
  )?.key

  return { director, cast, runtime, trailer_key: trailer }
}
