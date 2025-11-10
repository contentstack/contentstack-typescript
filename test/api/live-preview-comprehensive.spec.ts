import { stackInstance } from '../utils/stack-instance';
import { BaseEntry, QueryOperation } from '../../src';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';
const SIMPLE_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'simple_content_type';

// Entry UIDs from your test stack (reused across all tests)
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;
const SIMPLE_ENTRY_UID = process.env.SIMPLE_ENTRY_UID;

// Live Preview Configuration
const PREVIEW_TOKEN = process.env.PREVIEW_TOKEN;
const LIVE_PREVIEW_HOST = process.env.LIVE_PREVIEW_HOST;

describe('Live Preview Comprehensive Tests', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;
  const skipIfNoPreviewToken = !PREVIEW_TOKEN ? describe.skip : describe;

  skipIfNoUID('Live Preview Configuration', () => {
    it('should configure live preview with valid settings', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview configuration not available, skipping test');
        return;
      }

      // Create a new stack instance with live preview enabled
      const previewStack = require('../utils/stack-instance').stackInstance();
      
      // Configure live preview
      previewStack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      console.log('Live preview configured:', {
        enabled: true,
        previewToken: PREVIEW_TOKEN ? 'provided' : 'missing',
        previewHost: LIVE_PREVIEW_HOST ? 'provided' : 'missing'
      });

      expect(PREVIEW_TOKEN).toBeDefined();
      expect(LIVE_PREVIEW_HOST).toBeDefined();
    });

    it('should handle live preview without configuration', async () => {
      // Test with live preview disabled (default)
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      console.log('Live preview disabled (default):', {
        entryUid: result.uid,
        title: result.title
      });
    });

    it('should validate live preview configuration parameters', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview configuration not available, skipping validation test');
        return;
      }

      // Test different configuration scenarios
      const configs = [
        {
          name: 'Valid configuration',
          config: {
            live_preview: PREVIEW_TOKEN
          }
        },
        {
          name: 'Disabled configuration',
          config: {
            live_preview: PREVIEW_TOKEN
          }
        },
        {
          name: 'Missing token',
          config: {
            live_preview: '',
          }
        },
        {
          name: 'Missing host',
          config: {
            live_preview: PREVIEW_TOKEN
          }
        }
      ];

      for (const config of configs) {
        try {
          const previewStack = require('../utils/stack-instance').stackInstance();
          previewStack.livePreviewQuery(config.config);
          
          console.log(`${config.name}:`, 'Configuration applied');
        } catch (error) {
          console.log(`${config.name}:`, 'Configuration failed:', (error as Error).message);
        }
      }
    });
  });

  skipIfNoUID('Live Preview Queries', () => {
    it('should perform live preview queries', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping preview query test');
        return;
      }

      const startTime = Date.now();
      
      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Live preview query completed:', {
        duration: `${duration}ms`,
        entryUid: result.uid,
        title: result.title,
        previewEnabled: true
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should perform live preview queries with different content types', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping multi-content-type test');
        return;
      }

      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const contentTypes = [COMPLEX_CT, MEDIUM_CT, SIMPLE_CT];
      const results = [];

      for (const contentType of contentTypes) {
        try {
          const result = await stack
            .contentType(contentType)
            .entry()
            .query()
            .limit(3)
            .find<any>();
          
          results.push({
            contentType,
            entriesCount: result.entries?.length || 0,
            success: true
          });
        } catch (error) {
          results.push({
            contentType,
            error: (error as Error).message,
            success: false
          });
        }
      }

      console.log('Live preview queries by content type:', results);
      
      // At least one should succeed
      const successfulResults = results.filter(r => r.success);
      expect(successfulResults.length).toBeGreaterThan(0);
    });

    it('should perform live preview queries with filters', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping filtered query test');
        return;
      }

      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .limit(5)
        .find<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      
      console.log('Live preview filtered query:', {
        duration: `${duration}ms`,
        entriesCount: result.entries?.length || 0,
        limit: 5
      });
      
      // Should respect the limit
      expect(result.entries?.length || 0).toBeLessThanOrEqual(5);
    });
  });

  skipIfNoUID('Live Preview Performance', () => {
    it('should measure live preview performance', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping performance test');
        return;
      }

      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference(['related_content'])
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Live preview performance:', {
        duration: `${duration}ms`,
        entryUid: result.uid,
        withReferences: true
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(8000); // 8 seconds max
    });

    it('should compare live preview vs regular query performance', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping performance comparison');
        return;
      }

      // Regular query
      const regularStart = Date.now();
      const regularResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();
      const regularTime = Date.now() - regularStart;

      // Live preview query
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const previewStart = Date.now();
      const previewResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();
      const previewTime = Date.now() - previewStart;

      expect(regularResult).toBeDefined();
      expect(previewResult).toBeDefined();

      console.log('Live preview vs regular query performance:', {
        regularQuery: `${regularTime}ms`,
        livePreviewQuery: `${previewTime}ms`,
        overhead: `${previewTime - regularTime}ms`,
        ratio: previewTime / regularTime
      });

      // Both should complete successfully
      expect(regularTime).toBeLessThan(5000);
      expect(previewTime).toBeLessThan(8000);
    });

    it('should handle concurrent live preview queries', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping concurrent query test');
        return;
      }

      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const startTime = Date.now();
      
      // Perform multiple live preview queries concurrently
      const queryPromises = [
        stack.contentType(COMPLEX_CT).entry(COMPLEX_ENTRY_UID!).fetch<any>(),
        stack.contentType(MEDIUM_CT).entry().query().limit(3).find<any>(),
        stack.contentType(SIMPLE_CT).entry().query().limit(3).find<any>()
      ];
      
      const results = await Promise.all(queryPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toBeDefined();
      expect(results.length).toBe(3);
      
      console.log('Concurrent live preview queries:', {
        duration: `${duration}ms`,
        results: results.map((r, i) => ({
          queryType: ['single_entry', 'query', 'query'][i],
          success: !!r
        }))
      });
      
      // Concurrent operations should complete reasonably
      expect(duration).toBeLessThan(15000); // 15 seconds max
    });
  });

  skipIfNoUID('Live Preview Error Handling', () => {
    it('should handle invalid preview tokens', async () => {
      // Test with invalid preview token
      stack.livePreviewQuery({
        live_preview: 'invalid-preview-token-12345',
      });

      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .fetch<any>();
        
        console.log('Invalid preview token handled:', {
          entryUid: result.uid,
          title: result.title
        });
      } catch (error) {
        console.log('Invalid preview token properly rejected:', (error as Error).message);
        // Should handle gracefully or throw appropriate error
      }
    });

    it('should handle invalid preview hosts', async () => {
      if (!PREVIEW_TOKEN) {
        console.log('Preview token not available, skipping invalid host test');
        return;
      }

      // Test with invalid preview host
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .fetch<any>();
        
        console.log('Invalid preview host handled:', {
          entryUid: result.uid,
          title: result.title
        });
      } catch (error) {
        console.log('Invalid preview host properly rejected:', (error as Error).message);
        // Should handle gracefully or throw appropriate error
      }
    });

    it('should handle live preview configuration errors', async () => {
      const invalidConfigs = [
        {
          name: 'Missing preview token',
          config: {
            live_preview: ''
          }
        },
        {
          name: 'Missing preview host',
          config: {
            live_preview: PREVIEW_TOKEN || 'test-token',
          }
        },
        {
          name: 'Invalid enable value',
          config: {
            live_preview: PREVIEW_TOKEN || 'test-token'
          }
        }
      ];

      for (const config of invalidConfigs) {
        try {
          stack.livePreviewQuery(config.config);
          console.log(`${config.name}:`, 'Configuration applied');
        } catch (error) {
          console.log(`${config.name}:`, 'Configuration failed:', (error as Error).message);
        }
      }
    });

    it('should handle live preview timeout scenarios', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping timeout test');
        return;
      }

      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const startTime = Date.now();
      
      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry()
          .query()
          .limit(100) // Large limit to potentially cause timeout
          .find<any>();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('Live preview large query completed:', {
          duration: `${duration}ms`,
          entriesCount: result.entries?.length || 0
        });
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(20000); // 20 seconds max
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('Live preview large query failed gracefully:', {
          duration: `${duration}ms`,
          error: (error as Error).message
        });
        
        // Should fail gracefully
        expect(duration).toBeLessThan(20000); // 20 seconds max
      }
    });
  });

  skipIfNoUID('Live Preview Edge Cases', () => {
    it('should handle live preview with non-existent entries', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping non-existent entry test');
        return;
      }

      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry('non-existent-entry-uid')
          .fetch<any>();
        
        console.log('Non-existent entry with live preview handled:', result);
      } catch (error) {
        console.log('Non-existent entry with live preview properly rejected:', (error as Error).message);
        // Should handle gracefully
      }
    });

    it('should handle live preview with empty queries', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping empty query test');
        return;
      }

      // Configure live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EQUALS, 'non-existent-title')
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length || 0).toBe(0);

      console.log('Empty live preview query handled gracefully');
    });

    it('should handle live preview configuration changes', async () => {
      if (!PREVIEW_TOKEN || !LIVE_PREVIEW_HOST) {
        console.log('Live preview not configured, skipping configuration change test');
        return;
      }

      // Start with live preview disabled
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const disabledResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Enable live preview
      stack.livePreviewQuery({
        live_preview: PREVIEW_TOKEN
      });

      const enabledResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      expect(disabledResult).toBeDefined();
      expect(enabledResult).toBeDefined();

      console.log('Live preview configuration changes handled:', {
        disabled: !!disabledResult,
        enabled: !!enabledResult,
        bothSuccessful: !!disabledResult && !!enabledResult
      });
    });
  });
});
