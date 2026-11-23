import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { evaluate, type AngleMode, type EvaluationResult } from '~/core'
import type { CalculatorMode, NumberBase } from '~/utils/keypad'
import { useHistoryStore } from './history'
import { useMemoryStore } from './memory'
import { useSettingsStore } from './settings'

const TRAILING_FUNCTION = /[a-z]+\($/i
const OPERATOR_START = /^[+\-*/^%!]/

export const useCalculatorStore = defineStore('calculator', () => {
  const history = useHistoryStore()
  const memory = useMemoryStore()
  const settings = useSettingsStore()

  const expression = ref('')
  const mode = ref<CalculatorMode>('scientific')
  const angleMode = ref<AngleMode>('DEG')
  const base = ref<NumberBase>('DEC')

  /** Set after `=`; `null` while the user is still typing. */
  const committedText = ref<string | null>(null)
  const committedValue = ref<number | null>(null)
  /** Ans — the last evaluated answer. */
  const lastResult = ref(0)

  const variables = computed<Record<string, number>>(() => ({
    ans: lastResult.value,
    m: memory.value,
  }))

  const preview = computed<EvaluationResult | null>(() => {
    if (committedText.value !== null) return null
    if (expression.value.trim() === '') return null
    return evaluate(expression.value, {
      angleMode: angleMode.value,
      variables: variables.value,
      precision: settings.precision,
    })
  })

  const errorMessage = computed(() => {
    if (preview.value && !preview.value.ok) return preview.value.error.message
    return ''
  })

  /** The number the display represents, for memory and base conversion. */
  const currentValue = computed<number | null>(() => {
    if (committedValue.value !== null) return committedValue.value
    if (preview.value?.ok) return preview.value.value
    return null
  })

  const resultText = computed(() => {
    if (committedText.value !== null) return committedText.value
    if (preview.value?.ok) return preview.value.formatted
    return ''
  })

  const canEvaluate = computed(() => preview.value?.ok === true)

  /**
   * Appends input, starting a fresh expression when the user types a new value
   * right after an answer, or continuing from that answer when they type an
   * operator (so `= 5` then `+ 2` keeps working).
   */
  function input(value: string): void {
    if (committedText.value !== null) {
      const continues = OPERATOR_START.test(value)
      expression.value = continues ? committedText.value : ''
      committedText.value = null
      committedValue.value = null
    }

    // A second decimal point in the same number would be a syntax error; the
    // tokenizer accepts `1.2.3` as two numbers, which is never what was meant.
    if (value === '.' && /\d*\.\d*$/.test(expression.value)) return

    expression.value += value
  }

  function equals(): void {
    if (expression.value.trim() === '') return

    const result = evaluate(expression.value, {
      angleMode: angleMode.value,
      variables: variables.value,
      precision: settings.precision,
    })
    if (!result.ok) return // error stays visible in the display

    committedText.value = result.formatted
    committedValue.value = result.value
    lastResult.value = result.value
    history.add(expression.value, result.formatted)
  }

  function clear(): void {
    expression.value = ''
    committedText.value = null
    committedValue.value = null
  }

  function backspace(): void {
    if (committedText.value !== null) {
      committedText.value = null
      committedValue.value = null
      return
    }
    const match = TRAILING_FUNCTION.exec(expression.value)
    if (match) {
      expression.value = expression.value.slice(0, -match[0].length)
      return
    }
    expression.value = expression.value.slice(0, -1)
  }

  function toggleSign(): void {
    if (committedText.value !== null) {
      expression.value = `-${committedText.value}`
      committedText.value = null
      committedValue.value = null
      return
    }
    if (expression.value === '') {
      expression.value = '-'
      return
    }
    if (/^-\(.+\)$/.test(expression.value)) {
      expression.value = expression.value.slice(2, -1)
      return
    }
    if (expression.value.startsWith('-')) {
      expression.value = expression.value.slice(1)
      return
    }
    expression.value = `-(${expression.value})`
  }

  /** Used by the history drawer to bring an old expression back. */
  function setExpression(value: string): void {
    expression.value = value
    committedText.value = null
    committedValue.value = null
  }

  /** Prepends the previous answer programmatically (used by "and then"). */
  function useAnswer(): void {
    input('ans')
  }

  function setMode(value: CalculatorMode): void {
    mode.value = value
  }

  function setAngleMode(value: AngleMode): void {
    angleMode.value = value
  }

  function toggleAngleMode(): void {
    angleMode.value = angleMode.value === 'DEG' ? 'RAD' : 'DEG'
  }

  function setBase(value: NumberBase): void {
    base.value = value
  }

  return {
    expression,
    mode,
    angleMode,
    base,
    committedText,
    committedValue,
    lastResult,
    variables,
    preview,
    errorMessage,
    currentValue,
    resultText,
    canEvaluate,
    input,
    equals,
    clear,
    backspace,
    toggleSign,
    setExpression,
    useAnswer,
    setMode,
    setAngleMode,
    toggleAngleMode,
    setBase,
  }
})
