/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecffd6',
          100: '#dcffd0',
          200: '#baffaa',
          300: '#8eff6f',
          400: '#5eff42',
          500: '#39ff14',
          600: '#2cd90d',
          700: '#1fae07',
          800: '#188c05',
          900: '#116e03',
          950: '#063f01',
        },
        slate: {
          50: '#f6f7f7',
          100: '#eceeed',
          200: '#d5d9d7',
          300: '#b0b8b5',
          400: '#838e8a',
          500: '#64706c',
          600: '#4f5956',
          700: '#374044',
          800: '#262d30',
          850: '#1f2427',
          900: '#161a1c',
          950: '#111415',
        },
        brand: {
          light: '#ecffd6',
          DEFAULT: '#39ff14',
          dark: '#1fae07',
          glow: '#5eff42',
        },
        darkbg: {
          card: '#262d30',
          page: '#111415',
          border: '#374044',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
