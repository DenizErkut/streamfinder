// src/lib/ai.ts
import type { Movie, PlatformName } from '@/types'

interface PlatformResult {
  id: number
  platforms: PlatformName[]
  overview_tr: string
}

// ─── Kesin doğrulanmış TR platform veritabanı ─────────────────────────────
// Kural: Şüpheli olan HİÇ eklenmez. Yanlış bilgi = sıfır güven.
const TR_DB: Array<{ keywords: string[]; platforms: PlatformName[] }> = [
  // ── Netflix TR (kesin) ────────────────────────────────────────────────
  { keywords: ['stranger things'],            platforms: ['Netflix'] },
  { keywords: ['wednesday'],                  platforms: ['Netflix'] },
  { keywords: ['squid game'],                 platforms: ['Netflix'] },
  { keywords: ['the crown'],                  platforms: ['Netflix'] },
  { keywords: ['ozark'],                      platforms: ['Netflix'] },
  { keywords: ['money heist', 'la casa de papel'], platforms: ['Netflix'] },
  { keywords: ['narcos'],                     platforms: ['Netflix'] },
  { keywords: ['witcher'],                    platforms: ['Netflix'] },
  { keywords: ['bridgerton'],                 platforms: ['Netflix'] },
  { keywords: ['emily in paris'],             platforms: ['Netflix'] },
  { keywords: ['sex education'],              platforms: ['Netflix'] },
  { keywords: ['black mirror'],               platforms: ['Netflix'] },
  { keywords: ['cobra kai'],                  platforms: ['Netflix'] },
  { keywords: ['mindhunter'],                 platforms: ['Netflix'] },
  { keywords: ['house of cards'],             platforms: ['Netflix'] },
  { keywords: ['peaky blinders'],             platforms: ['Netflix'] },
  { keywords: ['bird box'],                   platforms: ['Netflix'] },
  { keywords: ['extraction'],                 platforms: ['Netflix'] },
  { keywords: ['red notice'],                 platforms: ['Netflix'] },
  { keywords: ['elite'],                      platforms: ['Netflix'] },
  { keywords: ['lupin'],                      platforms: ['Netflix'] },
  { keywords: ['better call saul'],           platforms: ['Netflix'] },
  { keywords: ['breaking bad'],               platforms: ['Netflix'] },
  { keywords: ['suits'],                      platforms: ['Netflix'] },
  { keywords: ['dark'],                       platforms: ['Netflix'] },
  { keywords: ['you '],                       platforms: ['Netflix'] },
  { keywords: ['inception'],                  platforms: ['Netflix'] },
  { keywords: ['interstellar'],               platforms: ['Netflix'] },
  { keywords: ['daredevil'],                  platforms: ['Netflix'] },
  // ── Amazon Prime TR (kesin) ───────────────────────────────────────────
  { keywords: ['the boys'],                   platforms: ['Amazon Prime'] },
  { keywords: ['rings of power'],             platforms: ['Amazon Prime'] },
  { keywords: ['reacher'],                    platforms: ['Amazon Prime'] },
  { keywords: ['jack ryan'],                  platforms: ['Amazon Prime'] },
  { keywords: ['invincible'],                 platforms: ['Amazon Prime'] },
  { keywords: ['upload'],                     platforms: ['Amazon Prime'] },
  { keywords: ['fleabag'],                    platforms: ['Amazon Prime'] },
  { keywords: ['fringe'],                     platforms: ['Amazon Prime'] },
  { keywords: ['fallout'],                    platforms: ['Amazon Prime'] },
  { keywords: ['citadel'],                    platforms: ['Amazon Prime'] },
  { keywords: ['the terminal list'],          platforms: ['Amazon Prime'] },
  { keywords: ['lost'],                       platforms: ['Amazon Prime'] },
  // ── Disney+ TR (kesin) ────────────────────────────────────────────────
  { keywords: ['mandalorian'],                platforms: ['Disney+'] },
  { keywords: ['loki'],                       platforms: ['Disney+'] },
  { keywords: ['wandavision'],                platforms: ['Disney+'] },
  { keywords: ['obi-wan', 'obi wan kenobi'], platforms: ['Disney+'] },
  { keywords: ['andor'],                      platforms: ['Disney+'] },
  { keywords: ['avengers'],                   platforms: ['Disney+'] },
  { keywords: ['iron man'],                   platforms: ['Disney+'] },
  { keywords: ['spider-man', 'spider man'],   platforms: ['Disney+'] },
  { keywords: ['black panther'],              platforms: ['Disney+'] },
  { keywords: ['thor'],                       platforms: ['Disney+'] },
  { keywords: ['doctor strange'],             platforms: ['Disney+'] },
  { keywords: ['guardians of the galaxy'],    platforms: ['Disney+'] },
  { keywords: ['star wars'],                  platforms: ['Disney+'] },
  { keywords: ['avatar'],                     platforms: ['Disney+'] },
  { keywords: ['lion king'],                  platforms: ['Disney+'] },
  { keywords: ['frozen'],                     platforms: ['Disney+'] },
  { keywords: ['moana'],                      platforms: ['Disney+'] },
  { keywords: ['encanto'],                    platforms: ['Disney+'] },
  { keywords: ['the simpsons'],               platforms: ['Disney+'] },
  // ── Apple TV+ TR (kesin) ──────────────────────────────────────────────
  { keywords: ['severance'],                  platforms: ['Apple TV+'] },
  { keywords: ['ted lasso'],                  platforms: ['Apple TV+'] },
  { keywords: ['foundation'],                 platforms: ['Apple TV+'] },
  { keywords: ['shrinking'],                  platforms: ['Apple TV+'] },
  { keywords: ['slow horses'],                platforms: ['Apple TV+'] },
  { keywords: ['silo'],                       platforms: ['Apple TV+'] },
  { keywords: ['for all mankind'],            platforms: ['Apple TV+'] },
  { keywords: ['the morning show'],           platforms: ['Apple TV+'] },
  { keywords: ['bad sisters'],                platforms: ['Apple TV+'] },
  // ── TOD TR — beIN/HBO içerikleri (kesin) ─────────────────────────────
  { keywords: ['game of thrones'],            platforms: ['TOD'] },
  { keywords: ['house of the dragon'],        platforms: ['TOD'] },
  { keywords: ['succession'],                 platforms: ['TOD'] },
  { keywords: ['euphoria'],                   platforms: ['TOD'] },
  { keywords: ['the last of us'],             platforms: ['TOD'] },
  { keywords: ['the wire'],                   platforms: ['TOD'] },
  { keywords: ['the sopranos'],               platforms: ['TOD'] },
  { keywords: ['band of brothers'],           platforms: ['TOD'] },
  { keywords: ['chernobyl'],                  platforms: ['TOD'] },
  { keywords: ['westworld'],                  platforms: ['TOD'] },
  { keywords: ['the white lotus'],            platforms: ['TOD'] },
  { keywords: ['true detective'],             platforms: ['TOD'] },
  { keywords: ['barry'],                      platforms: ['TOD'] },
  { keywords: ['industry'],                   platforms: ['TOD'] },
  { keywords: ['the penguin'],                platforms: ['TOD'] },
  // ── Tabii TR — TRT içerikleri (kesin) ────────────────────────────────
  { keywords: ['diriliş ertuğrul', 'dirilis ertugrul', 'ertugrul'], platforms: ['Tabii'] },
  { keywords: ['kuruluş osman', 'kurulus osman'],                    platforms: ['Tabii'] },
  { keywords: ['barbaroslar'],                platforms: ['Tabii'] },
  { keywords: ['alparslan'],                  platforms: ['Tabii'] },
  { keywords: ['payitaht abdülhamid'],        platforms: ['Tabii'] },
  { keywords: ['uyanış büyük selçuklu'],      platforms: ['Tabii'] },
  // ── BluTV TR — yerli yapımlar (kesin) ────────────────────────────────
  { keywords: ['sadakatsiz'],                 platforms: ['BluTV'] },
  { keywords: ['çukur'],                      platforms: ['BluTV'] },
  { keywords: ['eşkıya dünyaya hükümdar olmaz'], platforms: ['BluTV'] },
  { keywords: ['hercai'],                     platforms: ['BluTV'] },
  { keywords: ['kuzey yıldızı ilk aşk'],      platforms: ['BluTV'] },
  { keywords: ['bir küçük gün işiği'],        platforms: ['BluTV'] },
  // ── Exxen TR (kesin) ──────────────────────────────────────────────────
  { keywords: ['survivor'],                   platforms: ['Exxen'] },
  { keywords: ['yüksek sosyete'],             platforms: ['Exxen'] },
  // ── MUBI TR (kesin) ───────────────────────────────────────────────────
  { keywords: ['parasite'],                   platforms: ['MUBI'] },
  { keywords: ['past lives'],                 platforms: ['MUBI'] },
  { keywords: ['aftersun'],                   platforms: ['MUBI'] },
  { keywords: ['tár'],                        platforms: ['MUBI'] },
  { keywords: ['drive my car'],               platforms: ['MUBI'] },
]

function dbLookup(title: string): PlatformName[] {
  const lower = title.toLowerCase()
  for (const entry of TR_DB) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.platforms
  }
  return []
}

// ─── AI tespiti ───────────────────────────────────────────────────────────
async function detectWithAI(
  movies: Movie[],
  activePlatforms: PlatformName[]
): Promise<PlatformResult[]> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const list = movies.map(m =>
    `- ID:${m.id} | "${m.title}" (${m.year}) | ${m.media_type === 'tv' ? 'Dizi' : 'Film'}`
  ).join('\n')

  const prompt = `Sen Türkiye streaming platformları veritabanısın (bilgi kesimi Ağustos 2025).

GÖREV: Her içerik için Türkiye'de hangi platformlarda yayınlandığını söyle.

KULLANILACAK PLATFORMLAR: ${activePlatforms.join(', ')}

ZORUNLU KURALLAR — İHLAL ETME:
1. Sadece %100 emin olduğun platformları yaz. Şüphe varsa → []
2. HBO Max Türkiye'de YOK. HBO içerikleri → TOD
3. Hulu, Peacock, Paramount+ Türkiye'de YOK
4. Eski filmler (2015 öncesi) için genellikle [] döndür — lisanslar değişmiş olabilir
5. Türkçe özet: 2 cümle, spoiler yok

İÇERİKLER:
${list}

SADECE JSON (başka hiçbir şey yazma):
[{"id": <number>, "platforms": [], "overview_tr": "Türkçe özet."}]`

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
    throw new Error('JSON parse başarısız')
  }
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────────
export async function detectPlatforms(
  movies: Movie[],
  activePlatforms: PlatformName[]
): Promise<PlatformResult[]> {
  if (movies.length === 0) return []

  let aiResults: PlatformResult[] = []

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      aiResults = await detectWithAI(movies, activePlatforms)
      console.log('✅ AI platform tespiti başarılı')
    } catch (err: any) {
      console.warn('⚠️ AI hatası:', err?.message?.slice(0, 60))
    }
  }

  // Her film için: AI + DB katmanlı kontrol
  return movies.map(m => {
    const aiEntry = aiResults.find(r => r.id === m.id)
    const aiPlatforms = aiEntry?.platforms || []

    // DB'den kesin bilgi
    const dbPlatforms = dbLookup(m.title).filter(p => activePlatforms.includes(p))

    // AI bulmuşsa kullan, bulamadıysa DB'ye bak
    const finalPlatforms = aiPlatforms.length > 0 ? aiPlatforms : dbPlatforms

    if (dbPlatforms.length > 0 && aiPlatforms.length === 0) {
      console.log(`📦 DB: "${m.title}" → ${dbPlatforms.join(', ')}`)
    }

    return {
      id: m.id,
      platforms: finalPlatforms,
      overview_tr: aiEntry?.overview_tr || m.overview,
    }
  })
}
