// components/MovieModal.tsx
import React from 'react'
import {
  Modal, View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Dimensions, StatusBar
} from 'react-native'
import type { Movie } from '../types'
import { getPlatform } from '../lib/platforms'
import { IMG } from '../lib/api'

const { width, height } = Dimensions.get('window')

interface Props {
  movie: Movie | null
  inWatchlist: boolean
  onToggleWL: (m: Movie) => void
  onClose: () => void
}

export default function MovieModal({ movie, inWatchlist, onToggleWL, onClose }: Props) {
  if (!movie) return null

  const poster   = IMG(movie.poster_path, 'w342')
  const backdrop = IMG(movie.backdrop_path, 'w780')

  return (
    <Modal visible={!!movie} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Backdrop */}
        {backdrop && (
          <Image source={{ uri: backdrop }} style={styles.backdrop} />
        )}
        <View style={styles.backdropOverlay} />

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {poster ? (
              <Image source={{ uri: poster }} style={styles.poster} />
            ) : (
              <View style={[styles.poster, styles.posterPlaceholder]}>
                <Text style={{ fontSize: 40 }}>🎬</Text>
              </View>
            )}

            <View style={styles.headerInfo}>
              <Text style={styles.title}>{movie.title_tr || movie.title}</Text>
              {movie.title_tr && movie.title_tr !== movie.title && (
                <Text style={styles.originalTitle}>{movie.title}</Text>
              )}

              {/* Meta pills */}
              <View style={styles.metaRow}>
                {movie.vote_average > 0 && (
                  <View style={[styles.pill, styles.pillGold]}>
                    <Text style={styles.pillTextGold}>⭐ {movie.vote_average.toFixed(1)}</Text>
                  </View>
                )}
                {movie.year > 0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>📅 {movie.year}</Text>
                  </View>
                )}
                {movie.runtime && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>⏱ {movie.runtime}</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                {movie.genres.slice(0, 2).map(g => (
                  <View key={g} style={styles.pill}>
                    <Text style={styles.pillText}>🎭 {g}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Credits */}
          {movie.director && (
            <Text style={styles.credit}>
              🎬 Yönetmen: <Text style={styles.creditValue}>{movie.director}</Text>
            </Text>
          )}
          {movie.cast?.length ? (
            <Text style={styles.credit}>
              🎭 Oyuncular: <Text style={styles.creditValue}>{movie.cast.join(', ')}</Text>
            </Text>
          ) : null}

          {/* Overview */}
          <Text style={styles.overview}>
            {movie.overview_tr || movie.overview || 'Özet bulunamadı.'}
          </Text>

          {/* Platforms */}
          {movie.platforms.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>TÜRKİYE'DE NEREDEN İZLE</Text>
                {movie.source === 'justwatch' && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>✓ CANLI VERİ</Text>
                  </View>
                )}
              </View>
              <View style={styles.platformList}>
                {movie.platforms.map(pName => {
                  const cfg = getPlatform(pName)
                  if (!cfg) return null
                  return (
                    <TouchableOpacity
                      key={pName}
                      style={[styles.platformBtn, { borderColor: cfg.color + '60', backgroundColor: cfg.color + '15' }]}
                      onPress={() => Linking.openURL(cfg.getUrl(movie.title))}
                      activeOpacity={0.75}
                    >
                      <Text style={{ fontSize: 16 }}>▶</Text>
                      <View>
                        <Text style={[styles.platformBtnName, { color: cfg.color }]}>{pName}</Text>
                        <Text style={styles.platformBtnSub}>Şimdi İzle</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </>
          ) : (
            <Text style={styles.noPlatform}>
              ⚠️ Türkiye'deki seçili platformlarda yayın bilgisi bulunamadı.
            </Text>
          )}

          {/* Trailer */}
          {movie.trailer_key && (
            <TouchableOpacity
              style={styles.trailerBtn}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${movie.trailer_key}`)}
            >
              <Text style={styles.trailerBtnText}>🎬 YouTube'da Fragmanı İzle →</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBtn, inWatchlist && styles.footerBtnActive]}
            onPress={() => onToggleWL(movie)}
          >
            <Text style={[styles.footerBtnText, inWatchlist && styles.footerBtnTextActive]}>
              {inWatchlist ? '✓ Listede' : '🔖 Listeye Ekle'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
            <Text style={styles.closeFooterBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080f' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, opacity: 0.3 },
  backdropOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    backgroundColor: 'transparent',
  },
  closeBtn: {
    position: 'absolute', top: 50, right: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#0a0f1c', borderWidth: 1, borderColor: '#243352',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#6b8aaa', fontSize: 14 },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', gap: 16, padding: 20, paddingTop: 80 },
  poster: { width: 110, height: 165, borderRadius: 12, borderWidth: 1, borderColor: '#1a2640' },
  posterPlaceholder: { backgroundColor: '#101827', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, paddingTop: 4 },
  title: { color: '#dce8f5', fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 4 },
  originalTitle: { color: '#4a6480', fontSize: 12, marginBottom: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  pill: {
    backgroundColor: '#101827', borderWidth: 1, borderColor: '#1a2640',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  pillGold: { backgroundColor: 'rgba(240,165,0,0.1)', borderColor: 'rgba(240,165,0,0.3)' },
  pillText: { color: '#6b8aaa', fontSize: 11 },
  pillTextGold: { color: '#f0a500', fontSize: 11, fontWeight: '600' },
  credit: { color: '#4a6480', fontSize: 13, marginHorizontal: 20, marginBottom: 4 },
  creditValue: { color: '#dce8f5', fontWeight: '600' },
  overview: {
    color: '#6b8aaa', fontSize: 14, lineHeight: 22,
    marginHorizontal: 20, marginVertical: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 12 },
  sectionTitle: { color: '#4a6480', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  liveBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  liveBadgeText: { color: '#22c55e', fontSize: 9, fontWeight: '700' },
  platformList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20 },
  platformBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, minWidth: '45%',
  },
  platformBtnName: { fontSize: 13, fontWeight: '700' },
  platformBtnSub: { color: '#4a6480', fontSize: 10, marginTop: 1 },
  noPlatform: { color: '#4a6480', fontSize: 13, marginHorizontal: 20, marginBottom: 16 },
  trailerBtn: { marginHorizontal: 20, marginTop: 16 },
  trailerBtnText: { color: '#6b8aaa', fontSize: 13 },
  footer: {
    flexDirection: 'row', gap: 10, padding: 16,
    borderTopWidth: 1, borderTopColor: '#1a2640',
    backgroundColor: '#05080f',
  },
  footerBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: 'rgba(240,165,0,0.15)',
    borderWidth: 1, borderColor: 'rgba(240,165,0,0.4)',
    alignItems: 'center',
  },
  footerBtnActive: { backgroundColor: '#101827', borderColor: '#243352' },
  footerBtnText: { color: '#f0a500', fontSize: 14, fontWeight: '700' },
  footerBtnTextActive: { color: '#6b8aaa' },
  closeFooterBtn: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#101827', borderWidth: 1, borderColor: '#243352',
    alignItems: 'center',
  },
  closeFooterBtnText: { color: '#6b8aaa', fontSize: 14, fontWeight: '600' },
})
