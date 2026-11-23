import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app.vue',
    './pages/**/*.vue',
    './components/**/*.vue',
    './composables/**/*.ts',
    './utils/**/*.ts',
  ],
  theme: {
    extend: {
      screens: {
        // Short desktop windows (e.g. 1366×768 laptops): the calculator
        // compacts instead of forcing the page to scroll.
        'desk-short': { raw: '(min-width: 1024px) and (max-height: 820px)' },
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          light: '#f5f6fb',
          DEFAULT: '#ffffff',
          dark: '#0f1526',
          'dark-alt': '#161d31',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        key: '0 1px 0 0 rgb(15 23 42 / 0.08), 0 1px 2px 0 rgb(15 23 42 / 0.06)',
        card: '0 24px 60px -24px rgb(15 23 42 / 0.35)',
      },
      keyframes: {
        'key-pop': {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(0.94)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'key-pop': 'key-pop 140ms ease-out',
        'slide-in': 'slide-in 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 160ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
