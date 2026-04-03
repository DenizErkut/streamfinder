'use client'
// src/components/MovieCard.tsx
import Image from 'next/image'
import { Movie } from '@/types'
import { getPlatform } from '@/lib/platforms'
import { IMG } from '@/lib/tmdb'

interface Props {
  movie: Movie
  inWatchlist: boolean
  onToggleWL: (m: Movie) => void
  onOpen: (m: Movie) => void
  index?: number
}

export default function MovieCard({ movie, inWatchlist, onToggleWL, onOpen, index = 0 }: Props) {
  const poster = IMG(movie.poster_path)
  const score  = movie.vote_average

  const activePlatforms = movie.platforms.slice(0, 3)

  return (
    <div
      className="group relative bg-s1 border border-border1 rounded-xl overflow-hidden cursor-pointer
                 hover:-translate-y-1.5 hover:border-border2 hover:shadow-2xl
                 transition-all duration-300"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => onOpen(movie)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-s3">
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 220px"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
            <span className="text-4xl">🎬</span>
            <span className="text-xs font-medium">
              {movie.media_type === 'tv' ? '📺 Dizi' : '🎥 Film'}
            </span>
          </div>
        )}

        {/* Score badge */}
        {score > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1
                          bg-black/70 backdrop-blur-sm border border-border2
                          rounded-lg px-2 py-1 text-acc text-xs font-semibold">
            ⭐ {score.toFixed(1)}
          </div>
        )}

        {/* Watchlist button */}
        <button
          className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center
                      text-sm font-bold transition-all duration-200 border
                      ${inWatchlist
                        ? 'opacity-100 bg-acc border-acc text-black'
                        : 'opacity-0 group-hover:opacity-100 bg-black/70 backdrop-blur-sm border-border2 text-white'
                      }`}
          onClick={e => { e.stopPropagation(); onToggleWL(movie) }}
          title={inWatchlist ? 'Listeden çıkar' : 'Listeye ekle'}
        >
          {inWatchlist ? '✓' : '+'}
        </button>

        {/* Type badge */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md
                        px-2 py-0.5 text-[10px] font-medium text-muted2 border border-border1">
          {movie.media_type === 'tv' ? '📺 Dizi' : '🎥 Film'}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="font-syne font-bold text-sm text-text leading-tight mb-1 truncate">
          {movie.title_tr || movie.title}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted mb-2.5">
          <span>{movie.year || '—'}</span>
          {movie.genres.length > 0 && (
            <>
              <span className="text-border2">·</span>
              <span className="truncate">{movie.genres.slice(0, 2).join(', ')}</span>
            </>
          )}
        </div>

        {/* Platform links */}
        <div className="flex flex-wrap gap-1">
          {activePlatforms.length > 0 ? (
            activePlatforms.map(pName => {
              const cfg = getPlatform(pName)
              if (!cfg) return null
              return (
                <a
                  key={pName}
                  href={cfg.getUrl(movie.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border
                              ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}
                              hover:opacity-75 transition-opacity`}
                  onClick={e => e.stopPropagation()}
                >
                  {pName}
                </a>
              )
            })
          ) : (
            <span className="text-[11px] text-muted flex items-center gap-1">
              ⚠️ Platform yok
            </span>
          )}
          {movie.platforms.length > 3 && (
            <span className="text-[10px] text-muted self-center">
              +{movie.platforms.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
