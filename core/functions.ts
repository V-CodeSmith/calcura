import { CalculationError } from './errors'
import type { FunctionDefinition } from './types'

/** Reads a required argument without ever returning `undefined`. */
function arg(args: readonly number[], index: number): number {
  const value = args[index]
  if (value === undefined) {
    throw new CalculationError('argument-count', 'Missing function argument')
  }
  return value
}

/** Bitwise functions operate on signed 32-bit integers. */
function toInt32(value: number): number {
  if (!Number.isInteger(value)) {
    throw new CalculationError('domain-error', 'Bitwise operands must be integers')
  }
  if (value < -2147483648 || value > 2147483647) {
    throw new CalculationError('overflow', 'Bitwise operands must fit in 32 bits')
  }
  return value
}

const definitions: readonly FunctionDefinition[] = [
  {
    name: 'sin',
    minArgs: 1,
    maxArgs: 1,
    description: 'Sine of an angle in the active unit',
    evaluate: (args, ctx) => Math.sin(ctx.toRadians(arg(args, 0))),
  },
  {
    name: 'cos',
    minArgs: 1,
    maxArgs: 1,
    description: 'Cosine of an angle in the active unit',
    evaluate: (args, ctx) => Math.cos(ctx.toRadians(arg(args, 0))),
  },
  {
    name: 'tan',
    minArgs: 1,
    maxArgs: 1,
    description: 'Tangent of an angle in the active unit',
    evaluate: (args, ctx) => {
      const value = arg(args, 0)
      // In degrees, tan(90 + 180k) is undefined; Math.tan would return a huge
      // finite float that reads like a real answer.
      if (ctx.angleMode === 'DEG') {
        const normalized = ((value % 180) + 180) % 180
        if (normalized === 90) {
          throw new CalculationError('domain-error', 'tan is undefined at 90° + 180°·k')
        }
      }
      return Math.tan(ctx.toRadians(value))
    },
  },
  {
    name: 'asin',
    minArgs: 1,
    maxArgs: 1,
    description: 'Inverse sine, returned in the active unit',
    evaluate: (args, ctx) => {
      const value = arg(args, 0)
      if (value < -1 || value > 1) {
        throw new CalculationError('domain-error', 'asin is defined only on [-1, 1]')
      }
      return ctx.fromRadians(Math.asin(value))
    },
  },
  {
    name: 'acos',
    minArgs: 1,
    maxArgs: 1,
    description: 'Inverse cosine, returned in the active unit',
    evaluate: (args, ctx) => {
      const value = arg(args, 0)
      if (value < -1 || value > 1) {
        throw new CalculationError('domain-error', 'acos is defined only on [-1, 1]')
      }
      return ctx.fromRadians(Math.acos(value))
    },
  },
  {
    name: 'atan',
    minArgs: 1,
    maxArgs: 1,
    description: 'Inverse tangent, returned in the active unit',
    evaluate: (args, ctx) => ctx.fromRadians(Math.atan(arg(args, 0))),
  },
  {
    name: 'log',
    minArgs: 1,
    maxArgs: 2,
    description: 'Logarithm base 10 (or an explicit base)',
    evaluate: (args) => {
      const value = arg(args, 0)
      const base = args.length > 1 ? arg(args, 1) : 10
      if (value <= 0) {
        throw new CalculationError('domain-error', 'log is defined only for positive numbers')
      }
      if (base <= 0 || base === 1) {
        throw new CalculationError('domain-error', 'log base must be positive and not 1')
      }
      return Math.log(value) / Math.log(base)
    },
  },
  {
    name: 'ln',
    minArgs: 1,
    maxArgs: 1,
    description: 'Natural logarithm',
    evaluate: (args) => {
      const value = arg(args, 0)
      if (value <= 0) {
        throw new CalculationError('domain-error', 'ln is defined only for positive numbers')
      }
      return Math.log(value)
    },
  },
  {
    name: 'sqrt',
    minArgs: 1,
    maxArgs: 1,
    description: 'Square root',
    evaluate: (args) => {
      const value = arg(args, 0)
      if (value < 0) {
        throw new CalculationError('domain-error', 'sqrt of a negative number is not real')
      }
      return Math.sqrt(value)
    },
  },
  {
    name: 'abs',
    minArgs: 1,
    maxArgs: 1,
    description: 'Absolute value',
    evaluate: (args) => Math.abs(arg(args, 0)),
  },
  {
    name: 'exp',
    minArgs: 1,
    maxArgs: 1,
    description: 'e raised to a power',
    evaluate: (args) => Math.exp(arg(args, 0)),
  },
  {
    name: 'pow',
    minArgs: 2,
    maxArgs: 2,
    description: 'pow(base, exponent)',
    evaluate: (args) => arg(args, 0) ** arg(args, 1),
  },
  {
    name: 'round',
    minArgs: 1,
    maxArgs: 2,
    description: 'Round to the nearest integer or given number of decimals',
    evaluate: (args) => {
      const value = arg(args, 0)
      const digits = args.length > 1 ? arg(args, 1) : 0
      const factor = 10 ** Math.trunc(digits)
      return Math.round(value * factor) / factor
    },
  },
  {
    name: 'floor',
    minArgs: 1,
    maxArgs: 1,
    description: 'Round down',
    evaluate: (args) => Math.floor(arg(args, 0)),
  },
  {
    name: 'ceil',
    minArgs: 1,
    maxArgs: 1,
    description: 'Round up',
    evaluate: (args) => Math.ceil(arg(args, 0)),
  },
  {
    name: 'min',
    minArgs: 1,
    maxArgs: Number.MAX_SAFE_INTEGER,
    description: 'Smallest of the arguments',
    evaluate: (args) => Math.min(...args),
  },
  {
    name: 'max',
    minArgs: 1,
    maxArgs: Number.MAX_SAFE_INTEGER,
    description: 'Largest of the arguments',
    evaluate: (args) => Math.max(...args),
  },
  {
    name: 'mod',
    minArgs: 2,
    maxArgs: 2,
    description: 'Remainder of a division',
    evaluate: (args) => {
      const divisor = arg(args, 1)
      if (divisor === 0) {
        throw new CalculationError('division-by-zero', 'Cannot take a remainder by zero')
      }
      return arg(args, 0) % divisor
    },
  },
  {
    name: 'and',
    minArgs: 2,
    maxArgs: 2,
    description: 'Bitwise AND (32-bit)',
    evaluate: (args) => toInt32(arg(args, 0)) & toInt32(arg(args, 1)),
  },
  {
    name: 'or',
    minArgs: 2,
    maxArgs: 2,
    description: 'Bitwise OR (32-bit)',
    evaluate: (args) => toInt32(arg(args, 0)) | toInt32(arg(args, 1)),
  },
  {
    name: 'xor',
    minArgs: 2,
    maxArgs: 2,
    description: 'Bitwise XOR (32-bit)',
    evaluate: (args) => toInt32(arg(args, 0)) ^ toInt32(arg(args, 1)),
  },
  {
    name: 'not',
    minArgs: 1,
    maxArgs: 1,
    description: 'Bitwise NOT (32-bit)',
    evaluate: (args) => ~toInt32(arg(args, 0)),
  },
  {
    name: 'shl',
    minArgs: 2,
    maxArgs: 2,
    description: 'Shift bits left',
    evaluate: (args) => toInt32(arg(args, 0)) << toInt32(arg(args, 1)),
  },
  {
    name: 'shr',
    minArgs: 2,
    maxArgs: 2,
    description: 'Shift bits right',
    evaluate: (args) => toInt32(arg(args, 0)) >> toInt32(arg(args, 1)),
  },
]

const registry: ReadonlyMap<string, FunctionDefinition> = new Map(
  definitions.map((definition) => [definition.name, definition]),
)

/** All callable functions, keyed by lowercase name. */
export const functionRegistry: ReadonlyMap<string, FunctionDefinition> = registry

/** Function names, longest first — useful for prefix-based highlighting. */
export const functionNames: readonly string[] = [...registry.keys()].sort(
  (a, b) => b.length - a.length,
)

export function isFunctionName(name: string): boolean {
  return registry.has(name.toLowerCase())
}

export function getFunction(name: string): FunctionDefinition | undefined {
  return registry.get(name.toLowerCase())
}

/**
 * Registers an extra function at runtime. Returns a disposer so tests and
 * embedding apps can undo the change; duplicate names are rejected.
 */
export function registerFunction(definition: FunctionDefinition): () => void {
  if (registry.has(definition.name)) {
    throw new Error(`Function "${definition.name}" is already registered`)
  }
  ;(registry as Map<string, FunctionDefinition>).set(definition.name, definition)
  return () => {
    ;(registry as Map<string, FunctionDefinition>).delete(definition.name)
  }
}
