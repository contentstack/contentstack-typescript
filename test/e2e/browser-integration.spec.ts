/**
 * End-to-End Browser Integration Tests (Phase 2)
 * 
 * Purpose: Test SDK in REAL browsers (Chrome, Firefox, Safari)
 * This catches browser-specific issues that jsdom simulation misses!
 * 
 * What This Tests:
 * - SDK loads without errors
 * - All 7 regions work in real browser
 * - No Node.js module errors
 * - Cross-browser compatibility
 * 
 * Prerequisites:
 *   npm install --save-dev @playwright/test
 *   npx playwright install
 * 
 * Usage:
 *   npm run test:e2e
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extend Window interface for test results
declare global {
  interface Window {
    testResults?: {
      total: number;
      passed: number;
      failed: number;
      consoleErrors: string[];
    };
  }
}

test.describe('SDK in Real Browser Environment', () => {
  
  test.beforeEach(async ({ page }) => {
    // Capture browser console (only errors)
    page.on('pageerror', error => {
      console.error('[Browser Error]:', error);
    });
    
    // Load test page with SDK (via HTTP server to avoid CORS)
    const testPageUrl = 'http://localhost:8765/test/e2e/test-page.html';
    await page.goto(testPageUrl);
    
    // Wait for tests to complete
    await page.waitForFunction(() => window.testResults !== undefined, { timeout: 10000 });
  });

  test('SDK should load in browser without errors', async ({ page }) => {
    // Get test results from page
    const results = await page.evaluate(() => window.testResults);
    
    expect(results).toBeDefined();
    
    if (!results) {
      throw new Error('Test results not found on window object');
    }
    
    // Print failures if any
    if (results.failed > 0) {
      console.log(`\n❌ ${results.failed} test(s) failed in browser HTML tests`);
      console.log('Check the browser UI at http://localhost:8765/test/e2e/test-page.html for details\n');
    }
    
    expect(results.failed).toBe(0);
    expect(results.passed).toBeGreaterThan(0);
    
    // Verify no Node.js module errors
    const nodeModuleErrors = results.consoleErrors.filter((err: string) => 
      err.includes('fs') || err.includes('path') || err.includes('crypto')
    );
    
    expect(nodeModuleErrors.length).toBe(0);
  });

  test('SDK should initialize Stack in browser', async ({ page }) => {
    // Verify stack initialization works
    const result = await page.evaluate(() => {
      const sdk = (window as any).ContentstackSDK?.default || (window as any).ContentstackSDK;
      if (!sdk || typeof sdk.stack !== 'function') {
        return { success: false, error: 'SDK not loaded', sdkKeys: Object.keys(sdk || {}) };
      }
      
      try {
        const stackInstance = sdk.stack({
          apiKey: 'test_api_key',
          deliveryToken: 'test_delivery_token',
          environment: 'test',
        });
        
        return {
          success: true,
          hasConfig: !!stackInstance.config,
          hasContentType: typeof stackInstance.contentType === 'function',
          hasAsset: typeof stackInstance.asset === 'function'
        };
      } catch (error: any) {
        return { success: false, error: error.message, stack: error.stack };
      }
    });
    
    if (!result.success) {
      console.log('SDK initialization failed:', result);
    }
    
    expect(result.success).toBe(true);
    expect(result.hasConfig).toBe(true);
    expect(result.hasContentType).toBe(true);
    expect(result.hasAsset).toBe(true);
  });

  test('SDK should not throw Node.js module errors', async ({ page }) => {
    const results = await page.evaluate(() => window.testResults);
    
    if (!results) {
      throw new Error('Test results not found on window object');
    }
    
    // Check for Node.js module errors
    const nodeModuleErrors = results.consoleErrors.filter((err: string) => 
      err.toLowerCase().includes('fs') || 
      err.toLowerCase().includes('path') || 
      err.toLowerCase().includes('crypto') ||
      err.toLowerCase().includes('cannot find module')
    );
    
    if (nodeModuleErrors.length > 0) {
      console.log('❌ CRITICAL: SDK tried to use Node.js modules in browser!');
      console.log('   Errors:', nodeModuleErrors);
    }
    
    expect(nodeModuleErrors.length).toBe(0);
  });

  test('All 7 regions work in browser', async ({ page }) => {
    // Test all regions resolve correctly
    const regionTests = await page.evaluate(() => {
      const sdk = (window as any).ContentstackSDK?.default || (window as any).ContentstackSDK;
      const regions = ['US', 'EU', 'AWS-AU', 'AZURE-NA', 'AZURE-EU', 'GCP-NA', 'GCP-EU'];
      const results: any[] = [];
      
      for (const region of regions) {
        try {
          const stack = sdk.stack({
            apiKey: 'test',
            deliveryToken: 'test',
            environment: 'test',
            region: region
          });
          
          results.push({
            region,
            success: true,
            host: stack.config.host
          });
        } catch (error: any) {
          results.push({
            region,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    });
    
    // All regions should succeed
    regionTests.forEach(test => {
      expect(test.success).toBe(true);
      expect(test.host).toBeTruthy();
    });
    
    expect(regionTests.length).toBe(7);
  });
  
});

test.describe('Browser API Compatibility', () => {
  
  test('should use fetch API for HTTP requests', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    
    page.on('request', (request) => {
      requests.push(request.url());
    });

    // TODO: Trigger SDK API call
    // await page.goto('/test-sdk.html');
    // await page.evaluate(() => {
    //   const stack = ContentstackSDK.Stack({ ... });
    //   return stack.ContentType('test').Query().find();
    // });
    
    // Verify fetch was used (not Node.js http module)
  });

  test('should work with localStorage', async ({ page }) => {
    // TODO: Test SDK uses localStorage correctly
    // await page.goto('/test-sdk.html');
    
    // const localStorageUsed = await page.evaluate(() => {
    //   return localStorage.getItem('contentstack_test') !== null;
    // });
  });
});

test.describe('Cross-Browser Compatibility', () => {
  
  test('should work identically across browsers', async ({ page, browserName }) => {
    console.log(`Testing in: ${browserName}`);
    
    // TODO: Same test across Chrome, Firefox, Safari
    // This ensures SDK works everywhere
    
    // await page.goto('/test-sdk.html');
    // const result = await page.evaluate(() => {
    //   const stack = ContentstackSDK.Stack({ ... });
    //   return typeof stack.ContentType === 'function';
    // });
    
    // expect(result).toBe(true);
  });
});

