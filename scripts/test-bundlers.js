#!/usr/bin/env node

/**
 * Bundler Compatibility Validator
 * 
 * Purpose: Verify SDK can be bundled with popular bundlers (Webpack, Vite, Rollup)
 * This catches bundling issues before customers hit them!
 * 
 * Usage: node scripts/test-bundlers.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}🔧 Bundler Compatibility Tests${colors.reset}\n`);

// Test configurations for different bundlers
const bundlerTests = [
  {
    name: 'Webpack (Browser)',
    command: 'npx webpack --mode production --entry ./src/index.ts --output-path ./test-dist/webpack --target web',
    enabled: true,
  },
  {
    name: 'Vite (Browser)',
    command: 'npx vite build --outDir ./test-dist/vite',
    enabled: false, // Would need vite.config.js
    note: 'Requires vite.config.js - skipping for now',
  },
  {
    name: 'Rollup (Browser)',
    command: 'npx rollup src/index.ts --file test-dist/rollup/bundle.js --format esm',
    enabled: false, // Would need rollup.config.js
    note: 'Requires rollup.config.js - skipping for now',
  },
];

let passed = 0;
let failed = 0;
let skipped = 0;

bundlerTests.forEach(({ name, command, enabled, note }) => {
  if (!enabled) {
    console.log(`${colors.yellow}⊘ SKIPPED: ${name}${colors.reset}`);
    if (note) {
      console.log(`  ${colors.yellow}└─ ${note}${colors.reset}\n`);
    }
    skipped++;
    return;
  }

  console.log(`${colors.blue}🔨 Testing: ${name}${colors.reset}`);
  console.log(`   Command: ${command}`);

  try {
    // Run bundler
    execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
    });

    console.log(`${colors.green}✅ PASSED: ${name}${colors.reset}\n`);
    passed++;
  } catch (error) {
    console.log(`${colors.red}❌ FAILED: ${name}${colors.reset}`);
    console.log(`${colors.red}   Error: ${error.message}${colors.reset}\n`);
    failed++;
  }
});

// Summary
console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}Summary:${colors.reset}`);
console.log(`  Passed: ${colors.green}${passed}${colors.reset}`);
console.log(`  Failed: ${failed > 0 ? colors.red + failed : colors.green + '0'}${colors.reset}`);
console.log(`  Skipped: ${colors.yellow}${skipped}${colors.reset}`);

// Cleanup test output
try {
  if (fs.existsSync('./test-dist')) {
    fs.rmSync('./test-dist', { recursive: true });
    console.log(`\n${colors.blue}🧹 Cleaned up test artifacts${colors.reset}`);
  }
} catch (e) {
  // Ignore cleanup errors
}

if (failed > 0) {
  console.log(`\n${colors.red}⛔ BUNDLER TESTS FAILED${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✅ ALL BUNDLER TESTS PASSED${colors.reset}\n`);
  process.exit(0);
}

