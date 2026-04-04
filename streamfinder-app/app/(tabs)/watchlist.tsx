// app/(tabs)/watchlist.tsx
import React, { useState } from 'react'
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert
} from 'react-native'
import MovieModal from '../../components/MovieModal'
import { useWatchlist } from '../../hooks/useWatchlist'
import { getPlatform } from '../../lib/platforms'
import { IMG } from '../../lib/api'
import type { Movie } from '../../types'

export default function WatchlistScreen() {
  const wl = useWatchlist()
  const [selected, setSelected] = useState<Movie | null>(null)

  const confirmRemove = (movie: Movie) => {
    Alert.alert(
      'Listeden Çıkar',
      `"${movie.title_tr || movie.title}" listeden çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkar', style: 'destructive', onPress: () => wl.remove(movie) },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#05080f" />

      <View style={styles.header}>
        <Text style={styles.title}>🔖 İzleme Listesi</Text>
        <Text style={styles.sub}>{wl.count} içerik kaydedildi</Text>
      </View>

      {wl.items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔖</Text>
          <Text style={styles.emptyTitle}>Liste Boş</Text>
          <Text style={styles.emptySub}>
            Film veya dizi kartındaki + butonuna basarak listeye ekleyebilirsin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={wl.items}
          keyExtractor={m => `${m.id}-${m.media_type}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const poster = IMG(item.poster_path, 'w92')
            return (
              <TouchableOpacity
                style={styles.item}
                onPress={() => setSelected(item)}
                activeOpacity={0.8}
              >
                {poster ? (
                  <Image source={{ uri: poster }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Text style={{ fontSize: 20 }}>🎬</Text>
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title_tr || item.title}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.year} · {item.genres.slice(0, 2).join(', ') || '—'}
                  </Text>
                  <View style={styles.itemPlatforms}>
                    {item.platforms.slice(0, 3).map(p => {
                      const cfg = getPlatform(p)
                      if (!cfg) return null
                      return (
                        <View key={p} style={[styles.pchip, { borderColor: cfg.color + '50', backgroundColor: cfg.color + '15' }]}>
                          <Text style={[styles.pchipText, { color: cfg.color }]}>{p}</Text>
                        </View>
                      )
                    })}
                    {item.platforms.length === 0 && (
                      <Text style={styles.noPlatform}>Platform yok</Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => confirmRemove(item)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )
          }}
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
  list: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { color: '#dce8f5', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#4a6480', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  item: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#0a0f1c', borderWidth: 1, borderColor: '#1a2640',
    borderRadius: 14, padding: 12, marginBottom: 10,
  },
  thumb: { width: 52, height: 78, borderRadius: 8, backgroundColor: '#101827' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemTitle: { color: '#dce8f5', fontSize: 14, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  itemMeta: { color: '#4a6480', fontSize: 11, marginBottom: 8 },
  itemPlatforms: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  pchip: {
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  pchipText: { fontSize: 9, fontWeight: '600' },
  noPlatform: { color: '#4a6480', fontSize: 10 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: '#4a6480', fontSize: 18 },
})
