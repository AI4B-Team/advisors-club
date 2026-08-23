// Tiny, safe arithmetic evaluator used by app outputs.
//
// Creator-authored (and AI-authored) formulas must never reach `eval`. This is
// a shunting-yard parser limited to numbers, identifiers, the four operators,
// parentheses, comparison + ternary, and a fixed function whitelist.

type Token = { t: "num"; v: number } | { t: "id"; v: string } | { t: "op"; v: string } | { t: "fn"; v: string };

const FUNCTIONS: Record<string, (...a: number[]) => number> = {
  min: Math.min,
  max: Math.max,
  round: (n, d = 0) => Math.round(n * 10 ** d) / 10 ** d,
  floor: Math.floor,
  ceil: Math.ceil,
  abs: Math.abs,
  sqrt: Math.sqrt,
  pow: Math.pow,
  if: (c, a, b) => (c ? a : b),
};

const PRECEDENCE: Record<string, number> = {
  "||": 1, "&&": 2,
  "<": 3, ">": 3, "<=": 3, ">=": 3, "==": 3, "!=": 3,
  "+": 4, "-": 4,
  "*": 5, "/": 5, "%": 5,
  "^": 6,
};

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9._]/.test(src[j])) j++;
      out.push({ t: "num", v: Number(src.slice(i, j).replace(/_/g, "")) });
      i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      i = j;
      if (word in FUNCTIONS) out.push({ t: "fn", v: word });
      else out.push({ t: "id", v: word });
      continue;
    }
    const two = src.slice(i, i + 2);
    if (["<=", ">=", "==", "!=", "&&", "||"].includes(two)) { out.push({ t: "op", v: two }); i += 2; continue; }
    if ("+-*/%^()<>,".includes(c)) { out.push({ t: "op", v: c }); i++; continue; }
    // Unknown character — ignore rather than throw, formulas are user text.
    i++;
  }
  return out;
}

/** Convert infix tokens to RPN. */
function toRpn(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const stack: Token[] = [];
  let prev: Token | undefined;
  for (const tok of tokens) {
    if (tok.t === "num" || tok.t === "id") { out.push(tok); prev = tok; continue; }
    if (tok.t === "fn") { stack.push(tok); prev = tok; continue; }
    if (tok.v === ",") {
      while (stack.length && !(stack[stack.length - 1].t === "op" && stack[stack.length - 1].v === "(")) out.push(stack.pop()!);
      prev = tok; continue;
    }
    if (tok.v === "(") { stack.push(tok); prev = tok; continue; }
    if (tok.v === ")") {
      while (stack.length && !(stack[stack.length - 1].t === "op" && stack[stack.length - 1].v === "(")) out.push(stack.pop()!);
      stack.pop();
      if (stack.length && stack[stack.length - 1].t === "fn") out.push(stack.pop()!);
      prev = tok; continue;
    }
    // Unary minus → 0 - x
    if (tok.v === "-" && (!prev || (prev.t === "op" && prev.v !== ")"))) out.push({ t: "num", v: 0 });
    const p = PRECEDENCE[tok.v] ?? 0;
    while (stack.length) {
      const top = stack[stack.length - 1];
      if (top.t === "op" && top.v !== "(" && (PRECEDENCE[top.v] ?? 0) >= p) out.push(stack.pop()!);
      else break;
    }
    stack.push(tok);
    prev = tok;
  }
  while (stack.length) out.push(stack.pop()!);
  return out;
}

function applyOp(op: string, a: number, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? 0 : a / b;
    case "%": return b === 0 ? 0 : a % b;
    case "^": return a ** b;
    case "<": return a < b ? 1 : 0;
    case ">": return a > b ? 1 : 0;
    case "<=": return a <= b ? 1 : 0;
    case ">=": return a >= b ? 1 : 0;
    case "==": return a === b ? 1 : 0;
    case "!=": return a !== b ? 1 : 0;
    case "&&": return a && b ? 1 : 0;
    case "||": return a || b ? 1 : 0;
    default: return 0;
  }
}

/**
 * Evaluate an arithmetic expression against a scope of numeric values.
 * Unknown identifiers resolve to 0 so a half-configured app still renders.
 */
export function evaluate(expression: string, scope: Record<string, number>): number {
  if (!expression?.trim()) return 0;
  try {
    const rpn = toRpn(tokenize(expression));
    const stack: number[] = [];
    for (const tok of rpn) {
      if (tok.t === "num") { stack.push(tok.v); continue; }
      if (tok.t === "id") { stack.push(Number(scope[tok.v]) || 0); continue; }
      if (tok.t === "fn") {
        const fn = FUNCTIONS[tok.v];
        const arity = fn.length || 2;
        const args = stack.splice(Math.max(0, stack.length - arity), arity);
        while (args.length < arity) args.push(0);
        stack.push(Number(fn(...args)) || 0);
        continue;
      }
      const b = stack.pop() ?? 0;
      const a = stack.pop() ?? 0;
      stack.push(applyOp(tok.v, a, b));
    }
    const result = stack.pop() ?? 0;
    return Number.isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

/** Identifiers referenced by an expression — used to validate formulas. */
export function referencedKeys(expression: string): string[] {
  return Array.from(new Set(tokenize(expression).filter(t => t.t === "id").map(t => t.v as string)));
}
