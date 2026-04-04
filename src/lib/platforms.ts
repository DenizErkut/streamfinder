// src/lib/platforms.ts
import type { PlatformConfig, PlatformName } from '@/types'

const enc = (s: string) => encodeURIComponent(s)

// SADECE TÜRKİYE'DE AKTİF PLATFORMLAR
export const PLATFORMS: PlatformConfig[] = [
  {
    name: 'Netflix',
    color: '#E50914',
    bgClass: 'bg-red-900/20',
    textClass: 'text-red-400',
    borderClass: 'border-red-700/40',
    getUrl: t => `https://www.netflix.com/tr/search?q=${enc(t)}`,
  },
  {
    name: 'Amazon Prime',
    color: '#00A8E1',
    bgClass: 'bg-sky-900/20',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-600/40',
    getUrl: t => `https://www.primevideo.com/search/?phrase=${enc(t)}&ie=UTF8`,
  },
  {
    name: 'Disney+',
    color: '#6b8eff',
    bgClass: 'bg-blue-900/20',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-600/40',
    getUrl: t => `https://www.disneyplus.com/tr-tr/search?q=${enc(t)}`,
  },
  {
    name: 'BluTV',
    color: '#3b82f6',
    bgClass: 'bg-blue-800/20',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/40',
    getUrl: t => `https://www.blutv.com/arama?q=${enc(t)}`,
  },
  {
    name: 'GAIN',
    color: '#ff6b00',
    bgClass: 'bg-orange-900/20',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-600/40',
    getUrl: t => `https://www.gain.tv/search?q=${enc(t)}`,
  },
  {
    name: 'TOD',
    color: '#8b5cf6',
    bgClass: 'bg-violet-900/20',
    textClass: 'text-violet-400',
    borderClass: 'border-violet-600/40',
    getUrl: t => `https://tod.tv/tr/search?q=${enc(t)}`,
  },
  {
    name: 'Tabii',
    color: '#22c55e',
    bgClass: 'bg-green-900/20',
    textClass: 'text-green-400',
    borderClass: 'border-green-600/40',
    getUrl: t => `https://www.tabii.com/search?q=${enc(t)}`,
  },
  {
    name: 'MUBI',
    color: '#ff3c5f',
    bgClass: 'bg-rose-900/20',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-600/40',
    getUrl: t => `https://mubi.com/tr/search?q=${enc(t)}`,
  },
  {
    name: 'Exxen',
    color: '#f97316',
    bgClass: 'bg-orange-800/20',
    textClass: 'text-orange-300',
    borderClass: 'border-orange-500/40',
    getUrl: t => `https://www.exxen.com/search?q=${enc(t)}`,
  },
  {
    name: 'Apple TV+',
    color: '#c8c8c8',
    bgClass: 'bg-white/5',
    textClass: 'text-gray-300',
    borderClass: 'border-gray-600/40',
    getUrl: t => `https://tv.apple.com/tr/search?term=${enc(t)}`,
  },
  {
    name: 'TV+',
    color: '#00b4d8',
    bgClass: 'bg-cyan-900/20',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-600/40',
    getUrl: t => `https://www.tvplus.com.tr/search?q=${enc(t)}`,
  },
  {
    name: 'Tivibu',
    color: '#e63946',
    bgClass: 'bg-red-900/20',
    textClass: 'text-red-400',
    borderClass: 'border-red-700/40',
    getUrl: t => `https://www.tivibu.com.tr/arama?q=${enc(t)}`,
  },
]

export const getPlatform = (name: PlatformName): PlatformConfig | undefined =>
  PLATFORMS.find(p => p.name === name)

// Varsayılan: hepsi aktif
export const DEFAULT_ACTIVE: PlatformName[] = [
  'Netflix', 'Amazon Prime', 'Disney+', 'Apple TV+',
  'BluTV', 'GAIN', 'TOD', 'Tabii', 'MUBI', 'Exxen', 'TV+', 'Tivibu',
]

export const GENRES: Record<number, string> = {
  28: 'Aksiyon', 12: 'Macera', 16: 'Animasyon', 35: 'Komedi',
  80: 'Suç', 99: 'Belgesel', 18: 'Drama', 10751: 'Aile',
  14: 'Fantazi', 36: 'Tarih', 27: 'Korku', 10402: 'Müzik',
  9648: 'Gizem', 10749: 'Romantik', 878: 'Bilim Kurgu',
  10770: 'TV Film', 53: 'Gerilim', 10752: 'Savaş', 37: 'Western',
}
