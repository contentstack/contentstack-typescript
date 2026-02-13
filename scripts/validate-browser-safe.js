#!/usr/bin/env node

/**
 * Browser Bundle Safety Validator
 * 
 * Purpose: Scan browser build output to detect Node.js-only APIs
 * This script would have CAUGHT the fs issue before release!
 * 
 * Usage: node scripts/validate-browser-safe.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// List of Node.js-only APIs that should NOT appear in browser bundle
const FORBIDDEN_PATTERNS = [
  { pattern: /require\(['"]fs['"]\)/g, name: 'fs module (require)' },
  { pattern: /require\(['"]path['"]\)/g, name: 'path module (require)' },
  { pattern: /require\(['"]crypto['"]\)/g, name: 'crypto module (require)' },
  { pattern: /import\s+.*\s+from\s+['"]fs['"]/g, name: 'fs module (import)' },
  { pattern: /import\s+.*\s+from\s+['"]path['"]/g, name: 'path module (import)' },
  { pattern: /import\s+.*\s+from\s+['"]crypto['"]/g, name: 'crypto module (import)' },
  { pattern: /process\.env/g, name: 'process.env' },
  { pattern: /__dirname/g, name: '__dirname' },
  { pattern: /__filename/g, name: '__filename' },
  { pattern: /Buffer\(/g, name: 'Buffer constructor' },
  { pattern: /require\(['"]child_process['"]\)/g, name: 'child_process module' },
  { pattern: /require\(['"]os['"]\)/g, name: 'os module' },
];

// Bundle files to validate
const BUNDLES_TO_CHECK = [
  'dist/modern/index.js',    // ESM bundle for browsers
  'dist/modern/index.cjs',   // CJS bundle
  'dist/legacy/index.js',    // Legacy ESM
  'dist/legacy/index.cjs',   // Legacy CJS
];

console.log(`${colors.blue}🔍 Browser Bundle Safety Validator${colors.reset}\n`);

let totalErrors = 0;
let totalWarnings = 0;
let filesChecked = 0;

BUNDLES_TO_CHECK.forEach(bundlePath => {
  const fullPath = path.join(__dirname, '..', bundlePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}⚠️  Skipping ${bundlePath} (not found)${colors.reset}`);
    return;
  }

  console.log(`${colors.blue}📦 Checking: ${bundlePath}${colors.reset}`);
  filesChecked++;
  
  const bundle = fs.readFileSync(fullPath, 'utf8');
  const fileErrors = [];
  
  FORBIDDEN_PATTERNS.forEach(({ pattern, name }) => {
    const matches = bundle.match(pattern);
    if (matches) {
      fileErrors.push({
        name,
        count: matches.length,
        examples: matches.slice(0, 3), // Show up to 3 examples
      });
    }
  });
  
  if (fileErrors.length > 0) {
    console.log(`${colors.red}❌ FAILED: Found Node.js-only APIs:${colors.reset}`);
    fileErrors.forEach(({ name, count, examples }) => {
      console.log(`   ${colors.red}└─ ${name}: ${count} occurrence(s)${colors.reset}`);
      examples.forEach(example => {
        console.log(`      ${colors.magenta}→ ${example}${colors.reset}`);
      });
      totalErrors += count;
    });
    console.log();
  } else {
    console.log(`${colors.green}✅ PASSED: Bundle is browser-safe${colors.reset}\n`);
  }
});

// Summary
console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}Summary:${colors.reset}`);
console.log(`  Files checked: ${filesChecked}`);
console.log(`  Errors found: ${totalErrors > 0 ? colors.red + totalErrors : colors.green + '0'}${colors.reset}`);

if (totalErrors > 0) {
  console.log(`\n${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.red}⛔ VALIDATION FAILED${colors.reset}`);
  console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`\n${colors.yellow}Your browser bundle contains Node.js-only APIs!${colors.reset}`);
  console.log(`${colors.yellow}This will cause runtime errors in browser environments.${colors.reset}\n`);
  console.log(`${colors.blue}Possible solutions:${colors.reset}`);
  console.log(`  1. Check your dependencies (@contentstack/core, @contentstack/utils)`);
  console.log(`  2. Use conditional imports (if Node.js then use X, else use Y)`);
  console.log(`  3. Add browser field in package.json to provide browser alternatives`);
  console.log(`  4. Use esbuild/webpack plugins to polyfill or exclude Node.js modules\n`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}✅ ALL BUNDLES ARE BROWSER-SAFE${colors.reset}`);
  console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  process.exit(0);
}

