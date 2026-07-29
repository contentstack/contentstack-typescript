/**
 * Assertion tracker for the rich test report.
 *
 * Records every assertion (matcher, expected, received/actual, pass, negated) WITHOUT
 * changing any test — specs keep using plain `expect(...)`. The rich-html-reporter
 * renders these as the "Assertions Verified (Expected vs Actual)" section, mirroring
 * the CMA SDK report.
 *
 * Mechanism: it overrides the built-in matchers via `expect.extend`, wrapping each to
 * record its result and then delegating to the original built-in matcher (from the
 * `expect` package). `expect.extend` writes to the shared matcher registry used by BOTH
 * the global `expect` and the `@jest/globals` `expect` (which most specs import), so a
 * single install covers every spec. Installed only when ENABLE_HTTP_CAPTURE=true.
 */

export interface AssertionRec {
  matcher: string;
  expected: string;
  actual: string;
  passed: boolean;
  isNot: boolean;
}

let current: AssertionRec[] = [];

export function clearAssertions(): void {
  current = [];
}

export function getAssertions(): AssertionRec[] {
  return current.slice();
}

function short(v: any, limit = 800): string {
  try {
    if (typeof v === 'function') return `[Function${v.name ? ': ' + v.name : ''}]`;
    if (typeof v === 'string') return v.length > limit ? v.slice(0, limit) + ' …' : v;
    const s = JSON.stringify(v, null, 2);
    if (s === undefined) return String(v);
    return s.length > limit ? s.slice(0, limit) + ' …' : s;
  } catch {
    return String(v);
  }
}

export function installAssertionTracker(): void {
  const g: any = globalThis as any;
  if (g.__assertionTrackerInstalled) return;

  let builtins: Record<string, any>;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expect/build/matchers');
    builtins = (mod && (mod.default || mod)) as Record<string, any>;
  } catch {
    return; // can't locate built-in matchers — skip tracking
  }
  if (!builtins || typeof builtins !== 'object') return;

  const wrappers: Record<string, any> = {};
  for (const name of Object.keys(builtins)) {
    const orig = builtins[name];
    if (typeof orig !== 'function') continue;
    wrappers[name] = function (this: any, received: any, ...args: any[]) {
      const result = orig.apply(this, [received, ...args]);
      try {
        const rawPass = !!(result && result.pass);
        const isNot = !!(this && this.isNot);
        current.push({
          matcher: name,
          expected: args.length ? short(args.length === 1 ? args[0] : args) : '',
          actual: short(received),
          passed: isNot ? !rawPass : rawPass,
          isNot,
        });
      } catch {
        /* never let recording break a test */
      }
      return result;
    };
  }

  // Extend every reachable expect so both global- and @jest/globals-imported specs are covered.
  const extendTargets: any[] = [];
  if (typeof g.expect?.extend === 'function') extendTargets.push(g.expect);
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jg = require('@jest/globals');
    if (jg && typeof jg.expect?.extend === 'function' && jg.expect !== g.expect) {
      extendTargets.push(jg.expect);
    }
  } catch {
    /* not in jest env */
  }
  for (const target of extendTargets) {
    try {
      target.extend(wrappers);
    } catch {
      /* ignore */
    }
  }

  g.__assertionTrackerInstalled = true;
}
