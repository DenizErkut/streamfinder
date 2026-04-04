'use client'
// src/components/ReportModal.tsx
import { useState } from 'react'
import type { Movie, PlatformName } from '@/types'
import { PLATFORMS } from '@/lib/platforms'

interface Props {
  movie: Movie
  onClose: () => void
}

export default function ReportModal({ movie, onClose }: Props) {
  const [action, setAction]     = useState<'add' | 'remove'>('add')
  const [platform, setPlatform] = useState<PlatformName | ''>('')
  const [note, setNote]         = useState('')
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const submit = async () => {
    if (!platform) return
    setStatus('loading')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: movie.id,
          title: movie.title,
          media_type: movie.media_type,
          reported_platform: platform,
          action,
          user_note: note,
        }),
      })
      if (!res.ok) throw new Error('Gönderim başarısız')
      setStatus('success')
      setTimeout(onClose, 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-s1 border border-border2 rounded-2xl w-full max-w-md p-6 shadow-2xl">

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-syne font-bold text-lg text-text mb-2">Teşekkürler!</h3>
            <p className="text-muted2 text-sm">Bildiriminiz incelemeye alındı. Onaylandıktan sonra veritabanına eklenecek.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-syne font-bold text-lg">Platform Bildir</h3>
              <button onClick={onClose} className="text-muted hover:text-text transition-colors text-xl">✕</button>
            </div>

            <p className="text-muted2 text-sm mb-5">
              <span className="text-acc font-semibold">{movie.title_tr || movie.title}</span> için
              platform bilgisi yanlışsa düzeltmemize yardım et!
            </p>

            {/* Action */}
            <div className="flex gap-3 mb-4">
              {(['add', 'remove'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all
                    ${action === a
                      ? a === 'add'
                        ? 'bg-green-900/30 border-green-600/50 text-green-400'
                        : 'bg-red-900/30 border-red-600/50 text-red-400'
                      : 'bg-s2 border-border2 text-muted'
                    }`}
                >
                  {a === 'add' ? '➕ Platform Ekle' : '➖ Platform Çıkar'}
                </button>
              ))}
            </div>

            {/* Platform seç */}
            <div className="mb-4">
              <label className="text-xs text-muted font-semibold uppercase tracking-wider mb-2 block">
                Platform
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => setPlatform(p.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      ${platform === p.name
                        ? 'text-white'
                        : 'bg-s2 border-border2 text-muted hover:border-border1'
                      }`}
                    style={platform === p.name
                      ? { background: p.color + '30', borderColor: p.color + '80', color: p.color }
                      : {}
                    }
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Not */}
            <div className="mb-5">
              <label className="text-xs text-muted font-semibold uppercase tracking-wider mb-2 block">
                Not (opsiyonel)
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="ör: Ocak 2025'ten itibaren Netflix'te"
                className="w-full bg-s2 border border-border2 rounded-xl px-4 py-2.5 text-sm text-text
                           placeholder:text-muted outline-none focus:border-acc transition-colors"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm mb-4">⚠️ Gönderim başarısız, tekrar dene.</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={submit}
                disabled={!platform || status === 'loading'}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold
                           bg-gradient-to-r from-acc to-acc2 text-black
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:opacity-90 transition-all"
              >
                {status === 'loading' ? '⏳ Gönderiliyor...' : '📤 Bildir'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-s2 border border-border2 text-muted hover:text-text transition-all"
              >
                İptal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
