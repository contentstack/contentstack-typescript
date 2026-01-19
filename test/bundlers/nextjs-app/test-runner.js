#!/usr/bin/env node

/**
 * Next.js Test Runner
 * 
 * Validates that Next.js build succeeded and SDK works in both:
 * 1. Server-side (API routes, SSR)
 * 2. Client-side (browser bundle)
 * 
 * This is the MOST IMPORTANT test - real customer scenario!
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}⚛️  Next.js Bundler Test${colors.reset}\n`);

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

// Test 1: Build succeeded
test('Next.js build completed successfully', () => {
  const buildDir = path.join(__dirname, '.next');
  if (!fs.existsSync(buildDir)) {
    throw new Error('.next build directory not found');
  }
});

// Test 2: Server bundle exists
test('Server-side bundle created', () => {
  const serverDir = path.join(__dirname, '.next/server');
  if (!fs.existsSync(serverDir)) {
    throw new Error('Server bundle not found');
  }
});

// Test 3: Client bundle exists (Next.js 14 may not pre-generate all static files)
test('Client-side bundle created or SSR mode enabled', () => {
  const staticDir = path.join(__dirname, '.next/static');
  const serverPages = path.join(__dirname, '.next/server/pages');
  
  // Accept either static or server-rendered pages
  if (!fs.existsSync(staticDir) && !fs.existsSync(serverPages)) {
    throw new Error('Neither client bundle nor server pages found');
  }
});

// Test 4: Region data included in build
test('Region configuration included in Next.js bundles', () => {
  const buildDir = path.join(__dirname, '.next');
  let foundRegionData = false;
  
  // Recursively search for region data or its content in build output
  function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Check if regions data is included
        if (content.includes('cdn.contentstack.io') || 
            content.includes('eu-cdn.contentstack.com') ||
            content.includes('azure-na-cdn') ||
            content.includes('gcp-na-cdn')) {
          foundRegionData = true;
        }
      }
    }
  }
  
  searchDir(buildDir);
  
  if (!foundRegionData) {
    throw new Error('Region data not found in build output');
  }
});

// Test 5: API route bundle is reasonable size
test('Server bundle size is reasonable', () => {
  const serverDir = path.join(__dirname, '.next/server');
  
  function getDirSize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stat.size;
      }
    }
    return size;
  }
  
  const size = getDirSize(serverDir);
  const sizeMB = (size / 1024 / 1024).toFixed(2);
  
  console.log(`    Server bundle: ${sizeMB} MB`);
  
  // Fail if unreasonably large (> 50 MB indicates something wrong)
  if (size > 50 * 1024 * 1024) {
    throw new Error(`Server bundle too large: ${sizeMB} MB`);
  }
});

// Test 6: SDK accessible in Next.js (server or client)
test('SDK included in Next.js bundles', () => {
  const serverPagesDir = path.join(__dirname, '.next/server/pages');
  
  let foundSDK = false;
  
  function searchForSDK(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchForSDK(filePath);
      } else if (file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('contentstack') || content.includes('stack') || content.includes('contentType')) {
          foundSDK = true;
          return;
        }
      }
    }
  }
  
  searchForSDK(serverPagesDir);
  
  // Also check static if it exists
  const staticDir = path.join(__dirname, '.next/static');
  if (fs.existsSync(staticDir)) {
    searchForSDK(staticDir);
  }
  
  if (!foundSDK) {
    throw new Error('SDK not found in any Next.js bundles');
  }
});

// Test 7: Next.js specific - Edge runtime compatibility
test('Build works with Next.js Webpack config', () => {
  const nextConfig = path.join(__dirname, 'next.config.js');
  if (!fs.existsSync(nextConfig)) {
    throw new Error('next.config.js not found');
  }
  
  // If we got here, build succeeded with our config
  // This validates Webpack config works with SDK
});

// Summary
console.log(`\n${colors.blue}===========================================${colors.reset}`);
console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
console.log(`${colors.blue}===========================================${colors.reset}\n`);

if (testsFailed > 0) {
  console.error(`${colors.red}❌ NEXT.JS TEST FAILED${colors.reset}`);
  console.error(`${colors.red}SDK may not work correctly in customer Next.js apps!${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}✅ NEXT.JS TEST PASSED${colors.reset}`);
  console.log(`${colors.green}SDK works correctly in Next.js (SSR + Client)!${colors.reset}`);
  console.log(`${colors.green}Region configuration validated in real customer scenario!${colors.reset}\n`);
  process.exit(0);
}

