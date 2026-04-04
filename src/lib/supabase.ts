// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SVC  = process.env.SUPABASE_SERVICE_KEY!

// Client-side (public)
export const supabase = createClient(URL, ANON)

// Server-side (admin - API routes only)
export const supabaseAdmin = createClient(URL, SVC)

export type PlatformReport = {
  id?: string
  tmdb_id: number
  title: string
  media_type: string
  reported_platform: string
  action: 'add' | 'remove'
  user_note?: string
  confirmed?: boolean
  created_at?: string
}

export type PlatformOverride = {
  tmdb_id: number
  media_type: string
  platforms: string[]
  updated_at?: string
}
