'use client'
// src/components/MovieModal.tsx
import Image from 'next/image'
import { useEffect } from 'react'
import type { Movie } from '@/types'
import { getPlatform } from '@/lib/platforms'
import { IMG } from '@/lib/tmdb'

interface Props {
  movie: Movie | null
  inWatchlist: boolean
  onToggleWL: (m: Movie) => void
  onClose: () => void
}

export default function MovieModal({ movie, inWatchlist, onToggleWL, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent scroll
  useEffect(() => {
    if (movie) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [movie])

  if (!movie) return null

  const poster   = IMG(movie.poster_path, 'w342')
  const backdrop = IMG(movie.backdrop_path, 'w1280')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8
                 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative bg-s1 border border-border2 rounded-2xl w-full max-w-3xl
                   max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Backdrop */}
        {backdrop && (
          <div className="relative h-40 overflow-hidden rounded-t-2xl">
            <Image src={backdrop} alt="" fill className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-s1" />
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-s2 border border-border2
                     flex items-center justify-center text-muted2 hover:text-text
                     hover:border-border1 transition-all"
        >
          ✕
        </button>

        <div className={`flex gap-6 p-6 ${backdrop ? '-mt-16 relative z-10' : ''}`}>
          {/* Poster */}
          {poster ? (
            <div className="relative w-28 md:w-36 flex-shrink-0 rounded-xl overflow-hidden border border-border2 self-start shadow-xl">
              <Image src={poster} alt={movie.title} width={144} height={216} className="block" />
            </div>
          ) : (
            <div className="w-28 md:w-36 flex-shrink-0 rounded-xl bg-s3 border border-border1
                            flex items-center justify-center text-3xl" style={{ aspectRatio: '2/3' }}>
              🎬
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-syne font-extrabold text-xl md:text-2xl leading-tight mb-1">
              {movie.title_tr || movie.title}
            </h2>
            {movie.title_tr && movie.title_tr !== movie.title && (
              <p className="text-muted text-sm mb-3">{movie.title}</p>
            )}

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-acc
                                 bg-acc/10 border border-acc/30 px-2.5 py-1 rounded-full">
                  ⭐ {movie.vote_average.toFixed(1)} / 10
                </span>
              )}
              {movie.year > 0 && (
                <span className="text-xs text-muted2 bg-s2 border border-border1 px-2.5 py-1 rounded-full">
                  📅 {movie.year}
                </span>
              )}
              {movie.runtime && (
                <span className="text-xs text-muted2 bg-s2 border border-border1 px-2.5 py-1 rounded-full">
                  ⏱ {movie.runtime}
                </span>
              )}
              <span className="text-xs text-muted2 bg-s2 border border-border1 px-2.5 py-1 rounded-full">
                {movie.media_type === 'tv' ? '📺 Dizi' : '🎥 Film'}
              </span>
              {movie.genres.map(g => (
                <span key={g} className="text-xs text-muted2 bg-s2 border border-border1 px-2.5 py-1 rounded-full">
                  🎭 {g}
                </span>
              ))}
            </div>

            {/* Director / Cast */}
            {movie.director && (
              <p className="text-sm text-muted2 mb-1">
                🎬 Yönetmen: <strong className="text-text font-semibold">{movie.director}</strong>
              </p>
            )}
            {movie.cast && movie.cast.length > 0 && (
              <p className="text-sm text-muted2 mb-4">
                🎭 Oyuncular: <strong className="text-text font-medium">{movie.cast.join(', ')}</strong>
              </p>
            )}

            {/* Overview */}
            <p className="text-sm text-muted2 leading-relaxed mb-5">
              {movie.overview_tr || movie.overview || 'Özet bulunamadı.'}
            </p>

            {/* Platforms */}
            {movie.platforms.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted">
                    Türkiye'de Nereden İzle
                  </p>
                  {movie.source === 'justwatch' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-900/30 border border-green-700/40 text-green-400 tracking-wider">
                      ✓ CANLI VERİ
                    </span>
                  )}
                  {movie.source === 'ai' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-900/30 border border-yellow-700/40 text-yellow-500 tracking-wider">
                      AI TAHMİN
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5 mb-2">
                  {movie.platforms.map(pName => {
                    const cfg = getPlatform(pName)
                    if (!cfg) return null
                    return (
                      <a
                        key={pName}
                        href={cfg.getUrl(movie.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold
                                    ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}
                                    hover:opacity-80 hover:-translate-y-0.5 transition-all`}
                      >
                        <span>▶</span>
                        <span className="flex flex-col leading-none">
                          {pName}
                          <span className="text-[10px] font-normal opacity-60">Şimdi İzle</span>
                        </span>
                      </a>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">
                ⚠️ Türkiye'deki seçili platformlarda yayın bilgisi bulunamadı.
              </p>
            )}

            {/* Trailer */}
            {movie.trailer_key && (
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailer_key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-muted2
                           hover:text-text transition-colors"
              >
                🎬 YouTube'da Fragmanı İzle →
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 border-t border-border1 pt-4">
          <button
            onClick={() => onToggleWL(movie)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                        border transition-all
                        ${inWatchlist
                          ? 'bg-s3 border-border2 text-muted2'
                          : 'bg-acc/20 border-acc/50 text-acc hover:bg-acc/30'
                        }`}
          >
            {inWatchlist ? '✓ Listede' : '🔖 Listeye Ekle'}
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold
                       bg-s2 border border-border2 text-muted2 hover:text-text
                       hover:border-border1 transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
