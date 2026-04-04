// src/app/api/trending/route.ts
import { NextResponse } from 'next/server'
import { getTrending } from '@/lib/tmdb'
import { detectPlatforms } from '@/lib/ai'
import { getWatchmodeBatch } from '@/lib/watchmode'
import type { PlatformName } from '@/types'

const ALL_TR: PlatformName[] = [
  'Netflix','Amazon Prime','Disney+','BluTV','GAIN','TOD','Tabii','MUBI','Exxen','Apple TV+','TV+','Tivibu'
]

export async function GET() {
  try {
    const movies = await getTrending()
    const [wmRaw, aiRaw] = await Promise.allSettled([
      getWatchmodeBatch(movies.map(m => ({ id: m.id, title: m.title, media_type: m.media_type })), ALL_TR),
      detectPlatforms(movies, ALL_TR),
    ])
    const wm = wmRaw.status === 'fulfilled' ? wmRaw.value : {}
    const ai = aiRaw.status === 'fulfilled' ? aiRaw.value : []

    const results = movies.map(movie => {
      const wmP = wm[movie.id] || []
      const aiEntry = ai.find(a => a.id === movie.id)
      const aiP = aiEntry?.platforms || []
      const merged = Array.from(new Set<PlatformName>([...wmP, ...aiP]))
      return { ...movie, platforms: merged, overview_tr: aiEntry?.overview_tr || movie.overview, source: wmP.length > 0 ? 'watchmode' : 'ai' }
    })

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
