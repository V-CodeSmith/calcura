<script setup lang="ts">
import { evaluate } from '~/core'
import { useCalculatorStore } from '~/stores/calculator'
import { PROGRAMMER_HINTS, SCIENTIFIC_HINTS } from '~/utils/functionHints'

const calculator = useCalculatorStore()

const open = ref(true)

/**
 * Results come from the engine itself, so a hint can never drift from what the
 * app actually computes. They use the engine's default precision rather than
 * the user's display precision: that keeps the server and client render
 * identical (precision is persisted and only available after hydration).
 */
const rows = computed(() => {
  const hints =
    calculator.mode === 'programmer'
      ? PROGRAMMER_HINTS
      : calculator.mode === 'scientific'
        ? SCIENTIFIC_HINTS
        : []

  return hints.map((hint) => {
    const result = evaluate(hint.example, { angleMode: calculator.angleMode })
    return { example: hint.example, result: result.ok ? result.formatted : '—' }
  })
})

function insert(example: string): void {
  calculator.input(example)
}
</script>

<template>
  <section
    v-if="rows.length > 0"
    class="rounded-2xl border border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-white/[0.03]"
    aria-labelledby="function-hints-title"
  >
    <div class="flex items-center gap-2 px-3 py-2 desk-short:py-1.5">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        :aria-expanded="open"
        aria-controls="function-hints"
        @click="open = !open"
      >
        <h2
          id="function-hints-title"
          class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
        >
          Function examples
        </h2>
        <span
          v-if="calculator.mode === 'scientific'"
          class="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300"
          :title="`Trig results follow the ${calculator.angleMode} setting`"
        >
          {{ calculator.angleMode }}
        </span>
        <span
          v-else
          class="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300"
          title="Bitwise functions operate on signed 32-bit integers"
        >
          32-bit
        </span>
        <span class="ml-auto text-[11px] text-slate-400 dark:text-slate-500">
          {{ open ? 'Click to insert' : `${rows.length} examples` }}
        </span>
      </button>
    </div>

    <div
      v-show="open"
      id="function-hints"
      class="max-h-72 overflow-y-auto overscroll-contain px-2 pb-2 lg:max-h-none lg:overflow-visible desk-short:max-h-none desk-short:overflow-visible"
    >
      <!-- Two columns on tablets, one comfortable column in the desktop sidebar. -->
      <ul
        class="grid gap-y-1 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1 lg:gap-x-0 desk-short:gap-y-0.5"
      >
        <li v-for="row in rows" :key="row.example">
          <button
            type="button"
            class="flex w-full items-baseline gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-white/5 desk-short:py-[3px]"
            :aria-label="`Insert example ${row.example}`"
            :title="`Insert ${row.example}`"
            @click="insert(row.example)"
          >
            <code class="truncate font-mono text-[12px] text-slate-600 dark:text-slate-300">
              {{ row.example }}
            </code>
            <span
              class="shrink-0 font-mono text-[12px] font-semibold text-brand-600 dark:text-brand-300"
            >
              = {{ row.result }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
