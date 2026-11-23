import type { ModuleOptions } from '@vite-pwa/nuxt'

/** Brand colours shared by the PWA manifest, meta tags and Tailwind theme. */
const THEME_COLOR = '#6366f1'
const BACKGROUND_COLOR = '#0b1020'

/**
 * Runs before the app hydrates so a dark-theme user never sees a white flash.
 * The key matches `settings` store persistence in `stores/settings.ts`.
 */
const THEME_BOOTSTRAP = `(() => {
  try {
    const raw = localStorage.getItem('calcura:settings')
    const stored = raw ? JSON.parse(raw) : null
    const preference = stored && typeof stored.theme === 'string' ? stored.theme : 'system'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = preference === 'dark' || (preference === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  } catch {
    /* localStorage can be unavailable in private mode — the app still works. */
  }
})()`

const pwa = {
  registerType: 'autoUpdate',

  manifest: {
    name: 'Calcura — Advanced Calculator',
    short_name: 'Calcura',
    description:
      'An advanced scientific calculator with a live expression preview, history, memory and full keyboard support. Works offline.',
    lang: 'en',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    categories: ['utilities', 'productivity', 'education'],
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },

  generateSW: {
    // Precache the app shell so a reload works with no network at all.
    globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
    navigateFallback: '/',
    navigateFallbackDenylist: [/^\/api\//],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
  },

  client: {
    installPrompt: false,
    periodicSyncForUpdates: 3600,
  },

  registerWebManifestInRouteRules: true,

  // Unbundled dev modules would be cached by a dev service worker and hide
  // changes; exercise the PWA with `npm run build && npm run preview`.
  devOptions: {
    enabled: false,
    type: 'module',
    suppressWarnings: true,
  },
} satisfies Partial<ModuleOptions>

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: ['@vite-pwa/nuxt', '@pinia/nuxt', '@nuxtjs/tailwindcss'],

  // Flat component names: `components/Display.vue` is usable as <Display>.
  components: [{ path: '~/components', pathPrefix: false }],

  // @nuxtjs/tailwindcss injects this entry point, so it must not be listed in
  // `css` as well or every utility would be emitted twice.
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
    viewer: false,
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  nitro: {
    // A prerendered shell gives the service worker a real document to fall
    // back to when the app is opened offline.
    prerender: {
      routes: ['/'],
      crawlLinks: false,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Calcura — Advanced Calculator',
      titleTemplate: '%s',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: THEME_COLOR, media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: BACKGROUND_COLOR, media: '(prefers-color-scheme: dark)' },
        {
          name: 'description',
          content:
            'An advanced scientific calculator with live preview, history, memory and keyboard support. Fully client-side and offline-ready.',
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Calcura' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png', sizes: '180x180' },
      ],
      script: [{ innerHTML: THEME_BOOTSTRAP, tagPosition: 'head' }],
    },
  },

  pwa,
})
