// src/lib/justwatch.ts
import type { PlatformName } from '@/types'

const PROVIDER_MAP: Record<string, PlatformName> = {
  'nfx':  'Netflix',
  'prv':  'Amazon Prime',
  'amp':  'Amazon Prime',
  'dnp':  'Disney+',
  'atp':  'Apple TV+',
  'mbi':  'MUBI',
  'blv':  'BluTV',
  'gai':  'GAIN',
  'tod':  'TOD',
  'tbi':  'Tabii',
  'exx':  'Exxen',
}

const SEARCH_QUERY = `
query SearchTitles($country: Country!, $language: Language!, $searchQuery: String!) {
  popularTitles(
    country: $country
    filter: { searchQuery: $searchQuery }
    first: 5
    sortBy: POPULAR
    sortRandomSeed: 0
  ) {
    edges {
      node {
        id
        objectType
        content(country: $country, language: $language) {
          title
          originalReleaseYear
          externalIds { tmdbId }
        }
        offers(country: $country) {
          monetizationType
          package { shortName clearName }
        }
      }
    }
  }
}
`

function extractPlatforms(offers: any[], active: PlatformName[]): PlatformName[] {
  const out = new Set<PlatformName>()
  for (const o of offers || []) {
    if (o.monetizationType !== 'FLATRATE' && o.monetizationType !== 'FREE') continue
    const short = (o.package?.shortName || '').toLowerCase()
    const clear = (o.package?.clearName || '').toLowerCase()
    const mapped = PROVIDER_MAP[short]
    if (mapped) { out.add(mapped); continue }
    if (clear.includes('netflix'))        out.add('Netflix')
    else if (clear.includes('prime'))     out.add('Amazon Prime')
    else if (clear.includes('disney'))    out.add('Disney+')
    else if (clear.includes('apple'))     out.add('Apple TV+')
    else if (clear.includes('mubi'))      out.add('MUBI')
    else if (clear.includes('blutv'))     out.add('BluTV')
    else if (clear.includes('gain'))      out.add('GAIN')
    else if (clear.includes('tod') || clear.includes('bein')) out.add('TOD')
    else if (clear.includes('tabii'))     out.add('Tabii')
    else if (clear.includes('exxen'))     out.add('Exxen')
  }
  return Array.from(out).filter(p => active.includes(p))
}

export async function getJustWatchPlatforms(
  title: string,
  year: number,
  tmdbId: number,
  active: PlatformName[]
): Promise<PlatformName[]> {
  try {
    const res = await fetch('https://apis.justwatch.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.justwatch.com',
        'Referer': 'https://www.justwatch.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { country: 'TR', language: 'tr', searchQuery: title },
      }),
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`JW HTTP ${res.status}`)
    const data = await res.json()
    if (data.errors) throw new Error(data.errors[0]?.message)

    const edges = data?.data?.popularTitles?.edges || []
    if (!edges.length) return []

    // TMDB ID ile eşleştir
    let match = edges.find((e: any) =>
      String(e.node?.content?.externalIds?.tmdbId) === String(tmdbId)
    )
    // Yoksa başlık+yıl
    if (!match) {
      match = edges.find((e: any) => {
        const t = (e.node?.content?.title || '').toLowerCase()
        const y = Number(e.node?.content?.originalReleaseYear)
        return (t === title.toLowerCase()) && (!year || !y || Math.abs(y - year) <= 1)
      }) || edges[0]
    }

    return match ? extractPlatforms(match.node?.offers || [], active) : []
  } catch (err: any) {
    console.warn(`JustWatch [${title}]:`, err?.message?.slice(0, 60))
    return []
  }
}

export async function getJustWatchBatch(
  movies: { id: number; title: string; year: number }[],
  active: PlatformName[] = []
): Promise<Record<number, PlatformName[]>> {
  const out: Record<number, PlatformName[]> = {}
  for (let i = 0; i < movies.length; i += 3) {
    await Promise.all(movies.slice(i, i + 3).map(async m => {
      out[m.id] = await getJustWatchPlatforms(m.title, m.year, m.id, active)
    }))
    if (i + 3 < movies.length) await new Promise(r => setTimeout(r, 150))
  }
  return out
}
