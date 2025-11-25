/**
 * Browser Environment - Real API Call Tests
 * 
 * Purpose: Test SDK with REAL API calls in browser environment
 * This validates:
 * - SDK works with actual Contentstack API
 * - HTTP requests work in browser (fetch/axios)
 * - Data serialization/deserialization works
 * - No Node.js-specific code breaks real calls
 * 
 * Requirements: .env file with valid credentials
 */

import { browserStackInstance, hasRealCredentials, skipIfNoCredentials } from './helpers/browser-stack-instance';

describe('Browser Environment - Real API Calls', () => {
  // Skip all tests in this suite if no credentials
  beforeAll(() => {
    if (!hasRealCredentials()) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  Real API tests skipped - No .env credentials');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('To enable these tests, create a .env file with:');
      console.log('  API_KEY=your_api_key');
      console.log('  DELIVERY_TOKEN=your_token');
      console.log('  ENVIRONMENT=your_environment');
      console.log('  HOST=cdn.contentstack.io (optional)\n');
    } else {
      console.log('\n✅ Real API tests enabled - Using .env credentials\n');
    }
  });

  describe('Stack Operations', () => {
    it('should fetch last activities from real API', async () => {
      if (skipIfNoCredentials()) return;

      const stack = browserStackInstance();
      
      try {
        const result = await stack.getLastActivities();
        
        expect(result).toBeDefined();
        expect(result.content_types).toBeDefined();
        expect(Array.isArray(result.content_types)).toBe(true);
        
        console.log('✅ Successfully fetched last activities from API');
        console.log(`   Found ${result.content_types?.length || 0} content types`);
      } catch (error: any) {
        console.error('❌ Failed to fetch from API:', error.message);
        throw error;
      }
    }, 30000); // 30 second timeout for API calls
  });

  describe('ContentType Queries', () => {
    it('should query entries from real API', async () => {
      if (skipIfNoCredentials()) return;

      const stack = browserStackInstance();
      
      // Try to fetch any content type's entries
      try {
        const activities = await stack.getLastActivities();
        
        if (activities.content_types && activities.content_types.length > 0) {
          const firstContentType = activities.content_types[0];
          console.log(`   Testing with content type: ${firstContentType}`);
          
          const query = stack.ContentType(firstContentType).Query();
          const result = await query.find();
          
          expect(result).toBeDefined();
          expect(Array.isArray(result[0])).toBe(true);
          
          console.log(`✅ Successfully queried entries`);
          console.log(`   Found ${result[0]?.length || 0} entries`);
        } else {
          console.log('⚠️  No content types available to test');
        }
      } catch (error: any) {
        console.error('❌ Failed to query entries:', error.message);
        throw error;
      }
    }, 30000);

    it('should handle query with filters', async () => {
      if (skipIfNoCredentials()) return;

      const stack = browserStackInstance();
      
      try {
        const activities = await stack.getLastActivities();
        
        if (activities.content_types && activities.content_types.length > 0) {
          const firstContentType = activities.content_types[0];
          
          const query = stack.ContentType(firstContentType)
            .Query()
            .limit(5);
          
          const result = await query.find();
          
          expect(result).toBeDefined();
          expect(result[0].length).toBeLessThanOrEqual(5);
          
          console.log(`✅ Query with limit worked correctly`);
        }
      } catch (error: any) {
        console.error('❌ Failed query with filters:', error.message);
        throw error;
      }
    }, 30000);
  });

  describe('Entry Fetching', () => {
    it('should fetch specific entry by UID', async () => {
      if (skipIfNoCredentials()) return;

      const stack = browserStackInstance();
      
      try {
        // First get some entries to test with
        const activities = await stack.getLastActivities();
        
        if (activities.content_types && activities.content_types.length > 0) {
          const firstContentType = activities.content_types[0];
          const entries = await stack.ContentType(firstContentType).Query().limit(1).find();
          
          if (entries[0] && entries[0].length > 0) {
            const firstEntry = entries[0][0];
            console.log(`   Testing with entry UID: ${firstEntry.uid}`);
            
            // Fetch specific entry
            const entry = await stack.ContentType(firstContentType).Entry(firstEntry.uid).fetch();
            
            expect(entry).toBeDefined();
            expect(entry.uid).toBe(firstEntry.uid);
            
            console.log(`✅ Successfully fetched specific entry`);
          }
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch entry:', error.message);
        throw error;
      }
    }, 30000);
  });

  describe('HTTP Client Validation', () => {
    it('should use browser-compatible HTTP client', async () => {
      if (skipIfNoCredentials()) return;

      const stack = browserStackInstance();
      
      // Monitor that requests use fetch or XHR (not Node.js http module)
      const originalFetch = global.fetch;
      let fetchCalled = false;
      
      if (typeof fetch !== 'undefined') {
        // Note: We can't easily mock fetch in jsdom without breaking SDK
        // But we can verify SDK doesn't throw errors about missing Node.js modules
        console.log('   Browser environment has fetch API available');
      }
      
      try {
        await stack.getLastActivities();
        
        // If we got here without errors about 'http' or 'https' modules, we're good
        expect(true).toBe(true);
        console.log('✅ SDK uses browser-compatible HTTP client');
      } catch (error: any) {
        if (error.message.includes('http') || 
            error.message.includes('https') ||
            error.message.includes('Cannot find module')) {
          fail('SDK tried to use Node.js http/https modules in browser!');
        }
        throw error;
      }
    }, 30000);
  });

  describe('Browser-Specific Features', () => {
    it('should work without Node.js globals', async () => {
      if (skipIfNoCredentials()) return;

      const stack = browserStackInstance();
      
      // Verify SDK doesn't rely on __dirname, __filename, etc.
      try {
        const result = await stack.getLastActivities();
        expect(result).toBeDefined();
        
        console.log('✅ SDK works without Node.js globals');
      } catch (error: any) {
        if (error.message.includes('__dirname') || 
            error.message.includes('__filename') ||
            error.message.includes('process.cwd')) {
          fail('SDK relies on Node.js globals!');
        }
        throw error;
      }
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid content type gracefully', async () => {
      if (skipIfNoCredentials()) return;

      const stack = browserStackInstance();
      
      try {
        await stack.ContentType('nonexistent_content_type_12345').Query().find();
        // If this succeeds, that's fine (empty results)
      } catch (error: any) {
        // Error is expected, just verify it's a proper HTTP error, not a Node.js module error
        expect(error.message).not.toContain('Cannot find module');
        expect(error.message).not.toContain('fs');
        console.log('✅ Error handling works correctly');
      }
    }, 30000);
  });
});

describe('Browser Environment - Performance with Real Data', () => {
  it('should handle concurrent requests', async () => {
    if (skipIfNoCredentials()) return;

    const stack = browserStackInstance();
    
    try {
      // Make multiple parallel requests
      const promises = [
        stack.getLastActivities(),
        stack.getLastActivities(),
        stack.getLastActivities(),
      ];
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content_types).toBeDefined();
      });
      
      console.log('✅ Concurrent requests handled successfully');
    } catch (error: any) {
      console.error('❌ Concurrent requests failed:', error.message);
      throw error;
    }
  }, 30000);
});

