/**
 * Next.js Client-Side Test
 * Tests SDK in browser context (most important for region configuration)
 */

import { useEffect, useState } from 'react';
import * as contentstackModule from '@contentstack/delivery-sdk';

const contentstack = contentstackModule.default || contentstackModule;

export default function Home() {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const runTests = async () => {
      const testResults = [];
      
      // Test 1: SDK Import
      try {
        if (contentstack && typeof contentstack.stack === 'function') {
          testResults.push({ name: 'SDK imports in browser', passed: true });
        } else {
          testResults.push({ name: 'SDK imports in browser', passed: false, error: 'SDK not loaded' });
        }
      } catch (error) {
        testResults.push({ name: 'SDK imports in browser', passed: false, error: error.message });
      }
      
      // Test 2-8: All 7 regions in browser
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
            testResults.push({ name: `SDK works with ${region} in browser`, passed: true });
          } else {
            testResults.push({ name: `SDK works with ${region} in browser`, passed: false, error: 'No host' });
          }
        } catch (error) {
          testResults.push({ name: `SDK works with ${region} in browser`, passed: false, error: error.message });
        }
      }
      
      // Test 7: SDK methods available
      try {
        const stack = contentstack.stack({
          apiKey: 'test_api_key',
          deliveryToken: 'test_delivery_token',
          environment: 'test',
        });
        
        if (typeof stack.contentType === 'function' && typeof stack.asset === 'function') {
          testResults.push({ name: 'SDK methods available in browser', passed: true });
        } else {
          testResults.push({ name: 'SDK methods available in browser', passed: false, error: 'Methods missing' });
        }
      } catch (error) {
        testResults.push({ name: 'SDK methods available in browser', passed: false, error: error.message });
      }
      
      setResults(testResults);
      
      // Write results to div for test runner to read
      const resultsDiv = document.getElementById('test-results');
      if (resultsDiv) {
        resultsDiv.textContent = JSON.stringify(testResults);
      }
    };
    
    runTests();
  }, []);
  
  return (
    <div>
      <h1>Next.js Browser Test</h1>
      <div id="test-results" style={{ display: 'none' }}>
        {JSON.stringify(results)}
      </div>
      {results.map((result, i) => (
        <div key={i} style={{ color: result.passed ? 'green' : 'red' }}>
          {result.passed ? '✓' : '✗'} {result.name}
          {result.error && ` - ${result.error}`}
        </div>
      ))}
    </div>
  );
}

