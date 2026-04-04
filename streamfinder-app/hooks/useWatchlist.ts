// hooks/useWatchlist.ts
import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Movie } from '../types'

const KEY = '@sf_watchlist'

export function useWatchlist() {
  const [items, setItems] = useState<Movie[]>([])

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) setItems(JSON.parse(raw))
    }).catch(() => {})
  }, [])

  const persist = useCallback((next: Movie[]) => {
    setItems(next)
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {})
  }, [])

  const isInList = useCallback(
    (movie: Movie) => items.some(i => i.id === movie.id && i.media_type === movie.media_type),
    [items]
  )

  const toggle = useCallback((movie: Movie) => {
    if (isInList(movie)) {
      persist(items.filter(i => !(i.id === movie.id && i.media_type === movie.media_type)))
    } else {
      persist([{ ...movie }, ...items])
    }
  }, [items, isInList, persist])

  const remove = useCallback((movie: Movie) => {
    persist(items.filter(i => !(i.id === movie.id && i.media_type === movie.media_type)))
  }, [items, persist])

  return { items, isInList, toggle, remove, count: items.length }
}
