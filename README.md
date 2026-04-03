# 🎬 StreamFinder TR

Türkiye'deki tüm streaming platformlarında tek aramadan film ve dizi bul.

## Kurulum

```bash
npm install
```

`.env.local` dosyasını düzenle:
```env
TMDB_API_KEY=...        # themoviedb.org (ücretsiz)
ANTHROPIC_API_KEY=...   # console.anthropic.com
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

```bash
npm run dev  # → http://localhost:3005
```

---

## 🚀 Vercel'e Deploy (Ücretsiz)

### Yöntem 1 — Vercel CLI (Önerilen)

```bash
# 1. Vercel CLI kur
npm install -g vercel

# 2. Giriş yap (GitHub ile)
vercel login

# 3. Deploy et
vercel

# Sorulara cevap ver:
# - Set up and deploy? → Y
# - Which scope? → kendi hesabın
# - Link to existing project? → N
# - Project name? → streamfinder-tr
# - In which directory? → . (nokta)
# - Override settings? → N
```

### Yöntem 2 — GitHub + Vercel Dashboard

1. Projeyi GitHub'a push et:
```bash
git init
git add .
git commit -m "StreamFinder TR"
git remote add origin https://github.com/KULLANICI_ADI/streamfinder-tr.git
git push -u origin main
```

2. [vercel.com/new](https://vercel.com/new) → Import Git Repository
3. Repo'yu seç → **Environment Variables** ekle (aşağıya bak)
4. Deploy!

### Environment Variables (Vercel Dashboard)

Vercel → Project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `TMDB_API_KEY` | TMDB API key'in |
| `ANTHROPIC_API_KEY` | Anthropic API key'in |

> ⚠️ `NEXT_PUBLIC_APP_URL`'i Vercel'de eklemene gerek yok.

---

## 📱 PWA (Mobil Uygulama Gibi)

Deploy sonrası siteye mobil tarayıcıdan gir:
- **Android Chrome** → Menü → "Ana Ekrana Ekle"
- **iOS Safari** → Paylaş → "Ana Ekrana Ekle"

Uygulama ikon olarak ana ekranda görünür, tam ekran çalışır!

---

## Proje Yapısı

```
src/
├── app/
│   ├── page.tsx              # Ana sayfa
│   ├── layout.tsx            # PWA meta + SW kayıt
│   └── api/
│       ├── search/route.ts   # TMDB + JustWatch + AI
│       ├── trending/route.ts
│       └── new/route.ts
├── components/
│   ├── MovieCard.tsx
│   ├── MovieModal.tsx
│   └── WatchlistPanel.tsx
├── lib/
│   ├── tmdb.ts               # TMDB API
│   ├── ai.ts                 # Claude AI + fallback DB
│   └── justwatch.ts          # JustWatch GraphQL
public/
├── manifest.json             # PWA manifest
├── sw.js                     # Service Worker
├── icon-192.png
└── icon-512.png
```
