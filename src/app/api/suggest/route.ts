// src/app/api/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  try {
    // Search movies + TV in parallel
    const [movies, tv] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&language=tr-TR&page=1&include_adult=false`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&language=tr-TR&page=1&include_adult=false`, { cache: 'no-store' }).then(r => r.json()),
    ])

    const movieResults = (movies.results || []).slice(0, 4).map((r: any) => ({
      id: r.id,
      title: r.title || r.name,
      year: r.release_date ? parseInt(r.release_date.slice(0, 4)) : 0,
      type: 'movie',
      score: r.popularity || 0,
    }))

    const tvResults = (tv.results || []).slice(0, 4).map((r: any) => ({
      id: r.id,
      title: r.name,
      year: r.first_air_date ? parseInt(r.first_air_date.slice(0, 4)) : 0,
      type: 'tv',
      score: r.popularity || 0,
    }))

    // Merge + sort by popularity + dedupe + limit 6
    const all = [...movieResults, ...tvResults]
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ score, ...r }) => r)

    return NextResponse.json({ results: all }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err: any) {
    return NextResponse.json({ results: [] })
  }
}
