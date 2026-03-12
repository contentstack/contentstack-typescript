/**
 * Webpack Bundler Test for @contentstack/delivery-sdk
 * 
 * Purpose: Validate SDK works with Webpack bundler
 * This catches the EXACT issue that broke production!
 * 
 * Tests:
 * 1. Basic SDK import
 * 2. Region configuration with all regions (US, EU, AZURE, GCP)
 * 3. Invalid region error handling
 * 4. SDK initialization in bundled code
 */

const contentstackModule = require('@contentstack/delivery-sdk');
const contentstack = contentstackModule.default || contentstackModule;

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}🔧 Webpack Bundler Test${colors.reset}\n`);

let testsFailed = 0;
let testsPassed = 0;

/**
 * Test helper
 */
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

// Test 1: Basic SDK Import
test('SDK imports successfully', () => {
  if (!contentstack || typeof contentstack.stack !== 'function') {
    throw new Error('SDK did not import correctly');
  }
});

// Test 2: Region data is bundled correctly
test('Region configuration file is accessible in bundle', () => {
  // Try to initialize with a region - this REQUIRES region data
  // If region data wasn't bundled, this will fail
  try {
    const stack = contentstack.stack({
      apiKey: 'test_api_key',
      deliveryToken: 'test_delivery_token',
      environment: 'test',
      region: 'US', // This internally reads region data
    });
    
    // If we got here, region data was successfully bundled and read
    if (!stack || !stack.config || !stack.config.host) {
      throw new Error('Region data not loaded - no host configured');
    }
  } catch (error) {
    // If error contains "Cannot find module" or similar, region data wasn't bundled
    if (error.message.includes('Cannot find') || error.message.includes('not found')) {
      throw new Error('Region data was NOT bundled correctly: ' + error.message);
    }
    throw error;
  }
});

// Test 3: US Region
test('SDK works with US region', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    region: 'US', // Uses region data internally
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // Verify host was set correctly from region data
  if (!stack.config.host || !stack.config.host.includes('cdn.contentstack.io')) {
    throw new Error(`Invalid host: ${stack.config.host}`);
  }
});

// Test 4: EU Region
test('SDK works with EU region', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    region: 'EU', // Uses region data
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // EU should resolve to eu-cdn.contentstack.com or .io
  if (!stack.config.host || !stack.config.host.includes('eu-cdn.contentstack.com')) {
    throw new Error(`Invalid EU host: ${stack.config.host}`);
  }
});

// Test 5: AZURE-NA Region
test('SDK works with AZURE-NA region', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    region: 'AZURE-NA', // Uses region data
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // AZURE-NA should resolve to azure-na-cdn.contentstack.com
  if (!stack.config.host || !stack.config.host.includes('azure-na-cdn.contentstack.com')) {
    throw new Error(`Invalid AZURE-NA host: ${stack.config.host}`);
  }
});

// Test 6: AZURE-EU Region
test('SDK works with AZURE-EU region', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    region: 'AZURE-EU', // Uses region data
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // AZURE-EU should resolve to azure-eu-cdn.contentstack.com
  if (!stack.config.host || !stack.config.host.includes('azure-eu-cdn.contentstack.com')) {
    throw new Error(`Invalid AZURE-EU host: ${stack.config.host}`);
  }
});

// Test 7: GCP-NA Region
test('SDK works with GCP-NA region', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    region: 'GCP-NA', // Uses region data
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // GCP-NA should resolve to gcp-na-cdn.contentstack.com
  if (!stack.config.host || !stack.config.host.includes('gcp-na-cdn.contentstack.com')) {
    throw new Error(`Invalid GCP-NA host: ${stack.config.host}`);
  }
});

// Test 8: GCP-EU Region
test('SDK works with GCP-EU region', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    region: 'GCP-EU', // Uses region data
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // GCP-EU should resolve to gcp-eu-cdn.contentstack.com
  if (!stack.config.host || !stack.config.host.includes('gcp-eu-cdn.contentstack.com')) {
    throw new Error(`Invalid GCP-EU host: ${stack.config.host}`);
  }
});

// Test 9: AWS-AU Region
test('SDK works with AWS-AU region', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    region: 'AWS-AU', // Uses region data
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // AWS-AU should resolve to au-cdn.contentstack.com
  if (!stack.config.host || !stack.config.host.includes('au-cdn.contentstack.com')) {
    throw new Error(`Invalid AWS-AU host: ${stack.config.host}`);
  }
});

// Test 10: Custom Region/Host Support
test('SDK works with custom host', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
    host: 'custom-cdn.example.com', // Custom host
  });
  
  if (!stack || !stack.config) {
    throw new Error('Stack initialization failed');
  }
  
  // Custom host should be respected
  if (!stack.config.host || !stack.config.host.includes('custom-cdn.example.com')) {
    throw new Error(`Custom host not set: ${stack.config.host}`);
  }
});

// Test 11: Invalid Region Error Handling (Fail fast with clear errors)
test('Invalid region throws clear error', () => {
  let errorThrown = false;
  let errorMessage = '';
  
  try {
    const stack = contentstack.stack({
      apiKey: 'test_api_key',
      deliveryToken: 'test_delivery_token',
      environment: 'test',
      region: 'INVALID_REGION_12345', // Should throw error
    });
  } catch (error) {
    errorThrown = true;
    errorMessage = error.message;
  }
  
  if (!errorThrown) {
    throw new Error('Invalid region did not throw error');
  }
  
  // Verify error message is helpful
  if (!errorMessage.includes('region')) {
    throw new Error(`Unclear error message: ${errorMessage}`);
  }
});

// Test 12: Region Aliases Work (aws_na, NA, US should all work)
test('Region aliases work correctly', () => {
  const aliases = ['aws_na', 'NA', 'US'];
  
  aliases.forEach(alias => {
    const stack = contentstack.stack({
      apiKey: 'test_api_key',
      deliveryToken: 'test_delivery_token',
      environment: 'test',
      region: alias,
    });
    
    if (!stack || !stack.config) {
      throw new Error(`Alias "${alias}" failed`);
    }
  });
});

// Test 13: Stack Methods Are Available
test('SDK methods are available after bundling', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
  });
  
  // Verify critical methods exist
  if (typeof stack.contentType !== 'function') {
    throw new Error('contentType method missing');
  }
  
  if (typeof stack.asset !== 'function') {
    throw new Error('asset method missing');
  }
  
  if (typeof stack.getLastActivities !== 'function') {
    throw new Error('getLastActivities method missing');
  }
});

// Test 14: ContentType Can Be Created
test('ContentType can be created', () => {
  const stack = contentstack.stack({
    apiKey: 'test_api_key',
    deliveryToken: 'test_delivery_token',
    environment: 'test',
  });
  
  const contentType = stack.contentType('test_ct');
  
  if (!contentType) {
    throw new Error('ContentType creation failed');
  }
  
  if (typeof contentType.entry !== 'function') {
    throw new Error('ContentType.entry method missing');
  }
});

// Summary
console.log(`\n${colors.blue}===========================================${colors.reset}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
console.log(`${colors.blue}===========================================${colors.reset}\n`);

if (testsFailed > 0) {
  console.error(`${colors.red}❌ WEBPACK TEST FAILED${colors.reset}`);
  console.error(`${colors.red}SDK may not work correctly in customer Webpack builds!${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ WEBPACK TEST PASSED${colors.reset}`);
  console.log(`${colors.green}SDK works correctly in Webpack builds!${colors.reset}\n`);
  process.exit(0);
}

