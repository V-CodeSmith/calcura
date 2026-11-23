import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

export const PRECISION_MIN = 4
export const PRECISION_MAX = 15

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<ThemePreference>('system')
    const precision = ref(12)

    const isDarkPreferred = computed(() => theme.value === 'dark')

    function setTheme(value: ThemePreference): void {
      theme.value = value
    }

    /** Cycles light → dark → system, matching the single-button theme control. */
    function cycleTheme(): void {
      theme.value = theme.value === 'system' ? 'light' : theme.value === 'light' ? 'dark' : 'system'
    }

    function setPrecision(value: number): void {
      const rounded = Math.round(value)
      precision.value = Math.min(Math.max(rounded, PRECISION_MIN), PRECISION_MAX)
    }

    return { theme, precision, isDarkPreferred, setTheme, cycleTheme, setPrecision }
  },
  {
    // Key is mirrored by the pre-hydration theme script in nuxt.config.ts.
    persist: {
      key: 'calcura:settings',
      pick: ['theme', 'precision'],
    },
  },
)
