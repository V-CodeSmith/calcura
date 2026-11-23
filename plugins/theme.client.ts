import { useSettingsStore } from '~/stores/settings'

/**
 * Applies the theme to <html> and follows the OS preference while the user has
 * selected "system". Client-only: the first paint is handled by the inline
 * script in nuxt.config.ts so there is no flash of the wrong theme.
 */
export default defineNuxtPlugin(() => {
  const settings = useSettingsStore()
  const media = window.matchMedia('(prefers-color-scheme: dark)')

  function apply(): void {
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }

  media.addEventListener('change', () => {
    if (settings.theme === 'system') apply()
  })

  watch(() => settings.theme, apply)

  apply()
})
