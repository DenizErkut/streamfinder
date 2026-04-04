// src/app/api/overrides/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const tmdb_id    = req.nextUrl.searchParams.get('tmdb_id')
  const media_type = req.nextUrl.searchParams.get('media_type')

  try {
    let query = supabaseAdmin.from('platform_overrides').select('*')
    if (tmdb_id)    query = query.eq('tmdb_id', parseInt(tmdb_id))
    if (media_type) query = query.eq('media_type', media_type)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ overrides: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { tmdb_id, media_type, platforms, report_id, action, reported_platform } = await req.json()

    // Mevcut override'ı getir
    const { data: existing } = await supabaseAdmin
      .from('platform_overrides')
      .select('platforms')
      .eq('tmdb_id', tmdb_id)
      .eq('media_type', media_type)
      .single()

    let finalPlatforms: string[]

    if (platforms) {
      // Admin manuel seçtiyse direkt kullan
      finalPlatforms = platforms
    } else if (action === 'remove' && reported_platform) {
      // Çıkarma işlemi — mevcut listeden kaldır
      const current = existing?.platforms || []
      finalPlatforms = current.filter((p: string) => p !== reported_platform)
    } else if (action === 'add' && reported_platform) {
      // Ekleme işlemi — mevcut listeye ekle
      const current = existing?.platforms || []
      finalPlatforms = [...new Set([...current, reported_platform])]
    } else {
      finalPlatforms = platforms || []
    }

    // Override kaydet
    const { error: upsertErr } = await supabaseAdmin
      .from('platform_overrides')
      .upsert({
        tmdb_id,
        media_type,
        platforms: finalPlatforms,
        updated_at: new Date().toISOString()
      })
    if (upsertErr) throw upsertErr

    // Bildirimi onayla
    if (report_id) {
      await supabaseAdmin
        .from('platform_reports')
        .update({ confirmed: true })
        .eq('id', report_id)
    }

    return NextResponse.json({ success: true, platforms: finalPlatforms })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
