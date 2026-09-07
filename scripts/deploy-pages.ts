#!/usr/bin/env tsx
/**
 * Build for GitHub Pages.
 *
 *   npm run deploy:pages                 build for /<repo>/ inferred from the git remote
 *   npm run deploy:pages -- --base /x/   build for an explicit base path
 *
 * This produces `dist/` and nothing more: publishing is left to whatever the project uses
 * (a Pages workflow, `gh-pages`, or a manual upload). A deploy script that also pushes is
 * a deploy script that pushes something you did not mean to.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/** A project page is served from /<repo>/, so the bundle needs that base. */
function inferBase(): string {
  const explicit = argValue('--base');
  if (explicit) return explicit.endsWith('/') ? explicit : `${explicit}/`;

  try {
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const match = /[:/]([^/]+)\/([^/]+?)(?:\.git)?$/.exec(remote);
    const repo = match?.[2];
    const owner = match?.[1];
    if (!repo || !owner) return '/';
    // A user or organisation page is served from the domain root.
    if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) return '/';
    return `/${repo}/`;
  } catch {
    console.warn('No git remote found; building for the domain root.');
    return '/';
  }
}

const base = inferBase();
console.log(`Building for base path ${base}`);

/*
 * Run the build steps through node directly rather than through npm. `npm` is a shell
 * script on Windows, and reaching it would mean `shell: true`, which concatenates
 * arguments unescaped — a base path is user input, so that is worth avoiding.
 */
const run = (script: string, args: string[]): void => {
  execFileSync(process.execPath, [resolve(root, script), ...args], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, LASTLIGHT_BASE: base },
  });
};

run('node_modules/tsx/dist/cli.mjs', ['scripts/generate-icons.ts']);
run('node_modules/typescript/bin/tsc', ['-b']);
run('node_modules/vite/bin/vite.js', ['build']);

const dist = resolve(root, 'dist');
if (!existsSync(dist)) throw new Error('The build produced no dist/ directory.');

// Pages runs Jekyll over the output unless told not to, which eats files beginning with _.
writeFileSync(resolve(dist, '.nojekyll'), '');

// The game is a single page with no routing, but a stray deep link should still load it.
copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));

console.log('');
console.log('dist/ is ready to publish.');
console.log(`  base path      ${base}`);
console.log('  next step      publish dist/ to the gh-pages branch, or upload it anywhere static');
console.log('');
