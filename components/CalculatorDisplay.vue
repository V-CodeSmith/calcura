<script setup lang="ts">
import { formatResult } from '~/core'
import { useCalculatorStore } from '~/stores/calculator'
import { useMemoryStore } from '~/stores/memory'
import { useSettingsStore } from '~/stores/settings'
import { prettyExpression, toBaseString } from '~/utils/format'
import type { NumberBase } from '~/utils/keypad'

const calculator = useCalculatorStore()
const memory = useMemoryStore()
const settings = useSettingsStore()

const BASES: readonly NumberBase[] = ['DEC', 'HEX', 'OCT', 'BIN']

const MODE_LABELS = {
  standard: 'Standard',
  scientific: 'Scientific',
  programmer: 'Programmer',
} as const

const modeLabel = computed(() => MODE_LABELS[calculator.mode])

/** Big line: the committed answer, or the expression being typed. */
const primaryText = computed(() => {
  if (calculator.committedText !== null) return calculator.committedText
  return prettyExpression(calculator.expression) || '0'
})

/** Line above the answer: the expression that produced it. */
const sourceText = computed(() => {
  if (calculator.committedText === null) return ''
  return prettyExpression(calculator.expression)
})

const previewText = computed(() => {
  if (calculator.committedText !== null) return ''
  if (calculator.preview?.ok) return `= ${calculator.preview.formatted}`
  return ''
})

/** Remembered answer, useful once the expression is cleared to type again. */
const answerBadge = computed(() => {
  if (calculator.committedText !== null) return ''
  if (calculator.lastResult === 0) return ''
  return `Ans ${formatResult(calculator.lastResult, settings.precision)}`
})

/**
 * Programmer mode always shows the base readout, starting from 0, so the mode
 * looks different from the others before the first calculation.
 */
const baseReadouts = computed(() => {
  if (calculator.mode !== 'programmer') return null
  const value = calculator.currentValue ?? 0
  return BASES.map((base) => ({ base, text: toBaseString(value, base) }))
})
</script>

<template>
  <section
    class="rounded-2xl bg-slate-950 px-4 py-3 text-slate-100 ring-1 ring-white/10"
    aria-label="Calculator display"
  >
    <div
      class="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
    >
      <span class="rounded bg-white/10 px-1.5 py-0.5 text-slate-200">{{
        calculator.angleMode
      }}</span>
      <span class="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">{{ modeLabel }}</span>
      <ClientOnly>
        <span
          v-if="memory.hasValue"
          class="rounded bg-amber-400/20 px-1.5 py-0.5 text-amber-200"
          :title="`Memory holds ${memory.value}`"
        >
          M
        </span>
      </ClientOnly>
      <span v-if="answerBadge && !sourceText" class="ml-auto text-slate-500">{{
        answerBadge
      }}</span>
    </div>

    <!-- No reserved height here: an idle display should not look empty. -->
    <p v-if="sourceText" class="mt-2 truncate text-right font-mono text-sm text-slate-400">
      {{ sourceText }}
    </p>

    <p
      class="tabular no-scrollbar mt-2 max-h-28 overflow-y-auto break-all text-right font-mono font-semibold leading-tight"
      :class="primaryText.length > 18 ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="display-value"
    >
      {{ primaryText }}
    </p>

    <p class="mt-1 min-h-5 text-right font-mono text-sm text-emerald-300">
      <span v-if="previewText">{{ previewText }}</span>
      <span v-else aria-hidden="true">&nbsp;</span>
    </p>

    <p v-if="calculator.errorMessage" class="mt-1 text-right text-sm text-rose-300" role="alert">
      {{ calculator.errorMessage }}
    </p>

    <div v-if="baseReadouts" class="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
      <button
        v-for="item in baseReadouts"
        :key="item.base"
        type="button"
        class="flex items-baseline justify-between gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors"
        :class="
          calculator.base === item.base
            ? 'border-brand-400/60 bg-brand-500/15 text-brand-100'
            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
        "
        :aria-pressed="calculator.base === item.base"
        :aria-label="`${item.base}: ${item.text}`"
        @click="calculator.setBase(item.base)"
      >
        <span class="text-[10px] uppercase tracking-wider">{{ item.base }}</span>
        <span class="min-w-0 truncate">{{ item.text }}</span>
      </button>
    </div>
  </section>
</template>
