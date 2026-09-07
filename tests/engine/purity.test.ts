import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ENGINE = join(process.cwd(), 'src', 'engine');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

const files = walk(ENGINE).map((path) => ({ path, source: readFileSync(path, 'utf8') }));

/** Strip comments so a rule about code is not tripped by prose that mentions it. */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * The engine's contract, enforced.
 *
 * Determinism, headless simulation, and save/reload all rest on the engine being a pure
 * TypeScript library. These rules are cheap to break by accident and expensive to debug
 * afterwards, so they are asserted rather than documented.
 */
describe('engine purity', () => {
  it('finds engine sources to check', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('never calls Math.random outside the seed generator', () => {
    // `generateSeed` takes entropy as an injectable parameter and defaults to Math.random;
    // that default is the one place in the engine where non-determinism is the point.
    const allowed = join('src', 'engine', 'core', 'rng.ts');
    const offenders = files
      .filter((f) => /Math\s*\.\s*random/.test(code(f.source)))
      .map((f) => relative(process.cwd(), f.path))
      .filter((path) => path !== allowed);
    expect(offenders, 'use the seeded Rng instead').toEqual([]);
  });

  it('never reads the wall clock', () => {
    const offenders = files
      .filter((f) => /Date\s*\.\s*now|new\s+Date\s*\(/.test(code(f.source)))
      .map((f) => relative(process.cwd(), f.path));
    expect(offenders, 'time is measured in days; pass a timestamp in if one is needed').toEqual([]);
  });

  it('never touches the DOM or browser globals', () => {
    const offenders = files
      .filter((f) => /\b(document|window|localStorage|indexedDB|navigator)\s*\./.test(code(f.source)))
      .map((f) => relative(process.cwd(), f.path));
    expect(offenders, 'the engine must run headless in Node').toEqual([]);
  });

  it('never imports React or anything from the UI', () => {
    const offenders = files
      .filter((f) => /from\s+['"](react|react-dom|@ui\/|@store\/|@save\/)/.test(f.source))
      .map((f) => relative(process.cwd(), f.path));
    expect(offenders, 'the engine is the bottom layer and depends on nothing above it').toEqual([]);
  });

  it('keeps timers out of the simulation', () => {
    const offenders = files
      .filter((f) => /\b(setTimeout|setInterval|requestAnimationFrame)\s*\(/.test(code(f.source)))
      .map((f) => relative(process.cwd(), f.path));
    expect(offenders).toEqual([]);
  });

  it('leaves no unresolved TODO markers in shipped engine code', () => {
    const offenders = files
      .filter((f) => /\b(TODO|FIXME|XXX|HACK)\b/.test(f.source))
      .map((f) => relative(process.cwd(), f.path));
    expect(offenders).toEqual([]);
  });
});
