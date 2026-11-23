import { describe, expect, it } from 'vitest'
import { evaluate, functionNames, getFunction, isFunctionName, registerFunction } from '../core'

describe('function registry', () => {
  it('exposes every documented function', () => {
    for (const name of [
      'sin',
      'cos',
      'tan',
      'asin',
      'acos',
      'atan',
      'log',
      'ln',
      'sqrt',
      'abs',
      'exp',
    ]) {
      expect(isFunctionName(name), name).toBe(true)
    }
  })

  it('is case-insensitive when looked up', () => {
    expect(getFunction('SQRT')?.name).toBe('sqrt')
    expect(isFunctionName('LoG')).toBe(true)
  })

  it('returns undefined for unknown names', () => {
    expect(getFunction('nope')).toBeUndefined()
  })

  it('sorts names longest first for prefix matching', () => {
    const lengths = functionNames.map((name) => name.length)
    expect(lengths).toEqual([...lengths].sort((a, b) => b - a))
  })

  it('rounds, floors and ceils', () => {
    const rounded = evaluate('round(3.14159, 2)')
    const floored = evaluate('floor(2.9)')
    const ceiled = evaluate('ceil(2.1)')
    expect(rounded.ok && rounded.value).toBe(3.14)
    expect(floored.ok && floored.value).toBe(2)
    expect(ceiled.ok && ceiled.value).toBe(3)
  })

  it('min and max accept many arguments', () => {
    const min = evaluate('min(4, 2, 9, 1)')
    const max = evaluate('max(4, 2, 9, 1)')
    expect(min.ok && min.value).toBe(1)
    expect(max.ok && max.value).toBe(9)
  })
})

describe('extensibility', () => {
  it('registers and unregisters a custom function', () => {
    const dispose = registerFunction({
      name: 'double',
      minArgs: 1,
      maxArgs: 1,
      description: 'Doubles a value',
      evaluate: (args) => (args[0] ?? 0) * 2,
    })

    const result = evaluate('double(21)')
    expect(result.ok && result.value).toBe(42)

    dispose()
    expect(isFunctionName('double')).toBe(false)
    expect(evaluate('double(21)').ok).toBe(false)
  })

  it('refuses to silently overwrite a built-in', () => {
    expect(() =>
      registerFunction({
        name: 'sqrt',
        minArgs: 1,
        maxArgs: 1,
        description: 'duplicate',
        evaluate: () => 0,
      }),
    ).toThrow()
  })
})
