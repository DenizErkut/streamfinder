// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchTMDB } from '@/lib/tmdb'
import { detectPlatforms } from '@/lib/ai'
import { getWatchmodeBatch } from '@/lib/watchmode'
import type { PlatformName, MediaType } from '@/types'

const ALL_TR: PlatformName[] = [
  'Netflix','Amazon Prime','Disney+','BluTV','GAIN','TOD','Tabii','MUBI','Exxen','Apple TV+'
]

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query    = searchParams.get('q')?.trim()
  const type     = (searchParams.get('type') || 'all') as MediaType
  const platforms = searchParams.get('platforms')?.split(',').filter(Boolean) as PlatformName[] | undefined
  const active   = (platforms && platforms.length > 0) ? platforms : ALL_TR

  if (!query) return NextResponse.json({ error: 'q gerekli' }, { status: 400 })

  try {
    const movies = await searchTMDB(query, type === 'all' ? 'all' : type)
    if (!movies.length) return NextResponse.json({ results: [] })

    // 1) Watchmode + AI paralel çalıştır
    const [wmRaw, aiRaw] = await Promise.allSettled([
      getWatchmodeBatch(
        movies.map(m => ({ id: m.id, title: m.title, media_type: m.media_type })),
        active
      ),
      detectPlatforms(movies, active),
    ])

    const wm = wmRaw.status === 'fulfilled' ? wmRaw.value : {}
    const ai = aiRaw.status === 'fulfilled' ? aiRaw.value : []

    const wmHit = Object.values(wm).some(p => p.length > 0)
    console.log(`Watchmode: ${wmHit ? '✅' : '⚠️ boş'} | AI: ${ai.length > 0 ? '✅' : '⚠️ boş'}`)

    const results = movies.map(movie => {
      const wmP  = wm[movie.id] || []
      const aiEntry = ai.find(a => a.id === movie.id)
      const aiP  = aiEntry?.platforms || []

      // Katmanlı öncelik:
      // 1. Watchmode (uluslararası platformlar için gerçek zamanlı)
      // 2. AI + DB (yerel platformlar + bilinenleri)
      // 3. Sadece Watchmode bulunanlar + AI bulunanlar birleştir
      const merged = new Set<PlatformName>([...wmP, ...aiP])
      const finalPlatforms = Array.from(merged).filter(p => active.includes(p))

      const source = wmP.length > 0 ? 'watchmode' : aiP.length > 0 ? 'ai' : 'unknown'

      return {
        ...movie,
        platforms: finalPlatforms,
        overview_tr: aiEntry?.overview_tr || movie.overview,
        source,
      }
    })

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error('[search]', err?.message)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
