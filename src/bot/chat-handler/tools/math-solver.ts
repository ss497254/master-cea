import { tool } from "ai";
import { z } from "zod";

/**
 * Token types for the expression parser
 */
interface Token {
  type: "number" | "operator" | "function" | "lparen" | "rparen" | "comma";
  value: number | string;
}

/**
 * Recursive descent expression parser for safe math evaluation
 */
class ExpressionParser {
  private pos = 0;

  constructor(
    private tokens: Token[],
    private functions: Record<string, (...args: number[]) => number>
  ) {}

  parse(): number {
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token at position ${this.pos}`);
    }
    return result;
  }

  private parseExpression(): number {
    return this.parseAddSub();
  }

  private parseAddSub(): number {
    let left = this.parseMulDiv();
    while (this.current()?.type === "operator" && (this.current()?.value === "+" || this.current()?.value === "-")) {
      const op = this.consume().value;
      const right = this.parseMulDiv();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  private parseMulDiv(): number {
    let left = this.parsePower();
    while (
      this.current()?.type === "operator" &&
      (this.current()?.value === "*" || this.current()?.value === "/" || this.current()?.value === "%")
    ) {
      const op = this.consume().value;
      const right = this.parsePower();
      if (op === "*") left = left * right;
      else if (op === "/") {
        if (right === 0) throw new Error("Division by zero");
        left = left / right;
      } else left = left % right;
    }
    return left;
  }

  private parsePower(): number {
    const left = this.parseUnary();
    if (this.current()?.type === "operator" && this.current()?.value === "^") {
      this.consume();
      const right = this.parsePower();
      return Math.pow(left, right);
    }
    return left;
  }

  private parseUnary(): number {
    if (this.current()?.type === "operator" && this.current()?.value === "-") {
      this.consume();
      return -this.parsePrimary();
    }
    if (this.current()?.type === "operator" && this.current()?.value === "+") {
      this.consume();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.current();

    if (token?.type === "number") {
      this.consume();
      return token.value as number;
    }

    if (token?.type === "function") {
      const funcName = this.consume().value as string;
      if (!(funcName in this.functions)) {
        throw new Error(`Unknown function: ${funcName}`);
      }
      this.expect("lparen");
      const args: number[] = [];
      if (this.current()?.type !== "rparen") {
        args.push(this.parseExpression());
        while (this.current()?.type === "comma") {
          this.consume();
          args.push(this.parseExpression());
        }
      }
      this.expect("rparen");
      return this.functions[funcName](...args);
    }

    if (token?.type === "lparen") {
      this.consume();
      const result = this.parseExpression();
      this.expect("rparen");
      return result;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }

  private current(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: Token["type"]): void {
    if (this.current()?.type !== type) {
      throw new Error(`Expected ${type}, got ${this.current()?.type}`);
    }
    this.consume();
  }
}

const constants: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
};

const functions: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: x => {
    if (x < 0) throw new Error("Cannot take square root of negative number");
    return Math.sqrt(x);
  },
  abs: Math.abs,
  log: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  pow: Math.pow,
  min: Math.min,
  max: Math.max,
};

function sanitizeExpression(expr: string): string {
  let sanitized = expr.toLowerCase().trim();
  for (const [name, value] of Object.entries(constants)) {
    sanitized = sanitized.replace(new RegExp(`\\b${name}\\b`, "g"), value.toString());
  }
  return sanitized;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/\d/.test(char) || (char === "." && /\d/.test(expr[i + 1]))) {
      let num = "";
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === ".")) {
        num += expr[i++];
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    if (/[a-z]/i.test(char)) {
      let name = "";
      while (i < expr.length && /[a-z]/i.test(expr[i])) {
        name += expr[i++];
      }
      tokens.push({ type: "function", value: name });
      continue;
    }

    if ("+-*/%^".includes(char)) {
      tokens.push({ type: "operator", value: char });
      i++;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "lparen", value: "(" });
      i++;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "rparen", value: ")" });
      i++;
      continue;
    }

    if (char === ",") {
      tokens.push({ type: "comma", value: "," });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: '${char}'`);
  }

  return tokens;
}

const mathSolverParams = z.object({
  expression: z.string().describe("Mathematical expression to evaluate"),
  precision: z.number().optional().default(6).describe("Decimal precision"),
});

/**
 * Math solver tool - evaluates mathematical expressions safely
 */
export const mathSolver = tool({
  description:
    "Evaluate mathematical expressions. " +
    "Supports: arithmetic (+, -, *, /, %, ^), " +
    "functions (sin, cos, tan, sqrt, log, ln, abs, floor, ceil, round, pow, min, max), " +
    "and constants (pi, e). " +
    "Examples: '2^10', 'sqrt(144)', 'sin(pi/4)', 'log(100)'.",
  inputSchema: mathSolverParams,
  execute: async ({ expression, precision = 6 }) => {
    const sanitized = sanitizeExpression(expression);
    const tokens = tokenize(sanitized);
    const parser = new ExpressionParser(tokens, functions);
    const result = parser.parse();

    if (!isFinite(result)) {
      throw new Error("Result is not a finite number");
    }

    return {
      expression,
      result: Number(result.toFixed(precision)),
    };
  },
});
