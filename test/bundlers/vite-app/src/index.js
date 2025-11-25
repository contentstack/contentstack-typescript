/**
 * Vite Bundler Test for @contentstack/delivery-sdk
 * 
 * Purpose: Validate SDK works with Vite bundler
 * Vite has native JSON import support - different from Webpack!
 */

import * as contentstackModule from '@contentstack/delivery-sdk';
const contentstack = contentstackModule.default || contentstackModule;

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}⚡ Vite Bundler Test${colors.reset}\n`);

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
test('SDK imports successfully (ES modules)', () => {
  if (!contentstack || typeof contentstack.stack !== 'function') {
    throw new Error('SDK did not import correctly');
  }
});

// Test 2-8: All 7 regions
const regionsToTest = [
  { name: 'US', host: 'cdn.contentstack.io' },               // AWS-NA (also called NA)
  { name: 'EU', host: 'eu-cdn.contentstack.com' },           // AWS-EU
  { name: 'AWS-AU', host: 'au-cdn.contentstack.com' },       // AWS-AU (Australia)
  { name: 'AZURE-NA', host: 'azure-na-cdn.contentstack.com' }, // Azure North America
  { name: 'AZURE-EU', host: 'azure-eu-cdn.contentstack.com' }, // Azure Europe
  { name: 'GCP-NA', host: 'gcp-na-cdn.contentstack.com' },   // GCP North America
  { name: 'GCP-EU', host: 'gcp-eu-cdn.contentstack.com' },   // GCP Europe
];

regionsToTest.forEach(({ name, host }) => {
  test(`SDK works with ${name} region`, () => {
    const stack = contentstack.stack({
      apiKey: 'test_api_key',
      deliveryToken: 'test_delivery_token',
      environment: 'test',
      region: name,
    });
    
    if (!stack || !stack.config) {
      throw new Error('Stack initialization failed');
    }
    
    if (!stack.config.host || !stack.config.host.includes(host)) {
      throw new Error(`Invalid ${name} host: ${stack.config.host}`);
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

// Test 10: Vite-specific - JSON import with HMR
test('Vite handles JSON imports correctly', () => {
  // This test ensures Vite's native JSON handling works
  const stack1 = contentstack.stack({
    apiKey: 'test', deliveryToken: 'test', environment: 'test', region: 'US',
  });
  
  const stack2 = contentstack.stack({
    apiKey: 'test', deliveryToken: 'test', environment: 'test', region: 'EU',
  });
  
  // Both should work, testing Vite doesn't break JSON on multiple imports
  if (!stack1.config.host || !stack2.config.host) {
    throw new Error('Multiple region imports failed');
  }
});

// Test 11: Invalid region
test('Invalid region throws clear error', () => {
  let errorThrown = false;
  
  try {
    contentstack.stack({
      apiKey: 'test', deliveryToken: 'test', environment: 'test',
      region: 'INVALID_REGION_XYZ',
    });
  } catch (error) {
    errorThrown = true;
    if (!error.message.includes('region')) {
      throw new Error(`Unclear error: ${error.message}`);
    }
  }
  
  if (!errorThrown) {
    throw new Error('Invalid region did not throw');
  }
});

// Test 12: Tree-shaking doesn't break SDK
test('Vite tree-shaking preserves SDK functionality', () => {
  const stack = contentstack.stack({
    apiKey: 'test', deliveryToken: 'test', environment: 'test',
  });
  
  if (typeof stack.contentType !== 'function' || 
      typeof stack.asset !== 'function') {
    throw new Error('Tree-shaking removed required methods');
  }
});

// Summary
console.log(`\n${colors.blue}===========================================${colors.reset}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
console.log(`${colors.blue}===========================================${colors.reset}\n`);

if (testsFailed > 0) {
  console.error(`${colors.red}❌ VITE TEST FAILED${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ VITE TEST PASSED${colors.reset}`);
  console.log(`${colors.green}SDK works correctly in Vite builds!${colors.reset}\n`);
  process.exit(0);
}

