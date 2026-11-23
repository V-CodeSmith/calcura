<script setup lang="ts">
import { useCalculatorStore } from '~/stores/calculator'
import { useHistoryStore } from '~/stores/history'
import { prettyExpression } from '~/utils/format'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const history = useHistoryStore()
const calculator = useCalculatorStore()

function reuse(expression: string): void {
  calculator.setExpression(expression)
  emit('close')
}

function timeLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}
</script>

<template>
  <div>
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>

    <Transition name="slide">
      <aside
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-surface-dark"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10"
        >
          <h2 id="history-title" class="text-base font-semibold">History</h2>
          <div class="flex items-center gap-2">
            <button
              v-if="history.entries.length > 0"
              type="button"
              class="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:text-rose-300 dark:hover:bg-rose-500/10"
              @click="history.clear()"
            >
              Clear all
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-400 dark:hover:bg-white/10"
              aria-label="Close history"
              @click="emit('close')"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div class="border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <label for="history-search" class="sr-only">Search history</label>
          <input
            id="history-search"
            v-model="history.searchQuery"
            type="search"
            autocomplete="off"
            placeholder="Search expressions or results"
            class="w-full rounded-lg border border-slate-200 bg-surface-light px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          />
        </div>

        <div class="flex-1 overflow-y-auto px-2 py-2">
          <ul v-if="history.filteredEntries.length > 0" class="space-y-1">
            <li v-for="entry in history.filteredEntries" :key="entry.id">
              <div
                class="group flex items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <button
                  type="button"
                  class="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  :aria-label="`Reuse expression ${entry.expression}`"
                  @click="reuse(entry.expression)"
                >
                  <span class="block truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                    {{ prettyExpression(entry.expression) }}
                  </span>
                  <span class="block truncate font-mono text-lg font-semibold">
                    = {{ entry.result }}
                  </span>
                  <span class="block text-[11px] text-slate-400 dark:text-slate-500">
                    {{ timeLabel(entry.timestamp) }}
                  </span>
                </button>
                <button
                  type="button"
                  class="mt-1 rounded px-1.5 py-0.5 text-xs text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-white/10 dark:hover:text-slate-200 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
                  :aria-label="`Remove ${entry.expression} from history`"
                  @click="history.remove(entry.id)"
                >
                  Remove
                </button>
              </div>
            </li>
          </ul>

          <p v-else class="px-3 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {{
              history.searchQuery ? 'No calculations match your search.' : 'No calculations yet.'
            }}
          </p>
        </div>

        <p
          class="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400"
        >
          Select an entry to load the expression again.
        </p>
      </aside>
    </Transition>
  </div>
</template>
