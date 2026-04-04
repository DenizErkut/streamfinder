// components/MovieCard.tsx
import React from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions
} from 'react-native'
import type { Movie } from '../types'
import { getPlatform } from '../lib/platforms'
import { IMG } from '../lib/api'

const { width } = Dimensions.get('window')
const CARD_W = (width - 48) / 2

interface Props {
  movie: Movie
  inWatchlist: boolean
  onPress: (m: Movie) => void
  onToggleWL: (m: Movie) => void
}

export default function MovieCard({ movie, inWatchlist, onPress, onToggleWL }: Props) {
  const poster = IMG(movie.poster_path, 'w342')
  const score = movie.vote_average

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(movie)} activeOpacity={0.85}>
      {/* Poster */}
      <View style={styles.posterWrap}>
        {poster ? (
          <Image source={{ uri: poster }} style={styles.poster} />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.placeholderEmoji}>🎬</Text>
          </View>
        )}

        {/* Score */}
        {score > 0 && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>⭐ {score.toFixed(1)}</Text>
          </View>
        )}

        {/* Watchlist btn */}
        <TouchableOpacity
          style={[styles.wlBtn, inWatchlist && styles.wlBtnActive]}
          onPress={() => onToggleWL(movie)}
        >
          <Text style={styles.wlBtnText}>{inWatchlist ? '✓' : '+'}</Text>
        </TouchableOpacity>

        {/* Type */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {movie.media_type === 'tv' ? '📺 Dizi' : '🎥 Film'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title_tr || movie.title}
        </Text>
        <Text style={styles.meta}>
          {movie.year || '—'} · {movie.genres.slice(0, 1).join(', ') || '—'}
        </Text>

        {/* Platforms */}
        <View style={styles.platforms}>
          {movie.platforms.slice(0, 2).map(p => {
            const cfg = getPlatform(p)
            if (!cfg) return null
            return (
              <View key={p} style={[styles.pchip, { borderColor: cfg.color + '60', backgroundColor: cfg.color + '20' }]}>
                <Text style={[styles.pchipText, { color: cfg.color }]}>{p}</Text>
              </View>
            )
          })}
          {movie.platforms.length === 0 && (
            <Text style={styles.noPlatform}>⚠️ Platform yok</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: '#0a0f1c',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a2640',
    marginBottom: 16,
  },
  posterWrap: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: '#101827',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  posterPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 36 },
  scoreBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#243352',
  },
  scoreText: { color: '#f0a500', fontSize: 11, fontWeight: '700' },
  wlBtn: {
    position: 'absolute',
    top: 8, right: 8,
    width: 30, height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1,
    borderColor: '#243352',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wlBtnActive: { backgroundColor: '#f0a500', borderColor: '#f0a500' },
  wlBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  typeBadge: {
    position: 'absolute',
    bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#1a2640',
  },
  typeText: { color: '#6b8aaa', fontSize: 9, fontWeight: '500' },
  info: { padding: 10 },
  title: { color: '#dce8f5', fontSize: 13, fontWeight: '700', marginBottom: 3, lineHeight: 18 },
  meta: { color: '#4a6480', fontSize: 10, marginBottom: 8 },
  platforms: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  pchip: {
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  pchipText: { fontSize: 9, fontWeight: '600' },
  noPlatform: { color: '#4a6480', fontSize: 10 },
})
