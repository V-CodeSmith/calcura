/**
 * Worked examples shown under the keypad in Scientific and Programmer modes.
 *
 * `example` is a complete, valid expression: it is what the engine evaluates to
 * produce the result shown next to it, and what gets inserted when clicked.
 * Keep every entry self-contained so the hint never lies about its own output.
 */
export interface FunctionHint {
  readonly example: string
}

export const SCIENTIFIC_HINTS: readonly FunctionHint[] = [
  { example: 'sin(30)' },
  { example: 'cos(60)' },
  { example: 'tan(45)' },
  { example: 'asin(0.5)' },
  { example: 'acos(0.5)' },
  { example: 'atan(1)' },
  { example: 'ln(e)' },
  { example: 'log(1000)' },
  { example: 'log(8, 2)' },
  { example: 'sqrt(144)' },
  { example: 'exp(0)' },
  { example: 'abs(-7)' },
  { example: '2^10' },
  { example: '6!' },
  { example: '200 + 10%' },
  { example: 'pi' },
]

export const PROGRAMMER_HINTS: readonly FunctionHint[] = [
  { example: 'and(12, 10)' },
  { example: 'or(12, 10)' },
  { example: 'xor(12, 10)' },
  { example: 'not(0)' },
  { example: 'shl(1, 4)' },
  { example: 'shr(16, 4)' },
  { example: 'mod(17, 5)' },
  { example: 'min(4, 9, 2)' },
  { example: 'max(4, 9, 2)' },
  { example: 'round(3.14159, 2)' },
]
