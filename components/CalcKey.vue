<script setup lang="ts">
import type { KeySpec, KeyTone } from '~/utils/keypad'

const props = defineProps<{
  keySpec: KeySpec
  /** Overrides the static label (used by the DEG/RAD key). */
  label?: string
  active?: boolean
}>()

const emit = defineEmits<{ press: [key: KeySpec] }>()

const pressed = ref(false)
let pressTimer: ReturnType<typeof setTimeout> | undefined

const TONE_CLASSES: Record<KeyTone, string> = {
  digit:
    'bg-white text-slate-900 hover:bg-slate-50 dark:bg-surface-dark-alt dark:text-slate-50 dark:hover:bg-slate-700/60',
  operator:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:hover:bg-brand-500/25',
  function:
    'bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10',
  action:
    'bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10',
  danger:
    'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25',
  equals:
    'bg-brand-600 text-white hover:bg-brand-500 shadow-md shadow-brand-600/25 dark:bg-brand-500 dark:hover:bg-brand-400',
  memory:
    'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20',
}

const toneClass = computed(() => TONE_CLASSES[props.keySpec.tone])
const text = computed(() => props.label ?? props.keySpec.label)

function handlePress(): void {
  pressed.value = true
  if (pressTimer) clearTimeout(pressTimer)
  pressTimer = setTimeout(() => {
    pressed.value = false
  }, 150)
  emit('press', props.keySpec)
}

onBeforeUnmount(() => {
  if (pressTimer) clearTimeout(pressTimer)
})
</script>

<template>
  <button
    type="button"
    :aria-label="keySpec.ariaLabel"
    :aria-pressed="keySpec.action === 'toggle-angle' ? active : undefined"
    :title="keySpec.hint ? `${keySpec.ariaLabel} (${keySpec.hint})` : keySpec.ariaLabel"
    :class="[
      'flex h-12 items-center justify-center rounded-xl border border-slate-200/80 text-base font-medium shadow-key transition-colors duration-100 lg:h-11 desk-short:h-9',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-light',
      'dark:border-white/10 dark:focus-visible:ring-offset-[#0b1020]',
      'active:translate-y-px',
      toneClass,
      pressed ? 'animate-key-pop' : '',
      keySpec.tone === 'equals' ? 'text-lg font-semibold' : '',
    ]"
    @click="handlePress"
  >
    {{ text }}
  </button>
</template>
