'use client'
// src/app/admin/page.tsx — Platform bildirim yönetim paneli
import { useState, useEffect } from 'react'
import type { PlatformName } from '@/types'
import { PLATFORMS } from '@/lib/platforms'

const ALL_PLATFORMS: PlatformName[] = PLATFORMS.map(p => p.name)

interface Report {
  id: string
  tmdb_id: number
  title: string
  media_type: string
  reported_platform: string
  action: 'add' | 'remove'
  user_note?: string
  confirmed: boolean
  created_at: string
}

export default function AdminPage() {
  const [key, setKey]         = useState('')
  const [auth, setAuth]       = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  const login = () => {
    if (key === process.env.NEXT_PUBLIC_ADMIN_HINT || key.length > 8) {
      setAuth(true)
      loadReports()
    }
  }

  const loadReports = async () => {
    setLoading(true)
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await sb
      .from('platform_reports')
      .select('*')
      .order('created_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  const approve = async (report: Report, platforms: PlatformName[]) => {
    const res = await fetch('/api/overrides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': key,
      },
      body: JSON.stringify({
        tmdb_id: report.tmdb_id,
        media_type: report.media_type,
        platforms,
        report_id: report.id,
      }),
    })
    if (res.ok) {
      setMsg(`✅ "${report.title}" onaylandı`)
      loadReports()
      setTimeout(() => setMsg(''), 3000)
    }
  }

  if (!auth) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-s1 border border-border2 rounded-2xl p-8 w-80">
        <h1 className="font-syne font-bold text-xl text-text mb-6">🔐 Admin Paneli</h1>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Admin şifresi"
          className="w-full bg-s2 border border-border2 rounded-xl px-4 py-3 text-text
                     placeholder:text-muted outline-none focus:border-acc mb-4"
        />
        <button
          onClick={login}
          className="w-full py-3 rounded-xl font-bold text-black
                     bg-gradient-to-r from-acc to-acc2"
        >
          Giriş
        </button>
      </div>
    </div>
  )

  const pending = reports.filter(r => !r.confirmed)
  const done    = reports.filter(r => r.confirmed)

  return (
    <div className="min-h-screen bg-bg text-text p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-syne font-bold text-2xl">
            🎬 StreamFinder Admin — Platform Bildirimleri
          </h1>
          <button onClick={loadReports} className="text-sm text-muted hover:text-text">
            🔄 Yenile
          </button>
        </div>

        {msg && (
          <div className="bg-green-900/30 border border-green-600/50 text-green-400
                          rounded-xl px-4 py-3 mb-6 text-sm font-semibold">
            {msg}
          </div>
        )}

        <h2 className="font-syne font-bold text-lg text-acc mb-4">
          ⏳ Bekleyen ({pending.length})
        </h2>

        {loading ? (
          <p className="text-muted">Yükleniyor...</p>
        ) : pending.length === 0 ? (
          <p className="text-muted text-sm mb-8">Bekleyen bildirim yok.</p>
        ) : (
          <div className="space-y-3 mb-8">
            {pending.map(r => (
              <ReportCard key={r.id} report={r} adminKey={key} onApprove={approve} />
            ))}
          </div>
        )}

        <h2 className="font-syne font-bold text-lg text-muted mb-4">
          ✅ Onaylananlar ({done.length})
        </h2>
        <div className="space-y-2">
          {done.slice(0, 10).map(r => (
            <div key={r.id} className="flex items-center gap-3 text-sm text-muted
                                        bg-s1 border border-border1 rounded-xl px-4 py-3">
              <span className="text-green-400">✓</span>
              <span className="font-semibold text-muted2">{r.title}</span>
              <span>{r.action === 'add' ? '➕' : '➖'}</span>
              <span>{r.reported_platform}</span>
              <span className="ml-auto text-xs">{new Date(r.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReportCard({ report, adminKey, onApprove }: {
  report: Report
  adminKey: string
  onApprove: (r: Report, platforms: PlatformName[]) => void
}) {
  const [selectedPlatforms, setSelected] = useState<PlatformName[]>(
    [report.reported_platform as PlatformName]
  )

  const toggle = (p: PlatformName) => {
    setSelected(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  return (
    <div className="bg-s1 border border-border2 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-syne font-bold text-text">{report.title}</span>
          <span className="ml-2 text-xs text-muted">
            ({report.media_type === 'tv' ? 'Dizi' : 'Film'} · TMDB #{report.tmdb_id})
          </span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
          report.action === 'add'
            ? 'bg-green-900/30 text-green-400'
            : 'bg-red-900/30 text-red-400'
        }`}>
          {report.action === 'add' ? '➕ Ekle' : '➖ Çıkar'}: {report.reported_platform}
        </span>
      </div>

      {report.user_note && (
        <p className="text-muted2 text-sm mb-3 italic">"{report.user_note}"</p>
      )}

      <p className="text-xs text-muted mb-3">
        Bu içerik için onaylanacak platformları seç:
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {PLATFORMS.map(p => (
          <button
            key={p.name}
            onClick={() => toggle(p.name as PlatformName)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              selectedPlatforms.includes(p.name as PlatformName)
                ? 'text-white'
                : 'bg-s2 border-border2 text-muted'
            }`}
            style={selectedPlatforms.includes(p.name as PlatformName)
              ? { background: p.color + '25', borderColor: p.color + '70', color: p.color }
              : {}
            }
          >
            {p.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => onApprove(report, selectedPlatforms)}
        className="px-4 py-2 rounded-xl text-sm font-bold text-black
                   bg-gradient-to-r from-acc to-acc2 hover:opacity-90 transition-all"
      >
        ✅ Onayla ve Kaydet
      </button>
    </div>
  )
}
