import { useCalculatorStore } from '~/stores/calculator'

const INSERT_KEYS: Readonly<Record<string, string>> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '.': '.',
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '^': '^',
  '(': '(',
  ')': ')',
  '%': '%',
  '!': '!',
  ',': ',',
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * Global keyboard support: digits, operators, Enter (=), Escape (clear) and
 * Backspace. Typing inside the history search box is left alone.
 */
export function useCalculatorKeyboard(): void {
  const calculator = useCalculatorStore()

  function onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (isEditableTarget(event.target)) return

    switch (event.key) {
      case 'Enter':
      case '=':
        event.preventDefault()
        calculator.equals()
        return
      case 'Escape':
        event.preventDefault()
        calculator.clear()
        return
      case 'Backspace':
        event.preventDefault()
        calculator.backspace()
        return
      case 'Delete':
        event.preventDefault()
        calculator.clear()
        return
    }

    const insert = INSERT_KEYS[event.key]
    if (insert !== undefined) {
      event.preventDefault()
      calculator.input(insert)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
