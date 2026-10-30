/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#005AB6',
          light: '#2F80ED',
          dark: '#00438A',
          gradientStart: '#005AB6',
          gradientEnd: '#1672DF',
        },
        hyoText: {
          main: '#000000',
          heading: '#1E293B',
          navy: '#242F62',
          muted: '#475569',
          subtle: '#64748B',
          placeholder: '#727785',
        },
        mood: {
          great: { bg: '#dcfce7', border: '#bbf7d0', text: '#15803d' },
          good: { bg: '#e0f2fe', border: '#bae6fd', text: '#0369a1' },
          okay: { bg: '#fef9c3', border: '#fef08a', text: '#a16207' },
          tired: { bg: '#ffedd5', border: '#fed7aa', text: '#c2410c' },
          stressed: { bg: '#ffe4e6', border: '#fecdd3', text: '#be123c' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-glow': '0px 10px 28px -6px rgba(74, 144, 226, 0.12)',
        'nav': '0px 12px 32px -4px rgba(74, 144, 226, 0.18), 0px 4px 12px -2px rgba(30, 41, 59, 0.04)',
        'card': '0px 4px 20px -2px rgba(74, 144, 226, 0.06)',
        'btn': '0px 12px 14px rgba(0, 90, 182, 0.32)',
      }
    },
  },
  plugins: [],
}

