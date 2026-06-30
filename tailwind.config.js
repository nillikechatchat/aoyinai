/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f0e8',
          100: '#ede5d5',
          200: '#d9cab0',
          300: '#bfa882',
          400: '#a68b5e',
          500: '#8c7044',
          600: '#6b5535',
          700: '#4d3d27',
          800: '#332819',
          900: '#1a1410',
          950: '#0d0a08'
        },
        vermilion: {
          DEFAULT: '#c53d43',
          light: '#e25a5a',
          dark: '#8b2020'
        },
        gold: {
          DEFAULT: '#b8860b',
          light: '#d4a017',
          dark: '#8b6914'
        },
        jade: {
          DEFAULT: '#2e8b57',
          light: '#3cb371',
          dark: '#1e5631'
        },
        rice: {
          DEFAULT: '#f5f0e8',
          warm: '#f0e8d8',
          cool: '#f8f4ed'
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
        kai: ['"KaiTi"', '"STKaiti"', '"AR PL UKai CN"', 'serif']
      },
      backgroundImage: {
        'rice-paper': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'ink-wash': 'linear-gradient(180deg, rgba(26,20,16,0.03) 0%, rgba(26,20,16,0) 40%, rgba(26,20,16,0.02) 100%)'
      },
      animation: {
        'ink-fade': 'inkFade 0.8s ease-out forwards',
        'ink-drip': 'inkDrip 1.2s ease-out forwards',
        'seal-stamp': 'sealStamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        inkFade: {
          '0%': { opacity: '0', transform: 'translateY(12px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' }
        },
        inkDrip: {
          '0%': { opacity: '0', transform: 'scaleY(0.3)', transformOrigin: 'top' },
          '60%': { opacity: '1', transform: 'scaleY(1.05)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' }
        },
        sealStamp: {
          '0%': { opacity: '0', transform: 'scale(1.8) rotate(-5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      },
      boxShadow: {
        'ink': '0 4px 20px rgba(26,20,16,0.08)',
        'ink-lg': '0 8px 40px rgba(26,20,16,0.12)',
        'ink-inner': 'inset 0 2px 8px rgba(26,20,16,0.06)'
      },
      borderWidth: {
        '1': '1px'
      }
    }
  },
  plugins: []
}