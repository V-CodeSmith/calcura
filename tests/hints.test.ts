import { describe, expect, it } from 'vitest'
import { evaluate } from '../core'
import { PROGRAMMER_HINTS, SCIENTIFIC_HINTS } from '../utils/functionHints'

const ALL_HINTS = [...SCIENTIFIC_HINTS, ...PROGRAMMER_HINTS]

describe('function examples', () => {
  it('every example evaluates in both angle modes', () => {
    for (const angleMode of ['DEG', 'RAD'] as const) {
      for (const hint of ALL_HINTS) {
        const result = evaluate(hint.example, { angleMode })
        expect(result.ok, `${hint.example} (${angleMode})`).toBe(true)
      }
    }
  })

  it('covers every function available on the scientific keypad', () => {
    const names = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'sqrt', 'exp', 'abs']
    for (const name of names) {
      expect(
        SCIENTIFIC_HINTS.some((hint) => hint.example.startsWith(`${name}(`)),
        name,
      ).toBe(true)
    }
  })

  it('covers the operator and constant keys', () => {
    const tokens = ['^', '!', '%', 'pi']
    for (const token of tokens) {
      expect(
        SCIENTIFIC_HINTS.some((hint) => hint.example.includes(token)),
        token,
      ).toBe(true)
    }
  })

  it('covers every programmer function', () => {
    const names = ['and', 'or', 'xor', 'not', 'shl', 'shr', 'mod', 'min', 'max', 'round']
    for (const name of names) {
      expect(
        PROGRAMMER_HINTS.some((hint) => hint.example.startsWith(`${name}(`)),
        name,
      ).toBe(true)
    }
  })
})
