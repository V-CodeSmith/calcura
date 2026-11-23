<script setup lang="ts">
import { useCalculatorKeyboard } from '~/composables/useCalculatorKeyboard'
import { useCalculatorStore } from '~/stores/calculator'
import { useHistoryStore } from '~/stores/history'
import { useSettingsStore } from '~/stores/settings'
import type { CalculatorMode } from '~/utils/keypad'

const calculator = useCalculatorStore()
const history = useHistoryStore()
const settings = useSettingsStore()
const historyOpen = ref(false)

useCalculatorKeyboard()

const MODES: readonly { id: CalculatorMode; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'scientific', label: 'Scientific' },
  { id: 'programmer', label: 'Programmer' },
]

useHead({
  title: 'Calcura — Advanced Calculator',
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header
      class="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur transition-colors dark:border-white/10 dark:bg-[#0b1020]/80"
    >
      <div class="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-3 lg:max-w-4xl">
        <div class="flex items-center gap-2">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-md shadow-brand-600/25"
            aria-hidden="true"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="4" y="3" width="16" height="18" rx="2.5" />
              <path d="M8 7h8" stroke-linecap="round" />
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <div class="leading-tight">
            <p class="text-base font-semibold tracking-tight">Calcura</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Advanced calculator</p>
          </div>
        </div>

        <div class="ml-auto flex items-center gap-1.5">
          <ThemeSwitch />

          <button
            type="button"
            class="relative flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            :aria-label="`Open history, ${history.entries.length} saved calculations`"
            aria-haspopup="dialog"
            :aria-expanded="historyOpen"
            @click="historyOpen = true"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
              <path d="M12 8v4l3 2" />
            </svg>
            <span class="hidden sm:inline">History</span>
            <ClientOnly>
              <span
                v-if="history.entries.length > 0"
                class="rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white"
              >
                {{ history.entries.length }}
              </span>
            </ClientOnly>
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-xl flex-1 px-4 pb-6 pt-4 lg:max-w-4xl">
      <!-- Desktop: the reference column sits left of the calculator so the
           examples are visible without scrolling. Mobile stacks it below. -->
      <div class="lg:grid lg:grid-cols-[340px_420px] lg:items-start lg:justify-center lg:gap-8">
        <div class="min-w-0">
          <div
            class="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-white/5"
            role="tablist"
            aria-label="Calculator mode"
          >
            <button
              v-for="mode in MODES"
              :key="mode.id"
              type="button"
              role="tab"
              :aria-selected="calculator.mode === mode.id"
              class="rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:text-sm"
              :class="
                calculator.mode === mode.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              "
              @click="calculator.setMode(mode.id)"
            >
              {{ mode.label }}
            </button>
          </div>

          <div
            class="rounded-3xl border border-slate-200/70 bg-white/70 p-3 shadow-card backdrop-blur transition-colors dark:border-white/10 dark:bg-white/[0.03]"
          >
            <CalculatorDisplay />
            <MemoryBar class="mt-3" />
            <CalculatorKeypad class="mt-3" />
          </div>
        </div>

        <aside class="mt-4 min-w-0 lg:order-first lg:mt-0">
          <FunctionHints />

          <div
            class="mt-4 rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <p
              class="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
            >
              Precision
            </p>
            <div class="mt-2 flex items-center gap-3">
              <input
                id="precision"
                type="range"
                :value="settings.precision"
                min="4"
                max="15"
                step="1"
                class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-white/10"
                aria-label="Display precision in significant digits"
                @input="settings.setPrecision(Number(($event.target as HTMLInputElement).value))"
              />
              <span class="w-8 text-right font-mono text-sm text-slate-600 dark:text-slate-300">
                {{ settings.precision }}
              </span>
            </div>
          </div>
          <p
            class="mt-4 text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 lg:text-left"
          >
            Keyboard: digits and <span class="font-mono">+ − * / ^</span> · <kbd>Enter</kbd> equals
            · <kbd>Esc</kbd> clear · <kbd>Backspace</kbd> delete
          </p>
        </aside>
      </div>
    </main>

    <footer
      class="border-t border-slate-200/70 py-3 text-center text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400"
    >
      Calcura · client-side only · works offline once installed
    </footer>

    <HistoryPanel :open="historyOpen" @close="historyOpen = false" />
  </div>
</template>
