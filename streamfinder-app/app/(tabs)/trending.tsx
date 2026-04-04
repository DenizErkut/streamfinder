// app/(tabs)/trending.tsx
import React, { useState, useEffect } from 'react'
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, ActivityIndicator, StatusBar, TouchableOpacity
} from 'react-native'
import MovieCard from '../../components/MovieCard'
import MovieModal from '../../components/MovieModal'
import { getTrending } from '../../lib/api'
import { useWatchlist } from '../../hooks/useWatchlist'
import type { Movie } from '../../types'

export default function TrendingScreen() {
  const [movies, setMovies]     = useState<Movie[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState<Movie | null>(null)
  const wl = useWatchlist()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTrending()
      setMovies(data)
    } catch {
      setError('Trend verisi yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#05080f" />

      <View style={styles.header}>
        <Text style={styles.title}>🔥 Trend İçerikler</Text>
        <Text style={styles.sub}>Bu hafta en çok izlenenler</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f0a500" />
          <Text style={styles.loadingText}>Yükleniyor…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚡</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={m => `${m.id}-${m.media_type}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              inWatchlist={wl.isInList(item)}
              onPress={setSelected}
              onToggleWL={wl.toggle}
            />
          )}
        />
      )}

      <MovieModal
        movie={selected}
        inWatchlist={selected ? wl.isInList(selected) : false}
        onToggleWL={wl.toggle}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#05080f' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#dce8f5', fontSize: 24, fontWeight: '800' },
  sub: { color: '#4a6480', fontSize: 13, marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#6b8aaa', marginTop: 12, fontSize: 14 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: '#4a6480', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  retryBtn: {
    backgroundColor: '#f0a500', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  retryText: { color: '#000', fontWeight: '700', fontSize: 14 },
})
