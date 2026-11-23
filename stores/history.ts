import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createId } from '~/utils/id'

export interface HistoryEntry {
  readonly id: string
  readonly expression: string
  readonly result: string
  readonly timestamp: number
}

const MAX_ENTRIES = 100

export const useHistoryStore = defineStore(
  'history',
  () => {
    const entries = ref<HistoryEntry[]>([])
    const searchQuery = ref('')

    const filteredEntries = computed<HistoryEntry[]>(() => {
      const query = searchQuery.value.trim().toLowerCase()
      if (!query) return entries.value
      return entries.value.filter(
        (entry) =>
          entry.expression.toLowerCase().includes(query) ||
          entry.result.toLowerCase().includes(query),
      )
    })

    function add(expression: string, result: string): void {
      const previous = entries.value[0]
      if (previous && previous.expression === expression && previous.result === result) {
        return
      }
      entries.value = [
        { id: createId(), expression, result, timestamp: Date.now() },
        ...entries.value,
      ].slice(0, MAX_ENTRIES)
    }

    function remove(id: string): void {
      entries.value = entries.value.filter((entry) => entry.id !== id)
    }

    function clear(): void {
      entries.value = []
      searchQuery.value = ''
    }

    return { entries, searchQuery, filteredEntries, add, remove, clear }
  },
  {
    persist: {
      key: 'calcura:history',
      pick: ['entries'],
    },
  },
)
