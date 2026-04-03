// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchTMDB } from '@/lib/tmdb'
import { detectPlatforms } from '@/lib/ai'
import { getJustWatchBatch } from '@/lib/justwatch'
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

    // JustWatch + AI paralel
    const [jwRaw, aiRaw] = await Promise.allSettled([
      getJustWatchBatch(movies.map(m => ({ id: m.id, title: m.title, year: m.year })), active),
      detectPlatforms(movies, active),
    ])

    const jw = jwRaw.status === 'fulfilled' ? jwRaw.value : {}
    const ai = aiRaw.status === 'fulfilled' ? aiRaw.value : []

    const jwHit = Object.values(jw).some(p => p.length > 0)
    console.log(`JustWatch: ${jwHit ? '✅' : '⚠️ boş'} | AI: ${ai.length > 0 ? '✅' : '⚠️ boş'}`)

    const results = movies.map(movie => {
      const jwP = jw[movie.id] || []
      const aiEntry = ai.find(a => a.id === movie.id)
      const aiP = aiEntry?.platforms || []

      // Önce JustWatch, sonra AI — ikisi de boşsa [] (dürüst)
      const finalPlatforms = jwP.length > 0 ? jwP : aiP
      const source = jwP.length > 0 ? 'justwatch' : aiP.length > 0 ? 'ai' : 'unknown'

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
