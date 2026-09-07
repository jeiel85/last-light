#!/usr/bin/env tsx
/**
 * Content validation.
 *
 *   npm run validate            report everything, exit non-zero on any error
 *   npm run validate -- --quiet only print the summary and any errors
 *
 * The same checks run as a vitest suite, so a broken reference fails the build as well as
 * this command.
 */

import { validateContent } from '../src/content-validation/validate';

const quiet = process.argv.includes('--quiet');
const report = validateContent();

const RESET = '[0m';
const RED = '[31m';
const YELLOW = '[33m';
const GREEN = '[32m';
const DIM = '[2m';

console.log('');
console.log('══ LAST LIGHT — content validation ═══════════════════════════════');

const counts = Object.entries(report.counts);
const width = Math.max(...counts.map(([name]) => name.length));
for (const [name, value] of counts) {
  console.log(`  ${DIM}${name.padEnd(width)}${RESET}  ${String(value).padStart(4)}`);
}
console.log('');

if (report.errors.length > 0) {
  console.log(`${RED}  ${report.errors.length} error${report.errors.length === 1 ? '' : 's'}${RESET}`);
  for (const finding of report.errors) {
    console.log(`${RED}    ✗ ${finding.where}${RESET} — ${finding.message}`);
  }
  console.log('');
}

if (report.warnings.length > 0 && !quiet) {
  console.log(`${YELLOW}  ${report.warnings.length} warning${report.warnings.length === 1 ? '' : 's'}${RESET}`);
  for (const finding of report.warnings) {
    console.log(`${YELLOW}    ▲ ${finding.where}${RESET} — ${finding.message}`);
  }
  console.log('');
} else if (report.warnings.length > 0) {
  console.log(`${YELLOW}  ${report.warnings.length} warnings (hidden by --quiet)${RESET}`);
  console.log('');
}

if (report.ok) {
  console.log(`${GREEN}  All references resolve.${RESET}`);
} else {
  console.log(`${RED}  Content is broken. Fix the errors above before building.${RESET}`);
}
console.log('══════════════════════════════════════════════════════════════════');
console.log('');

process.exit(report.ok ? 0 : 1);
