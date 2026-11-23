import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useMemoryStore = defineStore(
  'memory',
  () => {
    const value = ref(0)

    const hasValue = computed(() => value.value !== 0)

    function add(amount: number): void {
      value.value += amount
    }

    function subtract(amount: number): void {
      value.value -= amount
    }

    function recall(): number {
      return value.value
    }

    function clear(): void {
      value.value = 0
    }

    return { value, hasValue, add, subtract, recall, clear }
  },
  {
    persist: {
      key: 'calcura:memory',
      pick: ['value'],
    },
  },
)
