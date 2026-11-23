import { CalculationError } from './errors'
import { tokenize } from './tokenizer'
import type { ASTNode, BinaryOperator, Token } from './types'

interface ParserState {
  readonly tokens: readonly Token[]
  index: number
}

/**
 * Grammar (lowest to highest precedence):
 *
 *   expression  := additive
 *   additive    := multiplicative (('+' | '-') multiplicative)*
 *   multiplicative := unary (('*' | '/') unary | implicit-multiplication)*
 *   unary       := ('+' | '-') unary | power
 *   power       := postfix ('^' unary)?          // right associative
 *   postfix     := primary ('!' | '%')*
 *   primary     := NUMBER | CONSTANT | VARIABLE
 *                | FUNCTION '(' args? ')'
 *                | '(' expression ')'
 *
 * Recursive descent is used instead of shunting-yard because the resulting
 * tree keeps source structure explicit, which makes error positions and tests
 * much clearer.
 */
export function parseTokens(tokens: readonly Token[]): ASTNode {
  const state: ParserState = { tokens, index: 0 }

  if (tokens.length === 0) {
    throw new CalculationError('empty-expression', 'Enter an expression')
  }

  const node = parseAdditive(state)

  const trailing = state.tokens[state.index]
  if (trailing) {
    throw new CalculationError(
      'syntax',
      `Unexpected token at position ${trailing.position}`,
      trailing.position,
    )
  }

  return node
}

/** Convenience wrapper: string in, AST out (throws `CalculationError`). */
export function parse(expression: string): ASTNode {
  return parseTokens(tokenize(expression))
}

function peek(state: ParserState): Token | undefined {
  return state.tokens[state.index]
}

function next(state: ParserState): Token | undefined {
  const token = state.tokens[state.index]
  state.index += 1
  return token
}

function isOperator(token: Token | undefined, values: readonly string[]): boolean {
  return token !== undefined && token.type === 'OPERATOR' && values.includes(token.value)
}

function endPosition(state: ParserState): number {
  const last = state.tokens[state.tokens.length - 1]
  return last ? last.position + 1 : 0
}

function startsPrimary(token: Token | undefined): boolean {
  if (!token) return false
  return (
    token.type === 'NUMBER' ||
    token.type === 'CONSTANT' ||
    token.type === 'VARIABLE' ||
    token.type === 'FUNCTION' ||
    token.type === 'LPAREN'
  )
}

function parseAdditive(state: ParserState): ASTNode {
  let left = parseMultiplicative(state)

  for (;;) {
    const token = peek(state)
    if (!isOperator(token, ['+', '-'])) break
    const operator = (next(state) as Extract<Token, { type: 'OPERATOR' }>).value as BinaryOperator
    const right = parseMultiplicative(state)
    left = { type: 'Binary', operator, left, right }
  }

  return left
}

function parseMultiplicative(state: ParserState): ASTNode {
  let left = parseUnary(state)

  for (;;) {
    const token = peek(state)

    if (isOperator(token, ['*', '/'])) {
      const operator = (next(state) as Extract<Token, { type: 'OPERATOR' }>).value as BinaryOperator
      const right = parseUnary(state)
      left = { type: 'Binary', operator, left, right }
      continue
    }

    // Implicit multiplication: `2π`, `3(4+5)`, `2sin(30)`.
    if (startsPrimary(token)) {
      const right = parseUnary(state)
      left = { type: 'Binary', operator: '*', left, right }
      continue
    }

    break
  }

  return left
}

function parseUnary(state: ParserState): ASTNode {
  const token = peek(state)

  if (isOperator(token, ['+', '-'])) {
    const operator = (next(state) as Extract<Token, { type: 'OPERATOR' }>).value as '+' | '-'
    // Unary binds looser than `^`: `-2^2` is `-(2^2)`.
    const operand = parseUnary(state)
    return { type: 'Unary', operator, operand }
  }

  return parsePower(state)
}

function parsePower(state: ParserState): ASTNode {
  const base = parsePostfix(state)

  if (isOperator(peek(state), ['^'])) {
    next(state)
    // Right associative: `2^3^2` is `2^(3^2)`, and `2^-3` is allowed.
    const exponent = parseUnary(state)
    return { type: 'Binary', operator: '^', left: base, right: exponent }
  }

  return base
}

function parsePostfix(state: ParserState): ASTNode {
  let node = parsePrimary(state)

  for (;;) {
    const token = peek(state)
    if (!isOperator(token, ['!', '%'])) break
    const operator = (next(state) as Extract<Token, { type: 'OPERATOR' }>).value as '!' | '%'
    node = { type: 'Postfix', operator, operand: node }
  }

  return node
}

function parsePrimary(state: ParserState): ASTNode {
  const token = next(state)

  if (!token) {
    throw new CalculationError('syntax', 'Unexpected end of expression', endPosition(state))
  }

  switch (token.type) {
    case 'NUMBER':
      return { type: 'Number', value: token.value }

    case 'CONSTANT':
      return { type: 'Constant', name: token.value }

    case 'VARIABLE':
      return { type: 'Variable', name: token.value }

    case 'LPAREN': {
      const inner = parseAdditive(state)
      const closing = next(state)
      if (!closing || closing.type !== 'RPAREN') {
        throw new CalculationError(
          'syntax',
          'Missing closing parenthesis',
          closing ? closing.position : endPosition(state),
        )
      }
      return inner
    }

    case 'FUNCTION': {
      const opening = peek(state)
      if (!opening || opening.type !== 'LPAREN') {
        throw new CalculationError(
          'syntax',
          `${token.value}() needs parentheses, e.g. ${token.value}(30)`,
          token.position,
        )
      }
      next(state) // consume '('

      const args: ASTNode[] = []

      // Empty argument list is a syntax error caught by min-arity checks, but
      // `f()` must not swallow the closing paren as an expression.
      if (peek(state)?.type !== 'RPAREN') {
        for (;;) {
          args.push(parseAdditive(state))
          if (peek(state)?.type === 'COMMA') {
            next(state)
            continue
          }
          break
        }
      }

      const closing = next(state)
      if (!closing || closing.type !== 'RPAREN') {
        throw new CalculationError(
          'syntax',
          `Missing closing parenthesis after ${token.value}(`,
          closing ? closing.position : endPosition(state),
        )
      }

      return { type: 'Call', name: token.value, args }
    }

    case 'RPAREN':
      throw new CalculationError('syntax', 'Unmatched closing parenthesis', token.position)

    case 'COMMA':
      throw new CalculationError('syntax', 'Unexpected comma', token.position)

    case 'OPERATOR':
      throw new CalculationError(
        'syntax',
        `Operator "${token.value}" has no left-hand operand`,
        token.position,
      )
  }
}
