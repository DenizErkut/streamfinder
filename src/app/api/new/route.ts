// src/app/api/new/route.ts
import { NextResponse } from 'next/server'
import { getNewReleases } from '@/lib/tmdb'
import { detectPlatforms } from '@/lib/ai'
import { getJustWatchBatch } from '@/lib/justwatch'
import type { PlatformName } from '@/types'

const ALL_TR_PLATFORMS: PlatformName[] = [
  'Netflix','Amazon Prime','Disney+','BluTV','GAIN','TOD','Tabii','MUBI','Exxen','Apple TV+'
]

export async function GET() {
  try {
    const movies = await getNewReleases()

    const [jwData, aiData] = await Promise.allSettled([
      getJustWatchBatch(movies.map(m => ({ id: m.id, title: m.title, year: m.year }))),
      detectPlatforms(movies, ALL_TR_PLATFORMS),
    ])

    const jwResults = jwData.status === 'fulfilled' ? jwData.value : {}
    const aiResults = aiData.status === 'fulfilled' ? aiData.value : []

    const results = movies.map(movie => {
      const jwPlatforms = jwResults[movie.id] || []
      const aiEntry = aiResults.find(a => a.id === movie.id)
      const aiPlatforms = aiEntry?.platforms || []

      return {
        ...movie,
        platforms: jwPlatforms.length > 0 ? jwPlatforms : aiPlatforms,
        overview_tr: aiEntry?.overview_tr || movie.overview,
        source: jwPlatforms.length > 0 ? 'justwatch' : 'ai',
      }
    })

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error('[/api/new]', err?.message)
    return NextResponse.json({ error: 'Yeni içerikler alınamadı' }, { status: 500 })
  }
}
