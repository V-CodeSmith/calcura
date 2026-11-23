import { CalculationError } from './errors'
import { isFunctionName } from './functions'
import type { OperatorTokenValue, Token } from './types'

const NUMBER_PATTERN = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i
const IDENTIFIER_PATTERN = /^[a-z]+/i

/** Symbols users may type or paste, normalised to ASCII operators. */
const OPERATOR_ALIASES: Readonly<Record<string, string>> = {
  '+': '+',
  '-': '-',
  '−': '-',
  '–': '-',
  '*': '*',
  '×': '*',
  '·': '*',
  '/': '/',
  '÷': '/',
  '^': '^',
  '!': '!',
  '%': '%',
}

const POSTFIX_OPERATORS: ReadonlySet<string> = new Set(['!', '%'])
const BINARY_OPERATORS: ReadonlySet<string> = new Set(['+', '-', '*', '/', '^'])

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r'
}

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9'
}

/**
 * Converts an expression string into tokens.
 *
 * Throws `CalculationError` (`unexpected-character`) for characters the
 * grammar has no meaning for — never a bare `Error`.
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < input.length) {
    const char = input[index]

    if (char === undefined) break

    if (isWhitespace(char)) {
      index += 1
      continue
    }

    // Numbers, including `.5` and `1.2e-3`.
    if (isDigit(char) || (char === '.' && isDigit(input[index + 1] ?? ''))) {
      const match = NUMBER_PATTERN.exec(input.slice(index))
      if (!match) {
        throw new CalculationError('syntax', `Malformed number at position ${index}`, index)
      }
      const raw = match[0]
      const value = Number(raw)
      if (!Number.isFinite(value)) {
        throw new CalculationError('overflow', `Number "${raw}" is out of range`, index)
      }
      tokens.push({ type: 'NUMBER', value, position: index })
      index += raw.length
      continue
    }

    if (char === 'π') {
      tokens.push({ type: 'CONSTANT', value: 'pi', position: index })
      index += 1
      continue
    }

    if (char === 'Π') {
      throw new CalculationError(
        'unexpected-character',
        'Use lowercase π (pi) for the constant',
        index,
      )
    }

    if (char === '(' || char === '[') {
      tokens.push({ type: 'LPAREN', position: index })
      index += 1
      continue
    }

    if (char === ')' || char === ']') {
      tokens.push({ type: 'RPAREN', position: index })
      index += 1
      continue
    }

    if (char === ',') {
      tokens.push({ type: 'COMMA', position: index })
      index += 1
      continue
    }

    // `**` is an alias for `^`.
    if (char === '*' && input[index + 1] === '*') {
      tokens.push({ type: 'OPERATOR', value: '^', position: index })
      index += 2
      continue
    }

    const operator = OPERATOR_ALIASES[char]
    if (operator !== undefined) {
      if (!POSTFIX_OPERATORS.has(operator) && !BINARY_OPERATORS.has(operator)) {
        throw new CalculationError('unexpected-character', `Unknown operator "${char}"`, index)
      }
      tokens.push({
        type: 'OPERATOR',
        value: operator as OperatorTokenValue,
        position: index,
      })
      index += 1
      continue
    }

    const identifier = IDENTIFIER_PATTERN.exec(input.slice(index))
    if (identifier) {
      const raw = identifier[0]
      const name = raw.toLowerCase()

      if (isFunctionName(name)) {
        tokens.push({ type: 'FUNCTION', value: name, position: index })
      } else if (name === 'pi') {
        tokens.push({ type: 'CONSTANT', value: 'pi', position: index })
      } else if (name === 'e') {
        tokens.push({ type: 'CONSTANT', value: 'e', position: index })
      } else {
        // Unknown identifiers become variables; the evaluator reports them as
        // unknown symbols, which produces a better message than a lexer error.
        tokens.push({ type: 'VARIABLE', value: name, position: index })
      }

      index += raw.length
      continue
    }

    throw new CalculationError('unexpected-character', `Unexpected character "${char}"`, index)
  }

  return tokens
}
