/**
 * Rollup Bundler Test for @contentstack/delivery-sdk
 * 
 * Rollup is widely used for library bundling
 * Tests ESM bundling with JSON imports
 */

import * as contentstackModule from '@contentstack/delivery-sdk';
const contentstack = contentstackModule.default || contentstackModule;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}📦 Rollup Bundler Test${colors.reset}\n`);

let testsFailed = 0;
let testsPassed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} ${name}`);
    console.error(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    testsFailed++;
  }
}

// Test 1: SDK Import
test('SDK imports successfully', () => {
  if (!contentstack || typeof contentstack.stack !== 'function') {
    throw new Error('SDK not loaded');
  }
});

// Test 2-8: All 7 regions
const regions = [
  { name: 'US', check: 'cdn.contentstack.io' },               // AWS-NA (also called NA)
  { name: 'EU', check: 'eu-cdn.contentstack.com' },           // AWS-EU
  { name: 'AWS-AU', check: 'au-cdn.contentstack.com' },       // AWS-AU (Australia)
  { name: 'AZURE-NA', check: 'azure-na-cdn.contentstack.com' }, // Azure North America
  { name: 'AZURE-EU', check: 'azure-eu-cdn.contentstack.com' }, // Azure Europe
  { name: 'GCP-NA', check: 'gcp-na-cdn.contentstack.com' },   // GCP North America
  { name: 'GCP-EU', check: 'gcp-eu-cdn.contentstack.com' },   // GCP Europe
];

regions.forEach(({ name, check }) => {
  test(`SDK works with ${name} region`, () => {
    const stack = contentstack.stack({
      apiKey: 'test_key',
      deliveryToken: 'test_token',
      environment: 'test',
      region: name,
    });
    
    if (!stack || !stack.config || !stack.config.host || !stack.config.host.includes(check)) {
      throw new Error(`Invalid ${name} host: ${stack.config?.host}`);
    }
  });
});

// Test 9: Custom Region/Host Support
test('SDK works with custom host', () => {
  const stack = contentstack.stack({
    apiKey: 'test',
    deliveryToken: 'test',
    environment: 'test',
    host: 'custom-cdn.example.com',
  });
  
  if (!stack || !stack.config || !stack.config.host.includes('custom-cdn.example.com')) {
    throw new Error('Custom host not set');
  }
});

// Test 10: Rollup JSON plugin works
test('Rollup handles JSON imports correctly', () => {
  // If we got here, region data was bundled correctly
  const stack1 = contentstack.stack({
    apiKey: 'test', deliveryToken: 'test', environment: 'test', region: 'US',
  });
  
  const stack2 = contentstack.stack({
    apiKey: 'test', deliveryToken: 'test', environment: 'test', region: 'EU',
  });
  
  if (!stack1.config.host || !stack2.config.host) {
    throw new Error('JSON import failed');
  }
});

// Test 11: Tree-shaking preserves SDK
test('Rollup tree-shaking preserves SDK functionality', () => {
  const stack = contentstack.stack({
    apiKey: 'test', deliveryToken: 'test', environment: 'test',
  });
  
  if (typeof stack.contentType !== 'function' || typeof stack.asset !== 'function') {
    throw new Error('Tree-shaking removed SDK methods');
  }
});

// Summary
console.log(`\n${colors.blue}===========================================${colors.reset}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
console.log(`${colors.blue}===========================================${colors.reset}\n`);

if (testsFailed > 0) {
  console.error(`${colors.red}❌ ROLLUP TEST FAILED${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ ROLLUP TEST PASSED${colors.reset}`);
  console.log(`${colors.green}SDK works correctly in Rollup builds!${colors.reset}\n`);
  process.exit(0);
}

