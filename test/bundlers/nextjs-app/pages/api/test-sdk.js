/**
 * Next.js Server-Side API Route
 * Tests SDK in Node.js/SSR context
 * 
 * This is critical - many customers use SDK in API routes!
 */

import * as contentstackModule from '@contentstack/delivery-sdk';

const contentstack = contentstackModule.default || contentstackModule;

export default function handler(req, res) {
  const testResults = [];
  
  try {
    // Test 1: SDK Import in API route
    if (contentstack && typeof contentstack.stack === 'function') {
      testResults.push({ name: 'SDK imports in API route', passed: true });
    } else {
      testResults.push({ name: 'SDK imports in API route', passed: false, error: 'SDK not loaded' });
    }
    
    // Test 2-8: All 7 regions in API route
    const regions = ['US', 'EU', 'AZURE-NA', 'AZURE-EU', 'GCP-NA', 'GCP-EU', 'AWS-AU'];
    
    for (const region of regions) {
      try {
        const stack = contentstack.stack({
          apiKey: 'test_api_key',
          deliveryToken: 'test_delivery_token',
          environment: 'test',
          region: region,
        });
        
        if (stack && stack.config && stack.config.host) {
          testResults.push({ name: `SDK works with ${region} in API route`, passed: true });
        } else {
          testResults.push({ name: `SDK works with ${region} in API route`, passed: false, error: 'No host' });
        }
      } catch (error) {
        testResults.push({ name: `SDK works with ${region} in API route`, passed: false, error: error.message });
      }
    }
    
    // Test 7: SDK methods
    const stack = contentstack.stack({
      apiKey: 'test_api_key',
      deliveryToken: 'test_delivery_token',
      environment: 'test',
    });
    
    if (typeof stack.contentType === 'function' && typeof stack.asset === 'function') {
      testResults.push({ name: 'SDK methods available in API route', passed: true });
    } else {
      testResults.push({ name: 'SDK methods available in API route', passed: false, error: 'Methods missing' });
    }
    
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    
    res.status(200).json({
      success: failed === 0,
      passed,
      failed,
      results: testResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      results: testResults,
    });
  }
}

