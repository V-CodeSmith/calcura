import type { ErrorCode } from './types'

/**
 * Internal control-flow error. Tokenizer, parser and evaluator throw this so a
 * single `try/catch` in `evaluate()` can turn any problem into a typed result.
 */
export class CalculationError extends Error {
  readonly code: ErrorCode
  readonly position: number | undefined

  constructor(code: ErrorCode, message: string, position?: number) {
    super(message)
    this.name = 'CalculationError'
    this.code = code
    this.position = position
  }
}

export function isCalculationError(value: unknown): value is CalculationError {
  return value instanceof CalculationError
}
