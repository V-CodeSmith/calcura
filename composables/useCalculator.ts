import type { KeySpec } from '~/utils/keypad'
import { useCalculatorStore } from '~/stores/calculator'
import { useMemoryStore } from '~/stores/memory'

/**
 * Single entry point for "a key was pressed", shared by pointer, touch and
 * keyboard input so every path behaves identically.
 */
export function useCalculator(): { press: (key: KeySpec) => void } {
  const calculator = useCalculatorStore()
  const memory = useMemoryStore()

  function press(key: KeySpec): void {
    if (key.insert !== undefined) {
      calculator.input(key.insert)
      return
    }

    switch (key.action) {
      case 'clear':
        calculator.clear()
        break
      case 'backspace':
        calculator.backspace()
        break
      case 'equals':
        calculator.equals()
        break
      case 'negate':
        calculator.toggleSign()
        break
      case 'toggle-angle':
        calculator.toggleAngleMode()
        break
      case 'memory-add': {
        const value = calculator.currentValue
        if (value !== null) memory.add(value)
        break
      }
      case 'memory-subtract': {
        const value = calculator.currentValue
        if (value !== null) memory.subtract(value)
        break
      }
      case 'memory-recall':
        calculator.input(String(memory.recall()))
        break
      case 'memory-clear':
        memory.clear()
        break
      case undefined:
        break
    }
  }

  return { press }
}
