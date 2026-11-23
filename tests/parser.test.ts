import { describe, expect, it } from 'vitest'
import { CalculationError } from '../core/errors'
import { parse } from '../core/parser'
import type { ASTNode, BinaryNode } from '../core/types'

function asBinary(node: ASTNode): BinaryNode {
  if (node.type !== 'Binary') throw new Error(`expected Binary, received ${node.type}`)
  return node
}

describe('parse', () => {
  it('applies multiplication before addition', () => {
    const root = asBinary(parse('1 + 2 * 3'))
    expect(root.operator).toBe('+')
    expect(root.left).toEqual({ type: 'Number', value: 1 })
    expect(asBinary(root.right).operator).toBe('*')
  })

  it('respects nested parentheses', () => {
    const root = asBinary(parse('((2 + 3) * (4 - 1))'))
    expect(root.operator).toBe('*')
    expect(asBinary(root.left).operator).toBe('+')
    expect(asBinary(root.right).operator).toBe('-')
  })

  it('makes power right-associative', () => {
    const root = asBinary(parse('2^3^2'))
    expect(asBinary(root.right).operator).toBe('^')
    expect(asBinary(root.right).left).toEqual({ type: 'Number', value: 3 })
  })

  it('binds unary minus looser than power', () => {
    const root = parse('-2^2')
    expect(root.type).toBe('Unary')
    if (root.type !== 'Unary') return
    expect(root.operator).toBe('-')
    expect(asBinary(root.operand).operator).toBe('^')
  })

  it('parses unary signs after an operator', () => {
    const root = asBinary(parse('3--2'))
    expect(root.operator).toBe('-')
    const right = root.right
    expect(right.type).toBe('Unary')
  })

  it('supports implicit multiplication', () => {
    expect(asBinary(parse('2(3+4)')).operator).toBe('*')
    expect(asBinary(parse('2π')).operator).toBe('*')
    expect(asBinary(parse('3sin(30)')).operator).toBe('*')
  })

  it('wraps postfix factorial and percent', () => {
    const root = asBinary(parse('5! + 10%'))
    expect(root.left).toEqual({
      type: 'Postfix',
      operator: '!',
      operand: { type: 'Number', value: 5 },
    })
    expect(root.right).toEqual({
      type: 'Postfix',
      operator: '%',
      operand: { type: 'Number', value: 10 },
    })
  })

  it('builds call nodes with arguments', () => {
    const node = parse('log(8, 2)')
    expect(node).toEqual({
      type: 'Call',
      name: 'log',
      args: [
        { type: 'Number', value: 8 },
        { type: 'Number', value: 2 },
      ],
    })
  })

  it('rejects malformed input with a typed syntax error', () => {
    const cases = ['1 +', '(1 + 2', '1)', '1 + * 2', 'sin 30', 'sin(1,,2)']
    for (const expression of cases) {
      expect(() => parse(expression), expression).toThrowError(CalculationError)
    }
  })

  it('reports an empty expression distinctly', () => {
    try {
      parse('')
    } catch (error) {
      expect((error as CalculationError).code).toBe('empty-expression')
    }
  })
})
