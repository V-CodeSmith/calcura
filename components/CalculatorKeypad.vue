<script setup lang="ts">
import { useCalculator } from '~/composables/useCalculator'
import { useCalculatorStore } from '~/stores/calculator'
import { programmerKeys, scientificKeys, standardKeys, type KeySpec } from '~/utils/keypad'

const calculator = useCalculatorStore()
const { press } = useCalculator()

const extraKeys = computed<readonly KeySpec[]>(() => {
  switch (calculator.mode) {
    case 'scientific':
      return scientificKeys
    case 'programmer':
      return programmerKeys
    default:
      return []
  }
})

function labelFor(key: KeySpec): string {
  // The angle key shows the *current* unit so the state is obvious.
  if (key.action === 'toggle-angle') return calculator.angleMode
  return key.label
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="extraKeys.length"
      class="grid grid-cols-5 gap-2 desk-short:gap-1.5"
      role="group"
      aria-label="Functions"
    >
      <CalcKey
        v-for="key in extraKeys"
        :key="key.id"
        :key-spec="key"
        :label="labelFor(key)"
        :active="key.action === 'toggle-angle'"
        @press="press"
      />
    </div>

    <div class="grid grid-cols-5 gap-2 desk-short:gap-1.5" role="group" aria-label="Keypad">
      <CalcKey
        v-for="key in standardKeys"
        :key="key.id"
        :key-spec="key"
        :label="labelFor(key)"
        :style="{ gridColumn: key.span === 2 ? 'span 2' : undefined }"
        @press="press"
      />
    </div>
  </div>
</template>
