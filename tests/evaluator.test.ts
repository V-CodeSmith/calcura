import { describe, expect, it } from 'vitest'
import { evaluate, type EvaluateOptions, type ErrorCode } from '../core'

function value(expression: string, options?: EvaluateOptions): number {
  const result = evaluate(expression, options)
  if (!result.ok) {
    throw new Error(
      `expected "${expression}" to evaluate, got ${result.error.code}: ${result.error.message}`,
    )
  }
  return result.value
}

function text(expression: string, options?: EvaluateOptions): string {
  const result = evaluate(expression, options)
  if (!result.ok) {
    throw new Error(`expected "${expression}" to evaluate, got ${result.error.code}`)
  }
  return result.formatted
}

function code(expression: string, options?: EvaluateOptions): ErrorCode {
  const result = evaluate(expression, options)
  if (result.ok) {
    throw new Error(`expected "${expression}" to fail, got ${result.value}`)
  }
  return result.error.code
}

describe('arithmetic and precedence', () => {
  it('computes basic operations', () => {
    expect(value('2 + 2')).toBe(4)
    expect(value('9 - 14')).toBe(-5)
    expect(value('6 * 7')).toBe(42)
    expect(value('7 / 2')).toBe(3.5)
  })

  it('applies precedence', () => {
    expect(value('2 + 3 * 4')).toBe(14)
    expect(value('(2 + 3) * 4')).toBe(20)
    expect(value('2 + 3 * 4 ^ 2')).toBe(50)
  })

  it('keeps left associativity for + and *', () => {
    expect(value('10 - 2 - 3')).toBe(5)
    expect(value('100 / 5 / 2')).toBe(10)
  })

  it('handles deeply nested parentheses', () => {
    expect(value('(((1 + 2) * (3 + 4)) - 5) / 2')).toBe(8)
  })

  it('hides binary floating point noise in the formatted output', () => {
    expect(text('0.1 + 0.2')).toBe('0.3')
    expect(text('1 / 3')).toBe('0.333333333333')
  })

  it('supports implicit multiplication', () => {
    expect(value('2(3 + 4)')).toBe(14)
    expect(value('3pi')).toBeCloseTo(9.42477796076938, 10)
  })
})

describe('unary operators', () => {
  it('applies plus and minus', () => {
    expect(value('-5 + 3')).toBe(-2)
    expect(value('3 - -2')).toBe(5)
    expect(value('-(2 + 3)')).toBe(-5)
    expect(value('+7')).toBe(7)
  })

  it('binds unary minus looser than power', () => {
    expect(value('-2^2')).toBe(-4)
    expect(value('(-2)^2')).toBe(4)
  })

  it('accepts a negative exponent', () => {
    expect(value('2^-2')).toBe(0.25)
  })
})

describe('power, factorial and percentage', () => {
  it('computes powers right-associatively', () => {
    expect(value('2^10')).toBe(1024)
    expect(value('2^3^2')).toBe(512)
  })

  it('computes factorials', () => {
    expect(value('5!')).toBe(120)
    expect(value('0!')).toBe(1)
    expect(value('3! + 4!')).toBe(30)
  })

  it('treats percent as a fraction and as a share of the left operand', () => {
    expect(value('50%')).toBe(0.5)
    expect(value('200 + 10%')).toBe(220)
    expect(value('200 - 10%')).toBe(180)
    expect(value('200 * 10%')).toBe(20)
  })
})

describe('scientific functions', () => {
  it('works in degrees', () => {
    expect(text('sin(30)', { angleMode: 'DEG' })).toBe('0.5')
    expect(text('cos(60)', { angleMode: 'DEG' })).toBe('0.5')
    expect(text('tan(45)', { angleMode: 'DEG' })).toBe('1')
    expect(text('asin(0.5)', { angleMode: 'DEG' })).toBe('30')
    expect(text('acos(0.5)', { angleMode: 'DEG' })).toBe('60')
    expect(text('atan(1)', { angleMode: 'DEG' })).toBe('45')
  })

  it('works in radians', () => {
    expect(text('sin(pi / 2)', { angleMode: 'RAD' })).toBe('1')
    expect(text('cos(0)', { angleMode: 'RAD' })).toBe('1')
    expect(value('asin(1)', { angleMode: 'RAD' })).toBeCloseTo(Math.PI / 2, 12)
    expect(value('atan(1)', { angleMode: 'RAD' })).toBeCloseTo(Math.PI / 4, 12)
  })

  it('supports logs, roots, absolute value and exponentials', () => {
    // Floating point logs land a hair off the integer; the display rounds it.
    expect(value('log(1000)')).toBeCloseTo(3, 10)
    expect(text('log(1000)')).toBe('3')
    expect(value('log(8, 2)')).toBeCloseTo(3, 10)
    expect(value('ln(e)')).toBe(1)
    expect(value('sqrt(144)')).toBe(12)
    expect(value('abs(-7.5)')).toBe(7.5)
    expect(value('exp(0)')).toBe(1)
  })

  it('uses the constant pi and e', () => {
    expect(value('pi')).toBeCloseTo(Math.PI, 12)
    expect(value('e')).toBeCloseTo(Math.E, 12)
  })

  it('evaluates bitwise helpers', () => {
    expect(value('and(12, 10)')).toBe(8)
    expect(value('or(12, 10)')).toBe(14)
    expect(value('xor(12, 10)')).toBe(6)
    expect(value('not(0)')).toBe(-1)
    expect(value('shl(1, 4)')).toBe(16)
    expect(value('shr(16, 4)')).toBe(1)
  })
})

describe('error handling', () => {
  it('rejects division by zero', () => {
    expect(code('1 / 0')).toBe('division-by-zero')
    expect(code('0 / 0')).toBe('division-by-zero')
    expect(code('mod(4, 0)')).toBe('division-by-zero')
  })

  it('rejects invalid domains', () => {
    expect(code('sqrt(-1)')).toBe('domain-error')
    expect(code('ln(0)')).toBe('domain-error')
    expect(code('log(-5)')).toBe('domain-error')
    expect(code('asin(2)')).toBe('domain-error')
    expect(code('acos(-1.5)')).toBe('domain-error')
    expect(code('tan(90)', { angleMode: 'DEG' })).toBe('domain-error')
    expect(code('(-8)^0.5')).toBe('domain-error')
    expect(code('and(1.5, 2)')).toBe('domain-error')
  })

  it('rejects factorials of non-integers and negatives', () => {
    expect(code('3.5!')).toBe('factorial-domain')
    expect(code('(-3)!')).toBe('factorial-domain')
  })

  it('reports overflow instead of Infinity', () => {
    expect(code('10^400')).toBe('overflow')
    expect(code('171!')).toBe('overflow')
  })

  it('reports malformed expressions as syntax errors', () => {
    expect(code('1 +')).toBe('syntax')
    expect(code('(1 + 2')).toBe('syntax')
    expect(code('1 + * 2')).toBe('syntax')
    expect(code('2 + #')).toBe('unexpected-character')
  })

  it('rejects empty input with a dedicated code', () => {
    expect(code('   ')).toBe('empty-expression')
  })

  it('checks function arity', () => {
    expect(code('sin()')).toBe('argument-count')
    expect(code('sin(1, 2)')).toBe('argument-count')
  })

  it('never throws, even for hostile input', () => {
    const inputs = ['', '   ', '((((', ')))', '1..2', 'sin(', '***', 'πππ', '1e999', 'max()']
    for (const input of inputs) {
      expect(() => evaluate(input)).not.toThrow()
    }
  })
})

describe('variables', () => {
  it('substitutes Ans', () => {
    expect(value('ans + 1', { variables: { ans: 41 } })).toBe(42)
  })

  it('substitutes memory and user variables', () => {
    expect(value('m + x * y', { variables: { m: 1, x: 3, y: 4 } })).toBe(13)
  })

  it('is case-insensitive', () => {
    expect(value('ANS + M', { variables: { ans: 2, m: 5 } })).toBe(7)
  })

  it('reports unknown symbols', () => {
    expect(code('z + 1')).toBe('unknown-symbol')
  })
})

describe('formatting and options', () => {
  it('honours the precision option', () => {
    expect(text('1 / 3', { precision: 4 })).toBe('0.3333')
    expect(text('2 / 3', { precision: 6 })).toBe('0.666667')
  })

  it('uses exponential notation for extreme magnitudes', () => {
    expect(text('10^20')).toMatch(/e\+20$/)
    expect(text('10^-12')).toMatch(/e-12$/)
  })
})
