// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StreamFinder TR — Tüm Platformlarda Ara',
  description: 'Netflix, Disney+, BluTV, GAIN, TOD ve daha fazlasında aynı anda film ve dizi ara. Türkiye için platform bilgisi.',
  keywords: ['streaming', 'netflix', 'blutv', 'gain', 'tod', 'tabii', 'film', 'dizi', 'türkiye', 'platform'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StreamFinder',
  },
  openGraph: {
    title: 'StreamFinder TR — Tüm Platformlarda Ara',
    description: 'Netflix, BluTV, TOD ve daha fazlasında aynı anda film ara.',
    locale: 'tr_TR',
    type: 'website',
    siteName: 'StreamFinder TR',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f0a500',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StreamFinder" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
        <Analytics />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {})
              })
            }
          `
        }} />
      </body>
    </html>
  )
}
