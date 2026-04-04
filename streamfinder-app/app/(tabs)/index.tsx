// app/(tabs)/index.tsx
import React, { useState, useCallback, useContext } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar
} from 'react-native'
import MovieCard from '../../components/MovieCard'
import MovieModal from '../../components/MovieModal'
import { searchMovies } from '../../lib/api'
import { useWatchlist } from '../../hooks/useWatchlist'
import { Linking } from 'react-native'
import type { Movie } from '../../types'

function Footer() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com/kderkut')}>
          <Text style={{ color: '#6b8aaa', fontSize: 13 }}>📸 @kderkut</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:denizerkut@icloud.com')}>
          <Text style={{ color: '#6b8aaa', fontSize: 13 }}>✉️ denizerkut@icloud.com</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: '#4a6480', fontSize: 11 }}>© StreamFinder TR · Deniz Erkut</Text>
    </View>
  )
}

export default function SearchScreen() {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<Movie[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState<Movie | null>(null)
  const [searched, setSearched]   = useState(false)
  const wl = useWatchlist()

  const doSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const data = await searchMovies(q)
      setResults(data)
    } catch {
      setError('Arama sırasında hata oluştu.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#05080f" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoDot}><Text style={styles.logoDotText}>▶</Text></View>
          <Text style={styles.logoText}>Stream<Text style={styles.logoAccent}>Finder</Text></Text>
          <View style={styles.trBadge}><Text style={styles.trText}>TR</Text></View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={doSearch}
            placeholder="Film veya dizi ara…"
            placeholderTextColor="#4a6480"
            returnKeyType="search"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
            onPress={doSearch}
            disabled={loading}
          >
            <Text style={styles.searchBtnText}>ARA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f0a500" />
          <Text style={styles.loadingText}>Platformlar taranıyor…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚡</Text>
          <Text style={styles.errorTitle}>Bağlantı Hatası</Text>
          <Text style={styles.errorSub}>{error}</Text>
        </View>
      ) : results.length === 0 && searched ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>🔭</Text>
          <Text style={styles.errorTitle}>Sonuç Bulunamadı</Text>
          <Text style={styles.errorSub}>Farklı bir arama deneyin.</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.idleEmoji}>🎬</Text>
          <Text style={styles.idleTitle}>Aramaya Hazır</Text>
          <Text style={styles.idleSub}>
            Film veya dizi adı yaz, Türkiye'deki platformlarda ara.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
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
          ListFooterComponent={<Footer />}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {results.length} sonuç
            </Text>
          }
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
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  logoDot: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f0a500',
    alignItems: 'center', justifyContent: 'center',
  },
  logoDotText: { fontSize: 14, color: '#000', fontWeight: '800' },
  logoText: { fontSize: 20, fontWeight: '800', color: '#dce8f5' },
  logoAccent: { color: '#f0a500' },
  trBadge: {
    backgroundColor: 'rgba(240,165,0,0.15)', borderWidth: 1,
    borderColor: 'rgba(240,165,0,0.3)', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  trText: { color: '#f0a500', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: '#101827',
    borderWidth: 1, borderColor: '#243352',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: '#dce8f5', fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#f0a500', borderRadius: 12,
    paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
  },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  resultCount: { color: '#4a6480', fontSize: 12, marginBottom: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  idleEmoji: { fontSize: 52, marginBottom: 16 },
  idleTitle: { color: '#dce8f5', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  idleSub: { color: '#4a6480', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadingText: { color: '#6b8aaa', marginTop: 12, fontSize: 14 },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: { color: '#dce8f5', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  errorSub: { color: '#4a6480', fontSize: 14, textAlign: 'center' },
})
