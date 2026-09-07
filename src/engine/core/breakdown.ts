/**
 * A number together with the labelled terms that produced it.
 *
 * The design brief requires that the player can always ask "why is this number what it
 * is?". Rather than remembering to add explanations at the UI layer, every derived value
 * in the simulation is computed through a `BreakdownBuilder`, so the explanation is a
 * by-product of the calculation itself and cannot drift out of sync with it.
 */

export type TermKind = 'base' | 'bonus' | 'penalty' | 'multiplier' | 'info';

export interface BreakdownTerm {
  label: string;
  /** Additive terms carry their delta; multipliers carry the factor (1.2 = +20%). */
  value: number;
  kind: TermKind;
  /** Optional longer explanation shown under the term. */
  detail?: string;
  /** Optional actionable suggestion, e.g. "Build Cold Storage to stop spoilage". */
  fixHint?: string;
}

export interface Breakdown {
  total: number;
  terms: BreakdownTerm[];
}

export class BreakdownBuilder {
  private additive = 0;
  private multiplier = 1;
  private readonly terms: BreakdownTerm[] = [];

  constructor(baseLabel?: string, baseValue = 0) {
    if (baseLabel !== undefined) this.base(baseLabel, baseValue);
  }

  base(label: string, value: number, detail?: string): this {
    if (value === 0 && this.terms.length > 0) return this;
    this.additive += value;
    this.terms.push({ label, value, kind: 'base', ...(detail ? { detail } : {}) });
    return this;
  }

  /** Adds a term. Zero-valued terms are dropped so the popover stays readable. */
  add(label: string, value: number, detail?: string, fixHint?: string): this {
    if (Math.abs(value) < 1e-9) return this;
    this.additive += value;
    this.terms.push({
      label,
      value,
      kind: value >= 0 ? 'bonus' : 'penalty',
      ...(detail ? { detail } : {}),
      ...(fixHint ? { fixHint } : {}),
    });
    return this;
  }

  /** Multiplies the running total. `factor` of 1 is dropped. */
  mul(label: string, factor: number, detail?: string, fixHint?: string): this {
    if (Math.abs(factor - 1) < 1e-9) return this;
    this.multiplier *= factor;
    this.terms.push({
      label,
      value: factor,
      kind: 'multiplier',
      ...(detail ? { detail } : {}),
      ...(fixHint ? { fixHint } : {}),
    });
    return this;
  }

  /** A note with no numeric effect — used for warnings and context. */
  note(label: string, detail?: string, fixHint?: string): this {
    this.terms.push({
      label,
      value: 0,
      kind: 'info',
      ...(detail ? { detail } : {}),
      ...(fixHint ? { fixHint } : {}),
    });
    return this;
  }

  get value(): number {
    return this.additive * this.multiplier;
  }

  /** Finish, optionally clamping and rounding. */
  build(options: { min?: number; max?: number; round?: number } = {}): Breakdown {
    let total = this.additive * this.multiplier;
    if (options.min !== undefined && total < options.min) total = options.min;
    if (options.max !== undefined && total > options.max) total = options.max;
    if (options.round !== undefined) {
      const factor = 10 ** options.round;
      total = Math.round(total * factor) / factor;
    }
    return { total, terms: this.terms.slice() };
  }
}

export function emptyBreakdown(total = 0): Breakdown {
  return { total, terms: [] };
}

export function mergeBreakdowns(label: string, parts: readonly Breakdown[]): Breakdown {
  const builder = new BreakdownBuilder();
  let total = 0;
  for (const part of parts) total += part.total;
  builder.base(label, total);
  const terms: BreakdownTerm[] = [];
  for (const part of parts) terms.push(...part.terms);
  return { total, terms };
}

/** Human-readable rendering of a term's numeric contribution. */
export function formatTerm(term: BreakdownTerm): string {
  if (term.kind === 'info') return '';
  if (term.kind === 'multiplier') {
    const pct = Math.round((term.value - 1) * 100);
    return `${pct >= 0 ? '+' : ''}${pct}%`;
  }
  const rounded = Math.round(term.value * 100) / 100;
  return `${rounded >= 0 ? '+' : ''}${rounded}`;
}
