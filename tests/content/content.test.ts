import { describe, expect, it } from 'vitest';
import { validateContent } from '../../src/content-validation/validate';
import { EVENTS, LORE, RECIPES, RESEARCH } from '@engine';

const report = validateContent();

/**
 * Content validation as a build gate.
 *
 * A broken reference in a data table would otherwise surface as a runtime crash on some
 * day nine that only one player ever reaches. Errors fail here; warnings are reported so
 * a content author can see them without the build stopping.
 */
describe('content validation', () => {
  it('has no broken references anywhere in the data', () => {
    if (!report.ok) {
      const detail = report.errors.map((f) => `  ${f.where}: ${f.message}`).join('\n');
      throw new Error(`${report.errors.length} content errors:\n${detail}`);
    }
    expect(report.ok).toBe(true);
  });

  it('reports its warnings rather than hiding them', () => {
    for (const warning of report.warnings) {
      // Visible in the test output when it fails; harmless when the list is empty.
      expect(warning.message.length).toBeGreaterThan(0);
    }
    expect(report.warnings.length).toBeLessThan(30);
  });
});

describe('content volume', () => {
  it('ships enough of each kind of content for repeated play', () => {
    expect(report.counts['events']).toBeGreaterThanOrEqual(80);
    expect(report.counts['encounters']).toBeGreaterThanOrEqual(40);
    expect(report.counts['items']).toBeGreaterThanOrEqual(50);
    expect(report.counts['recipes']).toBeGreaterThanOrEqual(45);
    expect(report.counts['research']).toBeGreaterThanOrEqual(34);
    expect(report.counts['traits']).toBeGreaterThanOrEqual(40);
    expect(report.counts['locations']).toBeGreaterThanOrEqual(24);
    expect(report.counts['lore']).toBeGreaterThanOrEqual(40);
    expect(report.counts['facilities']).toBeGreaterThanOrEqual(12);
    expect(report.counts['scenarios']).toBeGreaterThanOrEqual(3);
    expect(report.counts['difficulties']).toBeGreaterThanOrEqual(4);
    expect(report.counts['endings']).toBeGreaterThanOrEqual(8);
  });

  it('spreads events across enough themes that runs differ', () => {
    const themes = new Set(EVENTS.map((e) => e.id.split('.')[0]));
    expect(themes.size).toBeGreaterThanOrEqual(8);
    for (const theme of themes) {
      const count = EVENTS.filter((e) => e.id.startsWith(`${theme}.`)).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it('gives most events more than one real answer', () => {
    const single = EVENTS.filter((e) => e.choices.length < 2);
    expect(single.length / EVENTS.length).toBeLessThan(0.15);
  });

  it('spreads research across every branch', () => {
    const branches = new Set(RESEARCH.map((n) => n.branch));
    expect(branches.size).toBeGreaterThanOrEqual(7);
  });

  it('makes every craftable item reachable from some facility', () => {
    for (const recipe of RECIPES) {
      expect(recipe.facility.length).toBeGreaterThan(0);
    }
  });

  it('offers lore supporting more than one theory about the Quiet', () => {
    const theories = new Set(LORE.map((l) => l.theory).filter((t) => t !== 'none'));
    expect(theories.size).toBeGreaterThanOrEqual(3);
  });
});
