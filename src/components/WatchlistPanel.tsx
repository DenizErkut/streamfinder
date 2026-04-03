'use client'
// src/components/WatchlistPanel.tsx
import Image from 'next/image'
import type { WatchlistItem, Movie } from '@/types'
import { getPlatform } from '@/lib/platforms'
import { IMG } from '@/lib/tmdb'

interface Props {
  open: boolean
  items: WatchlistItem[]
  onClose: () => void
  onRemove: (m: Movie) => void
  onOpen: (m: Movie) => void
}

export default function WatchlistPanel({ open, items, onClose, onRemove, onOpen }: Props) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-80 md:w-96
                    bg-s1 border-l border-border2 flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border1">
          <div>
            <h2 className="font-syne font-extrabold text-lg">🔖 İzleme Listesi</h2>
            <p className="text-xs text-muted mt-0.5">{items.length} içerik kaydedildi</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-s2 border border-border2
                       flex items-center justify-center text-muted2
                       hover:text-text hover:border-border1 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <div className="text-4xl mb-3">🔖</div>
              <p className="font-semibold text-text mb-1">Liste boş</p>
              <p className="text-sm">Kart üzerindeki + butonuna basarak film ekle.</p>
            </div>
          ) : (
            items.map(item => {
              const poster = IMG(item.poster_path, 'w92')
              return (
                <div
                  key={`${item.id}-${item.media_type}`}
                  className="flex gap-3 items-start p-3 rounded-xl bg-s2 border border-border1
                             hover:border-border2 transition-all group cursor-pointer"
                  onClick={() => onOpen(item)}
                >
                  {/* Thumb */}
                  <div className="relative w-10 h-15 flex-shrink-0 rounded-lg overflow-hidden bg-s3">
                    {poster ? (
                      <Image src={poster} alt={item.title} width={40} height={60} className="object-cover h-full" />
                    ) : (
                      <div className="w-10 h-15 flex items-center justify-center text-lg">🎬</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {item.title_tr || item.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {item.year} · {item.genres.slice(0, 2).join(', ') || '—'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.platforms.slice(0, 2).map(pName => {
                        const cfg = getPlatform(pName)
                        if (!cfg) return null
                        return (
                          <a
                            key={pName}
                            href={cfg.getUrl(item.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded border
                                        ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}
                            onClick={e => e.stopPropagation()}
                          >
                            {pName}
                          </a>
                        )
                      })}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400
                               transition-all text-base p-1 flex-shrink-0"
                    onClick={e => { e.stopPropagation(); onRemove(item) }}
                    title="Listeden çıkar"
                  >
                    ✕
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
