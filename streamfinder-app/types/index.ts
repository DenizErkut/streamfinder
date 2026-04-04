// types/index.ts

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
  genre_ids: number[]
  genres: string[]
  media_type: 'movie' | 'tv'
  runtime?: string
  director?: string
  cast?: string[]
  platforms: PlatformName[]
  trailer_key?: string
  source?: 'justwatch' | 'ai' | 'fallback'
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

export interface PlatformConfig {
  name: PlatformName
  color: string
  getUrl: (title: string) => string
}

export type TabId = 'search' | 'trending' | 'new' | 'watchlist'
