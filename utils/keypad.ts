export type CalculatorMode = 'standard' | 'scientific' | 'programmer'

export type NumberBase = 'DEC' | 'HEX' | 'OCT' | 'BIN'

export type KeyTone = 'digit' | 'operator' | 'function' | 'action' | 'danger' | 'equals' | 'memory'

export type KeyAction =
  | 'clear'
  | 'backspace'
  | 'equals'
  | 'negate'
  | 'toggle-angle'
  | 'memory-add'
  | 'memory-subtract'
  | 'memory-recall'
  | 'memory-clear'

export interface KeySpec {
  readonly id: string
  readonly label: string
  readonly ariaLabel: string
  readonly tone: KeyTone
  /** Text appended to the expression when the key is pressed. */
  readonly insert?: string
  /** Store action instead of inserting text. */
  readonly action?: KeyAction
  /** Grid columns to occupy (kept for wide keys). */
  readonly span?: 1 | 2
  /** Keyboard shortcut hint shown in the tooltip. */
  readonly hint?: string
}

/** Always-visible keypad shared by every mode (5 × 5 grid). */
export const standardKeys: readonly KeySpec[] = [
  {
    id: 'clear',
    label: 'AC',
    ariaLabel: 'Clear all',
    tone: 'danger',
    action: 'clear',
    hint: 'Esc',
  },
  {
    id: 'backspace',
    label: '⌫',
    ariaLabel: 'Delete last character',
    tone: 'action',
    action: 'backspace',
    hint: 'Backspace',
  },
  { id: 'lparen', label: '(', ariaLabel: 'Open parenthesis', tone: 'function', insert: '(' },
  { id: 'rparen', label: ')', ariaLabel: 'Close parenthesis', tone: 'function', insert: ')' },
  // Needed by every multi-argument function, e.g. log(8, 2) or and(12, 10).
  {
    id: 'comma',
    label: ',',
    ariaLabel: 'Comma, separates arguments',
    tone: 'function',
    insert: ',',
  },

  { id: '7', label: '7', ariaLabel: 'Seven', tone: 'digit', insert: '7' },
  { id: '8', label: '8', ariaLabel: 'Eight', tone: 'digit', insert: '8' },
  { id: '9', label: '9', ariaLabel: 'Nine', tone: 'digit', insert: '9' },
  { id: 'divide', label: '÷', ariaLabel: 'Divide', tone: 'operator', insert: '/', hint: '/' },
  { id: 'ans', label: 'Ans', ariaLabel: 'Insert last answer', tone: 'action', insert: 'ans' },

  { id: '4', label: '4', ariaLabel: 'Four', tone: 'digit', insert: '4' },
  { id: '5', label: '5', ariaLabel: 'Five', tone: 'digit', insert: '5' },
  { id: '6', label: '6', ariaLabel: 'Six', tone: 'digit', insert: '6' },
  { id: 'multiply', label: '×', ariaLabel: 'Multiply', tone: 'operator', insert: '*', hint: '*' },
  { id: 'negate', label: '±', ariaLabel: 'Toggle sign', tone: 'action', action: 'negate' },

  { id: '1', label: '1', ariaLabel: 'One', tone: 'digit', insert: '1' },
  { id: '2', label: '2', ariaLabel: 'Two', tone: 'digit', insert: '2' },
  { id: '3', label: '3', ariaLabel: 'Three', tone: 'digit', insert: '3' },
  { id: 'minus', label: '−', ariaLabel: 'Subtract', tone: 'operator', insert: '-', hint: '-' },
  {
    id: 'factorial',
    label: 'n!',
    ariaLabel: 'Factorial',
    tone: 'function',
    insert: '!',
    hint: '!',
  },

  { id: '0', label: '0', ariaLabel: 'Zero', tone: 'digit', insert: '0' },
  { id: 'dot', label: '.', ariaLabel: 'Decimal point', tone: 'digit', insert: '.', hint: '.' },
  { id: 'percent', label: '%', ariaLabel: 'Percent', tone: 'function', insert: '%', hint: '%' },
  { id: 'plus', label: '+', ariaLabel: 'Add', tone: 'operator', insert: '+', hint: '+' },
  {
    id: 'equals',
    label: '=',
    ariaLabel: 'Equals',
    tone: 'equals',
    action: 'equals',
    hint: 'Enter',
  },
]

/** Extra rows shown in scientific mode. */
export const scientificKeys: readonly KeySpec[] = [
  {
    id: 'angle-mode',
    label: 'DEG',
    ariaLabel: 'Toggle degrees or radians',
    tone: 'memory',
    action: 'toggle-angle',
  },
  { id: 'sin', label: 'sin', ariaLabel: 'Sine', tone: 'function', insert: 'sin(' },
  { id: 'cos', label: 'cos', ariaLabel: 'Cosine', tone: 'function', insert: 'cos(' },
  { id: 'tan', label: 'tan', ariaLabel: 'Tangent', tone: 'function', insert: 'tan(' },
  { id: 'power', label: 'xʸ', ariaLabel: 'Power', tone: 'operator', insert: '^', hint: '^' },

  { id: 'asin', label: 'sin⁻¹', ariaLabel: 'Inverse sine', tone: 'function', insert: 'asin(' },
  { id: 'acos', label: 'cos⁻¹', ariaLabel: 'Inverse cosine', tone: 'function', insert: 'acos(' },
  { id: 'atan', label: 'tan⁻¹', ariaLabel: 'Inverse tangent', tone: 'function', insert: 'atan(' },
  { id: 'ln', label: 'ln', ariaLabel: 'Natural logarithm', tone: 'function', insert: 'ln(' },
  { id: 'log', label: 'log', ariaLabel: 'Logarithm base ten', tone: 'function', insert: 'log(' },

  { id: 'sqrt', label: '√', ariaLabel: 'Square root', tone: 'function', insert: 'sqrt(' },
  { id: 'exp', label: 'eˣ', ariaLabel: 'Exponential', tone: 'function', insert: 'exp(' },
  { id: 'abs', label: '|x|', ariaLabel: 'Absolute value', tone: 'function', insert: 'abs(' },
  { id: 'pi', label: 'π', ariaLabel: 'Pi', tone: 'function', insert: 'pi' },
  { id: 'e', label: 'e', ariaLabel: 'Euler number', tone: 'function', insert: 'e' },
]

/** Extra rows shown in programmer mode (32-bit integer operations). */
export const programmerKeys: readonly KeySpec[] = [
  { id: 'and', label: 'AND', ariaLabel: 'Bitwise and', tone: 'function', insert: 'and(' },
  { id: 'or', label: 'OR', ariaLabel: 'Bitwise or', tone: 'function', insert: 'or(' },
  { id: 'xor', label: 'XOR', ariaLabel: 'Bitwise xor', tone: 'function', insert: 'xor(' },
  { id: 'not', label: 'NOT', ariaLabel: 'Bitwise not', tone: 'function', insert: 'not(' },
  { id: 'shl', label: 'SHL', ariaLabel: 'Shift left', tone: 'function', insert: 'shl(' },

  { id: 'shr', label: 'SHR', ariaLabel: 'Shift right', tone: 'function', insert: 'shr(' },
  { id: 'mod', label: 'MOD', ariaLabel: 'Remainder', tone: 'function', insert: 'mod(' },
  { id: 'min', label: 'MIN', ariaLabel: 'Minimum', tone: 'function', insert: 'min(' },
  { id: 'max', label: 'MAX', ariaLabel: 'Maximum', tone: 'function', insert: 'max(' },
  { id: 'round', label: 'ROUND', ariaLabel: 'Round', tone: 'function', insert: 'round(' },
]

export const memoryKeys: readonly KeySpec[] = [
  {
    id: 'memory-clear',
    label: 'MC',
    ariaLabel: 'Clear memory',
    tone: 'memory',
    action: 'memory-clear',
  },
  {
    id: 'memory-recall',
    label: 'MR',
    ariaLabel: 'Recall memory',
    tone: 'memory',
    action: 'memory-recall',
  },
  {
    id: 'memory-add',
    label: 'M+',
    ariaLabel: 'Add displayed value to memory',
    tone: 'memory',
    action: 'memory-add',
  },
  {
    id: 'memory-subtract',
    label: 'M−',
    ariaLabel: 'Subtract displayed value from memory',
    tone: 'memory',
    action: 'memory-subtract',
  },
]
