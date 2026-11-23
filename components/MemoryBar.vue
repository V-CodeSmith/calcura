<script setup lang="ts">
import { useCalculator } from '~/composables/useCalculator'
import { useMemoryStore } from '~/stores/memory'
import { memoryKeys } from '~/utils/keypad'

const memory = useMemoryStore()
const { press } = useCalculator()
</script>

<template>
  <div class="flex items-center gap-2" aria-label="Memory controls" role="group">
    <span
      class="w-10 shrink-0 text-center text-[10px] font-semibold uppercase tracking-widest"
      :class="
        memory.hasValue
          ? 'text-amber-600 dark:text-amber-300'
          : 'text-slate-400 dark:text-slate-500'
      "
    >
      {{ memory.hasValue ? 'M' : 'Mem' }}
    </span>

    <div class="grid flex-1 grid-cols-4 gap-2">
      <button
        v-for="key in memoryKeys"
        :key="key.id"
        type="button"
        :aria-label="key.ariaLabel"
        :disabled="key.action === 'memory-clear' && !memory.hasValue"
        class="h-9 rounded-lg border border-slate-200/80 bg-white text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        @click="press(key)"
      >
        {{ key.label }}
      </button>
    </div>
  </div>
</template>
