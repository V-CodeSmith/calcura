import { CalculationError } from './errors'
import { getFunction } from './functions'
import type { AngleMode, ASTNode, BinaryNode, FunctionContext } from './types'

export interface EvaluationContext {
  readonly angleMode: AngleMode
  readonly variables: Readonly<Record<string, number>>
  readonly functions: FunctionContext
}

/** Builds the context the evaluator and every function implementation share. */
export function createEvaluationContext(
  angleMode: AngleMode,
  variables: Readonly<Record<string, number>> = {},
): EvaluationContext {
  const functions: FunctionContext = {
    angleMode,
    toRadians: (value) => (angleMode === 'DEG' ? (value * Math.PI) / 180 : value),
    fromRadians: (value) => (angleMode === 'DEG' ? (value * 180) / Math.PI : value),
  }

  return { angleMode, variables, functions }
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new CalculationError(
      'factorial-domain',
      'Factorial is defined only for non-negative integers',
    )
  }
  if (value > 170) {
    throw new CalculationError('overflow', 'Factorial is too large for a double')
  }
  let result = 1
  for (let i = 2; i <= value; i += 1) result *= i
  return result
}

/** Returns the operand of a `%` node, or `null` when the node is something else. */
function percentMagnitude(node: ASTNode, context: EvaluationContext): number | null {
  if (node.type === 'Postfix' && node.operator === '%') {
    return evaluateNode(node.operand, context)
  }
  return null
}

function evaluateBinary(node: BinaryNode, context: EvaluationContext): number {
  const left = evaluateNode(node.left, context)
  const magnitude = percentMagnitude(node.right, context)
  const right = magnitude === null ? evaluateNode(node.right, context) : magnitude / 100

  switch (node.operator) {
    case '+':
      // `200 + 10%` means "200 plus 10% of 200" — the behaviour users expect
      // from a calculator, not 200.1.
      return magnitude === null ? left + right : left + (left * magnitude) / 100

    case '-':
      return magnitude === null ? left - right : left - (left * magnitude) / 100

    case '*':
      return left * right

    case '/':
      if (right === 0) {
        throw new CalculationError('division-by-zero', 'Cannot divide by zero')
      }
      return left / right

    case '^': {
      if (left === 0 && right < 0) {
        throw new CalculationError('division-by-zero', 'Cannot raise zero to a negative power')
      }
      const result = left ** right
      if (Number.isNaN(result)) {
        throw new CalculationError('domain-error', 'Power is not defined for these values')
      }
      return result
    }
  }
}

/** Walks the AST. Throws `CalculationError`; callers decide how to surface it. */
export function evaluateNode(node: ASTNode, context: EvaluationContext): number {
  switch (node.type) {
    case 'Number':
      return node.value

    case 'Constant':
      return node.name === 'pi' ? Math.PI : Math.E

    case 'Variable': {
      const value = context.variables[node.name.toLowerCase()]
      if (value === undefined) {
        throw new CalculationError('unknown-symbol', `Unknown variable "${node.name}"`)
      }
      return value
    }

    case 'Unary': {
      const value = evaluateNode(node.operand, context)
      return node.operator === '-' ? -value : value
    }

    case 'Postfix': {
      const value = evaluateNode(node.operand, context)
      return node.operator === '!' ? factorial(value) : value / 100
    }

    case 'Binary':
      return evaluateBinary(node, context)

    case 'Call': {
      const definition = getFunction(node.name)
      if (!definition) {
        throw new CalculationError('unknown-function', `Unknown function "${node.name}"`)
      }
      if (node.args.length < definition.minArgs || node.args.length > definition.maxArgs) {
        const expected =
          definition.minArgs === definition.maxArgs
            ? `${definition.minArgs}`
            : `${definition.minArgs}–${definition.maxArgs === Number.MAX_SAFE_INTEGER ? 'n' : definition.maxArgs}`
        throw new CalculationError(
          'argument-count',
          `${node.name}() expects ${expected} argument${expected === '1' ? '' : 's'}`,
        )
      }
      const args = node.args.map((argument) => evaluateNode(argument, context))
      return definition.evaluate(args, context.functions)
    }
  }
}
