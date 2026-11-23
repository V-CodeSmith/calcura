<script setup lang="ts">
import type { ThemePreference } from '~/stores/settings'
import { useSettingsStore } from '~/stores/settings'

const settings = useSettingsStore()

/**
 * Persisted settings only arrive after hydration. Rendering the SSR default
 * ('system') for the first client paint keeps the markup identical to the
 * server's, so Vue never reports a hydration mismatch on these attributes.
 */
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const active = computed<ThemePreference>(() => (mounted.value ? settings.theme : 'system'))

const OPTIONS: readonly { id: ThemePreference; label: string }[] = [
  { id: 'light', label: 'Light theme' },
  { id: 'dark', label: 'Dark theme' },
  { id: 'system', label: 'System theme' },
]
</script>

<template>
  <div
    class="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-white p-0.5 dark:border-white/10 dark:bg-white/5"
    role="group"
    aria-label="Theme"
  >
    <button
      v-for="option in OPTIONS"
      :key="option.id"
      type="button"
      :aria-label="option.label"
      :aria-pressed="active === option.id"
      :title="option.label"
      class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      :class="
        active === option.id
          ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white'
          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10'
      "
      @click="settings.setTheme(option.id)"
    >
      <svg
        v-if="option.id === 'light'"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1"
        />
      </svg>
      <svg
        v-else-if="option.id === 'dark'"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7Z" />
      </svg>
      <svg
        v-else
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    </button>
  </div>
</template>
