// src/hooks/useWatchlist.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Movie, WatchlistItem } from '@/types'

const KEY = 'sf_watchlist_v2'

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist to localStorage
  const persist = useCallback((next: WatchlistItem[]) => {
    setItems(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  }, [])

  const isInList = useCallback(
    (movie: Movie) => items.some(i => i.id === movie.id && i.media_type === movie.media_type),
    [items]
  )

  const toggle = useCallback((movie: Movie) => {
    if (isInList(movie)) {
      persist(items.filter(i => !(i.id === movie.id && i.media_type === movie.media_type)))
    } else {
      persist([...items, { ...movie, addedAt: new Date().toISOString() }])
    }
  }, [items, isInList, persist])

  const remove = useCallback((movie: Movie) => {
    persist(items.filter(i => !(i.id === movie.id && i.media_type === movie.media_type)))
  }, [items, persist])

  const clear = useCallback(() => persist([]), [persist])

  return { items, isInList, toggle, remove, clear, count: items.length }
}
