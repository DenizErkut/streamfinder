// src/lib/ai.ts
import type { Movie, PlatformName } from '@/types'

interface PlatformResult {
  id: number
  platforms: PlatformName[]
  overview_tr: string
}

// ─── Kesin doğru TR platform veritabanı ───────────────────────────────────
// Sadece %100 doğrulanan içerikler — yanlış daha kötü
const TR_DB: Array<{ keywords: string[]; platforms: PlatformName[] }> = [
  // Netflix TR
  { keywords: ['stranger things'],               platforms: ['Netflix'] },
  { keywords: ['wednesday'],                     platforms: ['Netflix'] },
  { keywords: ['squid game'],                    platforms: ['Netflix'] },
  { keywords: ['the crown'],                     platforms: ['Netflix'] },
  { keywords: ['ozark'],                         platforms: ['Netflix'] },
  { keywords: ['money heist', 'la casa de papel'],platforms: ['Netflix'] },
  { keywords: ['narcos'],                        platforms: ['Netflix'] },
  { keywords: ['witcher'],                       platforms: ['Netflix'] },
  { keywords: ['bridgerton'],                    platforms: ['Netflix'] },
  { keywords: ['emily in paris'],                platforms: ['Netflix'] },
  { keywords: ['sex education'],                 platforms: ['Netflix'] },
  { keywords: ['black mirror'],                  platforms: ['Netflix'] },
  { keywords: ['cobra kai'],                     platforms: ['Netflix'] },
  { keywords: ['mindhunter'],                    platforms: ['Netflix'] },
  { keywords: ['house of cards'],                platforms: ['Netflix'] },
  { keywords: ['peaky blinders'],                platforms: ['Netflix'] },
  { keywords: ['bird box'],                      platforms: ['Netflix'] },
  { keywords: ['extraction'],                    platforms: ['Netflix'] },
  { keywords: ['red notice'],                    platforms: ['Netflix'] },
  { keywords: ['elite'],                         platforms: ['Netflix'] },
  { keywords: ['lupin'],                         platforms: ['Netflix'] },
  { keywords: ['better call saul'],              platforms: ['Netflix'] },
  { keywords: ['breaking bad'],                  platforms: ['Netflix'] },
  { keywords: ['suits'],                         platforms: ['Netflix'] },
  { keywords: ['daredevil'],                     platforms: ['Netflix'] },
  { keywords: ['dark'],                          platforms: ['Netflix'] },
  { keywords: ['you'],                           platforms: ['Netflix'] },
  // Amazon Prime TR
  { keywords: ['the boys'],                      platforms: ['Amazon Prime'] },
  { keywords: ['rings of power'],                platforms: ['Amazon Prime'] },
  { keywords: ['reacher'],                       platforms: ['Amazon Prime'] },
  { keywords: ['jack ryan'],                     platforms: ['Amazon Prime'] },
  { keywords: ['invincible'],                    platforms: ['Amazon Prime'] },
  { keywords: ['upload'],                        platforms: ['Amazon Prime'] },
  { keywords: ['fleabag'],                       platforms: ['Amazon Prime'] },
  { keywords: ['bosch'],                         platforms: ['Amazon Prime'] },
  { keywords: ['fringe'],                        platforms: ['Amazon Prime'] },
  { keywords: ['lost'],                          platforms: ['Amazon Prime'] },
  { keywords: ['the walking dead'],              platforms: ['Amazon Prime'] },
  { keywords: ['prison break'],                  platforms: ['Amazon Prime'] },
  { keywords: ['fallout'],                       platforms: ['Amazon Prime'] },
  { keywords: ['the terminal list'],             platforms: ['Amazon Prime'] },
  { keywords: ['citadel'],                       platforms: ['Amazon Prime'] },
  { keywords: ['pulp fiction'],                  platforms: ['Amazon Prime'] },
  { keywords: ['goodfellas'],                    platforms: ['Amazon Prime'] },
  { keywords: ['shawshank'],                     platforms: ['Amazon Prime'] },
  { keywords: ['schindler'],                     platforms: ['Amazon Prime'] },
  { keywords: ['inception'],                     platforms: ['Amazon Prime'] },
  { keywords: ['interstellar'],                  platforms: ['Amazon Prime'] },
  { keywords: ['gladiator'],                     platforms: ['Amazon Prime'] },
  { keywords: ['wolf of wall street'],           platforms: ['Amazon Prime'] },
  // Disney+ TR
  { keywords: ['mandalorian'],                   platforms: ['Disney+'] },
  { keywords: ['loki'],                          platforms: ['Disney+'] },
  { keywords: ['wandavision'],                   platforms: ['Disney+'] },
  { keywords: ['obi-wan', 'obi wan'],            platforms: ['Disney+'] },
  { keywords: ['andor'],                         platforms: ['Disney+'] },
  { keywords: ['avengers'],                      platforms: ['Disney+'] },
  { keywords: ['iron man'],                      platforms: ['Disney+'] },
  { keywords: ['spider-man', 'spider man'],      platforms: ['Disney+'] },
  { keywords: ['black panther'],                 platforms: ['Disney+'] },
  { keywords: ['thor'],                          platforms: ['Disney+'] },
  { keywords: ['doctor strange'],                platforms: ['Disney+'] },
  { keywords: ['guardians'],                     platforms: ['Disney+'] },
  { keywords: ['star wars'],                     platforms: ['Disney+'] },
  { keywords: ['avatar'],                        platforms: ['Disney+'] },
  { keywords: ['lion king'],                     platforms: ['Disney+'] },
  { keywords: ['frozen'],                        platforms: ['Disney+'] },
  { keywords: ['moana'],                         platforms: ['Disney+'] },
  { keywords: ['encanto'],                       platforms: ['Disney+'] },
  { keywords: ['simpsons'],                      platforms: ['Disney+'] },
  // Apple TV+ TR
  { keywords: ['severance'],                     platforms: ['Apple TV+'] },
  { keywords: ['ted lasso'],                     platforms: ['Apple TV+'] },
  { keywords: ['foundation'],                    platforms: ['Apple TV+'] },
  { keywords: ['shrinking'],                     platforms: ['Apple TV+'] },
  { keywords: ['slow horses'],                   platforms: ['Apple TV+'] },
  { keywords: ['silo'],                          platforms: ['Apple TV+'] },
  { keywords: ['for all mankind'],               platforms: ['Apple TV+'] },
  { keywords: ['morning show'],                  platforms: ['Apple TV+'] },
  // TOD TR (beIN / HBO içerikleri)
  { keywords: ['game of thrones'],               platforms: ['TOD'] },
  { keywords: ['house of the dragon'],           platforms: ['TOD'] },
  { keywords: ['succession'],                    platforms: ['TOD'] },
  { keywords: ['euphoria'],                      platforms: ['TOD'] },
  { keywords: ['the last of us'],                platforms: ['TOD'] },
  { keywords: ['the wire'],                      platforms: ['TOD'] },
  { keywords: ['sopranos'],                      platforms: ['TOD'] },
  { keywords: ['band of brothers'],              platforms: ['TOD'] },
  { keywords: ['chernobyl'],                     platforms: ['TOD'] },
  { keywords: ['westworld'],                     platforms: ['TOD'] },
  { keywords: ['white lotus'],                   platforms: ['TOD'] },
  { keywords: ['true detective'],                platforms: ['TOD'] },
  { keywords: ['barry'],                         platforms: ['TOD'] },
  { keywords: ['joker'],                         platforms: ['TOD'] },
  { keywords: ['dune'],                          platforms: ['TOD'] },
  { keywords: ['matrix'],                        platforms: ['TOD'] },
  { keywords: ['dark knight'],                   platforms: ['TOD'] },
  { keywords: ['oppenheimer'],                   platforms: ['TOD'] },
  { keywords: ['barbie'],                        platforms: ['TOD'] },
  // Tabii TR
  { keywords: ['diriliş', 'ertugrul', 'ertuğrul'], platforms: ['Tabii'] },
  { keywords: ['kuruluş osman', 'kurulus osman'],   platforms: ['Tabii'] },
  { keywords: ['barbaroslar'],                   platforms: ['Tabii'] },
  { keywords: ['alparslan'],                     platforms: ['Tabii'] },
  { keywords: ['payitaht'],                      platforms: ['Tabii'] },
  // BluTV TR
  { keywords: ['sadakatsiz'],                    platforms: ['BluTV'] },
  { keywords: ['çukur', 'cukur'],                platforms: ['BluTV'] },
  { keywords: ['eşkıya', 'eskiya'],              platforms: ['BluTV'] },
  { keywords: ['hercai'],                        platforms: ['BluTV'] },
  // Exxen TR
  { keywords: ['survivor'],                      platforms: ['Exxen'] },
  // MUBI TR
  { keywords: ['parasite'],                      platforms: ['MUBI'] },
  { keywords: ['past lives'],                    platforms: ['MUBI'] },
  { keywords: ['aftersun'],                      platforms: ['MUBI'] },
]

function fallbackPlatforms(title: string): PlatformName[] {
  const lower = title.toLowerCase()
  for (const entry of TR_DB) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.platforms
  }
  return []
}

// ─── AI ile platform tespiti ──────────────────────────────────────────────
async function detectWithAI(
  movies: Movie[],
  activePlatforms: PlatformName[]
): Promise<PlatformResult[]> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const list = movies.map(m =>
    `- ID:${m.id} | "${m.title}" (${m.year}) | ${m.media_type === 'tv' ? 'Dizi' : 'Film'}`
  ).join('\n')

  const prompt = `Sen Türkiye streaming platformları uzmanısın (bilgi kesimi: Ağustos 2025).

GÖREV: Her içerik için Türkiye'de hangi platformlarda yayınlandığını söyle.

KURALLAR:
- Kullanılabilecek platformlar: ${activePlatforms.join(', ')}
- HBO Max Türkiye'de YOK — HBO içerikleri TOD'da yayınlanır
- Fringe (2008 dizisi) → Amazon Prime TR'de var
- Emin olmadığın içerikler için platforms: [] döndür
- Türkçe özet yaz (2 cümle, spoilersiz)

İçerikler:
${list}

SADECE JSON:
[{"id": <number>, "platforms": ["Amazon Prime"], "overview_tr": "Özet."}]`

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content.map(b => ('text' in b ? b.text : '')).join('')
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    console.error('Claude JSON parse hatası:', clean.slice(0, 200))
    throw new Error('JSON parse başarısız')
  }
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────────
export async function detectPlatforms(
  movies: Movie[],
  activePlatforms: PlatformName[]
): Promise<PlatformResult[]> {
  if (movies.length === 0) return []

  // AI'ı dene
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const aiResults = await detectWithAI(movies, activePlatforms)
      console.log('✅ AI platform tespiti başarılı')

      // AI boş döndürdüğü içerikler için hardcoded DB'yi kontrol et
      return aiResults.map(r => {
        if (r.platforms.length === 0) {
          const movie = movies.find(m => m.id === r.id)
          if (movie) {
            const dbPlatforms = fallbackPlatforms(movie.title)
              .filter(p => activePlatforms.includes(p))
            if (dbPlatforms.length > 0) {
              console.log(`📦 DB fallback: ${movie.title} → ${dbPlatforms.join(', ')}`)
              return { ...r, platforms: dbPlatforms }
            }
          }
        }
        return r
      })
    } catch (err: any) {
      console.warn('⚠️ AI kullanılamıyor, fallback devrede:', err?.message?.slice(0, 80))
    }
  }

  // Tam fallback
  console.log('📦 TR platform DB kullanılıyor')
  return movies.map(m => ({
    id: m.id,
    platforms: fallbackPlatforms(m.title).filter(p =>
      activePlatforms.includes(p)
    ) as PlatformName[],
    overview_tr: m.overview,
  }))
}
