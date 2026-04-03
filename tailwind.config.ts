import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        bg:      '#05080f',
        s1:      '#0a0f1c',
        s2:      '#101827',
        s3:      '#16202f',
        border1: '#1a2640',
        border2: '#243352',
        acc:     '#f0a500',
        acc2:    '#ff6b00',
        muted:   '#4a6480',
        muted2:  '#6b8aaa',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.35s ease both',
        fadeIn: 'fadeIn 0.2s ease both',
        spin:   'spin 0.75s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
