// lib/platforms.ts
import type { PlatformConfig, PlatformName } from '../types'

const enc = (s: string) => encodeURIComponent(s)

export const PLATFORMS: PlatformConfig[] = [
  { name: 'Netflix',      color: '#E50914', getUrl: t => `https://www.netflix.com/tr/search?q=${enc(t)}` },
  { name: 'Amazon Prime', color: '#00A8E1', getUrl: t => `https://www.primevideo.com/search/?phrase=${enc(t)}` },
  { name: 'Disney+',      color: '#6b8eff', getUrl: t => `https://www.disneyplus.com/tr-tr/search?q=${enc(t)}` },
  { name: 'HBO Max',      color: '#a855f7', getUrl: t => `https://play.max.com/search?q=${enc(t)}` },
  { name: 'Apple TV+',    color: '#c8c8c8', getUrl: t => `https://tv.apple.com/search?term=${enc(t)}` },
  { name: 'BluTV',        color: '#3b82f6', getUrl: t => `https://www.blutv.com/arama?q=${enc(t)}` },
  { name: 'GAIN',         color: '#ff6b00', getUrl: t => `https://www.gain.tv/search?q=${enc(t)}` },
  { name: 'TOD',          color: '#8b5cf6', getUrl: t => `https://tod.tv/tr/search?q=${enc(t)}` },
  { name: 'Tabii',        color: '#22c55e', getUrl: t => `https://www.tabii.com/search?q=${enc(t)}` },
  { name: 'MUBI',         color: '#ff3c5f', getUrl: t => `https://mubi.com/tr/search?q=${enc(t)}` },
  { name: 'Exxen',        color: '#f97316', getUrl: t => `https://www.exxen.com/search?q=${enc(t)}` },
]

export const getPlatform = (name: PlatformName) =>
  PLATFORMS.find(p => p.name === name)

export const DEFAULT_ACTIVE: PlatformName[] = [
  'Netflix', 'Amazon Prime', 'Disney+', 'Apple TV+',
  'BluTV', 'GAIN', 'TOD', 'Tabii', 'MUBI', 'Exxen',
]
