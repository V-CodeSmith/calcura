import { describe, expect, it } from 'vitest'
import { CalculationError } from '../core/errors'
import { tokenize } from '../core/tokenizer'

describe('tokenize', () => {
  it('splits a simple expression into typed tokens with positions', () => {
    expect(tokenize('1 + 2')).toEqual([
      { type: 'NUMBER', value: 1, position: 0 },
      { type: 'OPERATOR', value: '+', position: 2 },
      { type: 'NUMBER', value: 2, position: 4 },
    ])
  })

  it('reads decimals and scientific notation as one number', () => {
    const [token] = tokenize('12.5e-3')
    expect(token).toEqual({ type: 'NUMBER', value: 0.0125, position: 0 })
  })

  it('reads a leading-dot decimal', () => {
    expect(tokenize('.5')[0]).toEqual({ type: 'NUMBER', value: 0.5, position: 0 })
  })

  it('classifies functions, constants and variables', () => {
    const types = tokenize('sin(pi) + ans * x').map((token) => token.type)
    expect(types).toEqual([
      'FUNCTION',
      'LPAREN',
      'CONSTANT',
      'RPAREN',
      'OPERATOR',
      'VARIABLE',
      'OPERATOR',
      'VARIABLE',
    ])
  })

  it('understands the pi symbol and the e constant', () => {
    expect(tokenize('2π')[1]).toEqual({ type: 'CONSTANT', value: 'pi', position: 1 })
    expect(tokenize('e')[0]).toEqual({ type: 'CONSTANT', value: 'e', position: 0 })
  })

  it('does not confuse exp with the constant e', () => {
    expect(tokenize('exp(1)')[0]).toEqual({ type: 'FUNCTION', value: 'exp', position: 0 })
  })

  it('lowercases identifiers so SIN works', () => {
    expect(tokenize('SIN(30)')[0]).toEqual({ type: 'FUNCTION', value: 'sin', position: 0 })
  })

  it('normalises unicode operators', () => {
    const values = tokenize('6×7÷2−1').map((token) =>
      token.type === 'OPERATOR' ? token.value : token.type,
    )
    expect(values).toEqual(['NUMBER', '*', 'NUMBER', '/', 'NUMBER', '-', 'NUMBER'])
  })

  it('treats ** as power', () => {
    expect(tokenize('2**3')[1]).toEqual({ type: 'OPERATOR', value: '^', position: 1 })
  })

  it('emits postfix operators and commas', () => {
    expect(tokenize('5!').map((token) => token.type)).toEqual(['NUMBER', 'OPERATOR'])
    expect(tokenize('max(1,2)').some((token) => token.type === 'COMMA')).toBe(true)
  })

  it('rejects unknown characters with a positioned error', () => {
    expect(() => tokenize('2 + #')).toThrowError(CalculationError)
    try {
      tokenize('2 + #')
    } catch (error) {
      expect(error).toBeInstanceOf(CalculationError)
      expect((error as CalculationError).code).toBe('unexpected-character')
      expect((error as CalculationError).position).toBe(4)
    }
  })

  it('ignores whitespace', () => {
    expect(tokenize('  1  \t +\n2 ')).toHaveLength(3)
  })
})
