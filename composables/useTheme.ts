import type { ComputedRef } from 'vue'
import type { ThemePreference } from '~/stores/settings'
import { useSettingsStore } from '~/stores/settings'

const LABELS: Record<ThemePreference, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
}

/** Theme controls backed by the persisted settings store. */
export function useTheme(): {
  theme: ComputedRef<ThemePreference>
  label: ComputedRef<string>
  setTheme: (value: ThemePreference) => void
  cycleTheme: () => void
} {
  const settings = useSettingsStore()

  const theme = computed(() => settings.theme)
  const label = computed(() => LABELS[settings.theme])

  return {
    theme,
    label,
    setTheme: settings.setTheme,
    cycleTheme: settings.cycleTheme,
  }
}
