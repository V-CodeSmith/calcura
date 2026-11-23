import type { NumberBase } from './keypad'

/**
 * Cosmetic rendering of an expression for humans. The stored expression always
 * keeps ASCII operators so the engine can parse it.
 */
export function prettyExpression(expression: string): string {
  return expression
    .replace(/sqrt\(/g, '√(')
    .replace(/\bpi\b/g, 'π')
    .replace(/ans/gi, 'Ans')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−')
}

/** Integer rendering of a value in the selected programmer-mode base. */
export function toBaseString(value: number, base: NumberBase): string {
  if (!Number.isFinite(value)) return '—'

  const integer = Math.trunc(value)
  switch (base) {
    case 'DEC':
      return integer.toString(10)
    case 'HEX':
      return integer.toString(16).toUpperCase()
    case 'OCT':
      return integer.toString(8)
    case 'BIN':
      return integer.toString(2)
  }
}
