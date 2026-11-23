/**
 * Type definitions for Calcura's math engine.
 *
 * This folder is framework-agnostic: nothing here may import Vue, Nuxt, Pinia
 * or touch the DOM. That keeps the engine usable from a web worker, a CLI or a
 * plain Node test runner.
 */

export type AngleMode = 'DEG' | 'RAD'

export type ConstantName = 'pi' | 'e'

export type BinaryOperator = '+' | '-' | '*' | '/' | '^'

export type PostfixOperator = '!' | '%'

/** Operators that can appear as tokens; unary signs reuse the binary ones. */
export type OperatorTokenValue = BinaryOperator | PostfixOperator

/** Discriminated union of every token the tokenizer can emit. */
export type Token =
  | { readonly type: 'NUMBER'; readonly value: number; readonly position: number }
  | { readonly type: 'OPERATOR'; readonly value: OperatorTokenValue; readonly position: number }
  | { readonly type: 'LPAREN'; readonly position: number }
  | { readonly type: 'RPAREN'; readonly position: number }
  | { readonly type: 'FUNCTION'; readonly value: string; readonly position: number }
  | { readonly type: 'CONSTANT'; readonly value: ConstantName; readonly position: number }
  | { readonly type: 'VARIABLE'; readonly value: string; readonly position: number }
  | { readonly type: 'COMMA'; readonly position: number }

export type TokenType = Token['type']

export interface NumberNode {
  readonly type: 'Number'
  readonly value: number
}

export interface ConstantNode {
  readonly type: 'Constant'
  readonly name: ConstantName
}

export interface VariableNode {
  readonly type: 'Variable'
  readonly name: string
}

export interface UnaryNode {
  readonly type: 'Unary'
  readonly operator: '+' | '-'
  readonly operand: ASTNode
}

export interface BinaryNode {
  readonly type: 'Binary'
  readonly operator: BinaryOperator
  readonly left: ASTNode
  readonly right: ASTNode
}

export interface PostfixNode {
  readonly type: 'Postfix'
  readonly operator: PostfixOperator
  readonly operand: ASTNode
}

export interface CallNode {
  readonly type: 'Call'
  readonly name: string
  readonly args: readonly ASTNode[]
}

/** Typed syntax tree produced by the parser. */
export type ASTNode =
  NumberNode | ConstantNode | VariableNode | UnaryNode | BinaryNode | PostfixNode | CallNode

export type ASTNodeType = ASTNode['type']

/**
 * Machine-readable failure reasons. Every one of these is surfaced to the UI
 * instead of throwing, so the app can render errors inline.
 */
export type ErrorCode =
  | 'empty-expression'
  | 'syntax'
  | 'unexpected-character'
  | 'unknown-symbol'
  | 'unknown-function'
  | 'argument-count'
  | 'division-by-zero'
  | 'domain-error'
  | 'factorial-domain'
  | 'overflow'

export interface CalcError {
  readonly code: ErrorCode
  readonly message: string
  /** Character offset in the original input, when known. */
  readonly position?: number
}

export interface EvaluateSuccess {
  readonly ok: true
  /** Raw IEEE-754 result — never NaN or Infinity. */
  readonly value: number
  /** Human-readable rendering of `value` at the requested precision. */
  readonly formatted: string
}

export interface EvaluateFailure {
  readonly ok: false
  readonly error: CalcError
}

export type EvaluationResult = EvaluateSuccess | EvaluateFailure

export interface EvaluateOptions {
  /** Trig input/output unit. Defaults to `RAD`. */
  readonly angleMode?: AngleMode
  /** Variable bindings, matched case-insensitively (`ans`, `m`, `x`, `y`). */
  readonly variables?: Readonly<Record<string, number>>
  /** Significant digits used for `formatted`. Defaults to 12. */
  readonly precision?: number
}

/** Conversion helpers handed to every function implementation. */
export interface FunctionContext {
  readonly angleMode: AngleMode
  readonly toRadians: (value: number) => number
  readonly fromRadians: (value: number) => number
}

export interface FunctionDefinition {
  readonly name: string
  readonly minArgs: number
  readonly maxArgs: number
  readonly description: string
  /**
   * May throw `CalculationError` for domain problems; the evaluator converts
   * that into a typed failure at the public boundary.
   */
  readonly evaluate: (args: readonly number[], context: FunctionContext) => number
}
