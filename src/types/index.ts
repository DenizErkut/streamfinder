// src/types/index.ts

export interface Movie {
  id: number
  title: string
  title_tr?: string
  original_title: string
  overview: string
  overview_tr?: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  year: number
  vote_average: number
  vote_count: number
  genre_ids: number[]
  genres: string[]
  media_type: 'movie' | 'tv'
  runtime?: string
  director?: string
  cast?: string[]
  platforms: PlatformName[]
  trailer_key?: string
  source?: 'justwatch' | 'watchmode' | 'ai' | 'fallback' | 'unknown'
}

export type PlatformName =
  | 'Netflix'
  | 'Amazon Prime'
  | 'Disney+'
  | 'BluTV'
  | 'GAIN'
  | 'TOD'
  | 'Tabii'
  | 'MUBI'
  | 'Exxen'
  | 'Apple TV+'
  | 'TV+'
  | 'Tivibu'

export interface PlatformConfig {
  name: PlatformName
  color: string
  bgClass: string
  textClass: string
  borderClass: string
  getUrl: (title: string) => string
}

export type SortOption = 'score' | 'year' | 'az'
export type MediaType  = 'all' | 'movie' | 'tv'
export type TabId      = 'search' | 'trending' | 'new'

export interface SearchFilters {
  type: MediaType
  genre: string
  yearRange: string
  minScore: number
}

export interface WatchlistItem extends Movie {
  addedAt: string
}
