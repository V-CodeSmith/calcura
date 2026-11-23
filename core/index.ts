/**
 * Calcura math engine — public API.
 *
 * ```ts
 * const result = evaluate('sin(30) + 2^3', { angleMode: 'DEG' })
 * if (result.ok) console.log(result.formatted)
 * else console.error(result.error.message)
 * ```
 *
 * The engine never throws at this boundary: every problem is a typed failure.
 */

import { isCalculationError } from './errors'
import { createEvaluationContext, evaluateNode } from './evaluator'
import { parse, parseTokens } from './parser'
import { tokenize } from './tokenizer'
import type {
  AngleMode,
  ASTNode,
  CalcError,
  EvaluateOptions,
  EvaluationResult,
  Token,
} from './types'

export { CalculationError, isCalculationError } from './errors'
export { createEvaluationContext, evaluateNode } from './evaluator'
export type { EvaluationContext } from './evaluator'
export {
  functionNames,
  functionRegistry,
  getFunction,
  isFunctionName,
  registerFunction,
} from './functions'
export { parse, parseTokens } from './parser'
export { tokenize } from './tokenizer'
export type {
  ASTNode,
  ASTNodeType,
  AngleMode,
  BinaryNode,
  BinaryOperator,
  CalcError,
  CallNode,
  ConstantName,
  ConstantNode,
  ErrorCode,
  EvaluateOptions,
  EvaluateFailure,
  EvaluateSuccess,
  EvaluationResult,
  FunctionContext,
  FunctionDefinition,
  NumberNode,
  OperatorTokenValue,
  PostfixNode,
  PostfixOperator,
  Token,
  TokenType,
  UnaryNode,
  VariableNode,
} from './types'

export const DEFAULT_PRECISION = 12

/** Trims `1.230000e+21` to `1.23e+21` without leaving a dangling dot. */
function trimExponential(value: string): string {
  const [mantissa, exponent] = value.split('e')
  if (mantissa === undefined || exponent === undefined) return value

  const trimmed = mantissa.includes('.') ? mantissa.replace(/0+$/, '').replace(/\.$/, '') : mantissa

  return `${trimmed}e${exponent}`
}

/**
 * Renders a number for display: fixed notation for ordinary magnitudes,
 * exponential notation at the extremes, and no floating-point noise such as
 * `0.30000000000000004`.
 */
export function formatResult(value: number, precision: number = DEFAULT_PRECISION): string {
  const digits = Math.min(Math.max(Math.trunc(precision), 1), 21)

  if (Number.isNaN(value)) return 'Error'
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞'
  if (value === 0) return '0'

  const rounded = Number.parseFloat(value.toPrecision(digits))
  if (rounded === 0) return '0'

  const magnitude = Math.abs(rounded)
  if (magnitude >= 1e15 || magnitude < 1e-9) {
    return trimExponential(rounded.toExponential(digits - 1))
  }

  return String(rounded)
}

function toError(error: unknown): CalcError {
  if (isCalculationError(error)) {
    return error.position === undefined
      ? { code: error.code, message: error.message }
      : { code: error.code, message: error.message, position: error.position }
  }
  if (error instanceof Error) {
    return { code: 'syntax', message: error.message }
  }
  return { code: 'syntax', message: 'Unable to evaluate this expression' }
}

/**
 * Evaluates an expression and returns a discriminated result.
 *
 * @example
 * evaluate('2 + 2')                       // { ok: true, value: 4, ... }
 * evaluate('1/0')                         // { ok: false, error.code: 'division-by-zero' }
 * evaluate('sin(90)', { angleMode: 'DEG' }) // 1
 */
export function evaluate(expression: string, options: EvaluateOptions = {}): EvaluationResult {
  const trimmed = expression.trim()

  if (trimmed.length === 0) {
    return { ok: false, error: { code: 'empty-expression', message: 'Enter an expression' } }
  }

  const angleMode: AngleMode = options.angleMode ?? 'RAD'
  const precision = options.precision ?? DEFAULT_PRECISION
  const variables = options.variables ?? {}

  let ast: ASTNode
  try {
    ast = parse(trimmed)
  } catch (error) {
    return { ok: false, error: toError(error) }
  }

  let value: number
  try {
    value = evaluateNode(ast, createEvaluationContext(angleMode, variables))
  } catch (error) {
    return { ok: false, error: toError(error) }
  }

  if (Number.isNaN(value)) {
    return { ok: false, error: { code: 'domain-error', message: 'Result is not a real number' } }
  }
  if (!Number.isFinite(value)) {
    return { ok: false, error: { code: 'overflow', message: 'Result is too large to display' } }
  }

  return { ok: true, value, formatted: formatResult(value, precision) }
}

/** Tokens for syntax highlighting or debugging; typed error on bad input. */
export function getTokens(expression: string): Token[] | CalcError {
  try {
    return tokenize(expression)
  } catch (error) {
    return toError(error)
  }
}

/** Parses to an AST for tooling; throws `CalculationError`. */
export function getAst(expression: string): ASTNode {
  return parse(expression)
}

export { parseTokens as parseTokenList }
