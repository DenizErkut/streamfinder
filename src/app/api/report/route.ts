// src/app/api/report/route.ts
// Kullanıcı platform bildirimi API'si
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tmdb_id, title, media_type, reported_platform, action, user_note } = body

    if (!tmdb_id || !title || !reported_platform || !action) {
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('platform_reports')
      .insert({
        tmdb_id,
        title,
        media_type: media_type || 'movie',
        reported_platform,
        action,
        user_note: user_note || null,
        confirmed: false,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[/api/report]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
