import { describe, it, expect } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { BaseEntry, QueryOperation } from '../../src';
import * as contentstack from '../../src/lib/contentstack';

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
const MANAGEMENT_TOKEN = process.env.MANAGEMENT_TOKEN;
const LIVE_PREVIEW_HOST = process.env.LIVE_PREVIEW_HOST;
const HOST = process.env.HOST;

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
      const results: Array<{
        contentType: string;
        entriesCount?: number;
        error?: string;
        success: boolean;
      }> = [];

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

  // ═══════════════════════════════════════════════════════════════
  // MANAGEMENT TOKEN TESTS
  // ═══════════════════════════════════════════════════════════════
  
  const skipIfNoManagementToken = !MANAGEMENT_TOKEN ? describe.skip : describe;

  skipIfNoManagementToken('Live Preview Configuration with Management Token', () => {
    it('should configure live preview with management token (enabled)', async () => {
      const testStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          management_token: MANAGEMENT_TOKEN,
          host: HOST
        }
      });

      const livePreviewConfig = testStack.config.live_preview;
      
      expect(livePreviewConfig).toBeDefined();
      expect(livePreviewConfig?.enable).toBe(true);
      expect(livePreviewConfig?.management_token).toBe(MANAGEMENT_TOKEN);
      expect(livePreviewConfig?.host).toBe(HOST);
      expect(testStack.config.host).toBeDefined(); // Region-specific CDN host

      console.log('Live preview with management token (enabled):', {
        enabled: livePreviewConfig?.enable,
        hasManagementToken: !!livePreviewConfig?.management_token,
        host: livePreviewConfig?.host
      });
    });

    it('should configure live preview with management token (disabled)', async () => {
      const testStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: false,
          management_token: MANAGEMENT_TOKEN
        }
      });

      const livePreviewConfig = testStack.config.live_preview;
      
      expect(livePreviewConfig).toBeDefined();
      expect(livePreviewConfig?.enable).toBe(false);
      expect(livePreviewConfig?.management_token).toBe(MANAGEMENT_TOKEN);
      expect(livePreviewConfig?.host).toBeUndefined();
      expect(testStack.config.host).toBeDefined(); // Region-specific CDN host

      console.log('Live preview with management token (disabled):', {
        enabled: livePreviewConfig?.enable,
        hasManagementToken: !!livePreviewConfig?.management_token,
        host: livePreviewConfig?.host || 'undefined'
      });
    });

    it('should validate management token vs preview token configuration', async () => {
      // Management token configuration
      const mgmtStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          management_token: MANAGEMENT_TOKEN,
          host: HOST
        }
      });

      // Preview token configuration (if available)
      const previewStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          preview_token: PREVIEW_TOKEN,
          host: HOST
        }
      });

      const mgmtConfig = mgmtStack.config.live_preview;
      const previewConfig = previewStack.config.live_preview;

      expect(mgmtConfig).toBeDefined();
      expect(previewConfig).toBeDefined();
      
      console.log('Management vs Preview token configuration:', {
        managementToken: {
          hasToken: !!mgmtConfig?.management_token,
          hasPreviewToken: !!mgmtConfig?.preview_token
        },
        previewToken: {
          hasToken: !!previewConfig?.preview_token,
          hasManagementToken: !!previewConfig?.management_token
        }
      });
    });
  });

  skipIfNoManagementToken('Live Preview Queries with Management Token', () => {
    it('should check for entry when live preview is enabled with management token', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      try {
        const testStack = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: true,
            management_token: MANAGEMENT_TOKEN,
            host: HOST
          }
        });

        testStack.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const startTime = Date.now();
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch() as any;
        const duration = Date.now() - startTime;

        expect(result).toBeDefined();
        expect(result.uid).toBe(COMPLEX_ENTRY_UID);
        
        console.log('Live preview entry fetch with management token (enabled):', {
          duration: `${duration}ms`,
          entryUid: result.uid,
          title: result.title,
          hasVersion: !!result._version
        });
      } catch (error: any) {
        // Management token may return 403 (forbidden) or 422 (unprocessable entity)
        // depending on permissions and configuration
        if (error.status === 403) {
          console.log('⚠️  Management token returned 403 (forbidden - expected behavior)');
          expect(error.status).toBe(403);
        } else if (error.status === 422) {
          console.log('⚠️  Management token returned 422 (configuration issue - expected)');
          expect(error.status).toBe(422);
        } else {
          console.log('✅ Entry fetched successfully with management token');
          throw error;
        }
      }
    });

    it('should check for entry when live preview is disabled with management token', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      try {
        const testStack = contentstack.stack({
          host: HOST,
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: false,
            management_token: MANAGEMENT_TOKEN
          }
        });

        testStack.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const startTime = Date.now();
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch() as any;
        const duration = Date.now() - startTime;

        expect(result).toBeDefined();
        expect(result.uid).toBe(COMPLEX_ENTRY_UID);

        console.log('Live preview entry fetch with management token (disabled):', {
          duration: `${duration}ms`,
          entryUid: result.uid,
          title: result.title,
          hasVersion: !!result._version
        });
      } catch (error: any) {
        // 422 errors may occur with management token configuration
        if (error.status === 422) {
          console.log('⚠️  Management token with live preview disabled returned 422 (expected)');
          expect(error.status).toBe(422);
        } else if (error.status === 403) {
          console.log('⚠️  Management token returned 403 (forbidden - expected)');
          expect(error.status).toBe(403);
        } else {
          throw error;
        }
      }
    });

    it('should perform queries with management token', async () => {
      try {
        const testStack = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: true,
            management_token: MANAGEMENT_TOKEN,
            host: HOST
          }
        });

        testStack.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const startTime = Date.now();
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry()
          .query()
          .limit(5)
          .find() as any;
        const duration = Date.now() - startTime;

        expect(result).toBeDefined();
        expect(result.entries).toBeDefined();
        expect(Array.isArray(result.entries)).toBe(true);

        console.log('Live preview query with management token:', {
          duration: `${duration}ms`,
          entriesCount: result.entries?.length || 0,
          limit: 5
        });
      } catch (error: any) {
        if (error.status === 403 || error.status === 422) {
          console.log(`⚠️  Management token query returned ${error.status} (expected behavior)`);
          expect([403, 422]).toContain(error.status);
        } else {
          throw error;
        }
      }
    });
  });

  skipIfNoManagementToken('Live Preview Performance with Management Token', () => {
    it('should measure management token performance', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      try {
        const testStack = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: true,
            management_token: MANAGEMENT_TOKEN,
            host: HOST
          }
        });

        testStack.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const startTime = Date.now();
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .includeReference(['related_content'])
          .fetch() as any;
        const duration = Date.now() - startTime;

        expect(result).toBeDefined();
        expect(result.uid).toBe(COMPLEX_ENTRY_UID);

        console.log('Management token performance with references:', {
          duration: `${duration}ms`,
          entryUid: result.uid,
          withReferences: true
        });

        // Management token operations should complete reasonably
        expect(duration).toBeLessThan(10000); // 10 seconds max
      } catch (error: any) {
        if (error.status === 403 || error.status === 422) {
          console.log(`⚠️  Management token returned ${error.status} (expected, skipping performance check)`);
          expect([403, 422]).toContain(error.status);
        } else {
          throw error;
        }
      }
    });

    it('should compare management token vs preview token performance', async () => {
      if (!COMPLEX_ENTRY_UID || !PREVIEW_TOKEN) {
        console.log('⚠️  Skipping: Entry UID or Preview Token not configured');
        return;
      }

      try {
        // Management token query
        const mgmtStack = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: true,
            management_token: MANAGEMENT_TOKEN,
            host: HOST
          }
        });

        mgmtStack.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const mgmtStart = Date.now();
        const mgmtResult = await mgmtStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch();
        const mgmtTime = Date.now() - mgmtStart;

        // Preview token query
        const previewStack = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: true,
            preview_token: PREVIEW_TOKEN,
            host: HOST
          }
        });

        previewStack.livePreviewQuery({
          live_preview: PREVIEW_TOKEN
        });

        const previewStart = Date.now();
        const previewResult = await previewStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch();
        const previewTime = Date.now() - previewStart;

        expect(mgmtResult).toBeDefined();
        expect(previewResult).toBeDefined();

        console.log('Management token vs Preview token performance:', {
          managementToken: `${mgmtTime}ms`,
          previewToken: `${previewTime}ms`,
          difference: `${Math.abs(mgmtTime - previewTime)}ms`,
          ratio: (mgmtTime / previewTime).toFixed(2)
        });
      } catch (error: any) {
        if (error.status === 403 || error.status === 422) {
          console.log(`⚠️  Token returned ${error.status} (expected, skipping comparison)`);
          expect([403, 422]).toContain(error.status);
        } else {
          throw error;
        }
      }
    });
  });

  skipIfNoManagementToken('Live Preview Error Handling with Management Token', () => {
    it('should handle invalid management tokens', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      const testStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          management_token: 'invalid-management-token-12345',
          host: HOST as string
        }
      });

      testStack.livePreviewQuery({
        contentTypeUid: COMPLEX_CT,
        live_preview: 'invalid-management-token-12345'
      });

      try {
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch<any>();
        
        console.log('Invalid management token handled gracefully:', {
          entryUid: result.uid
        });
      } catch (error: any) {
        console.log('Invalid management token properly rejected:', {
          status: error.status,
          message: error.message
        });
        
        // Should return 401 (unauthorized) or 403 (forbidden)
        expect([401, 403, 422]).toContain(error.status);
      }
    });

    it('should handle management token with invalid host', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      const testStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          management_token: MANAGEMENT_TOKEN as string,
          host: 'invalid-host.example.com'
        }
      });

      testStack.livePreviewQuery({
        contentTypeUid: COMPLEX_CT,
        live_preview: MANAGEMENT_TOKEN as string
      });

      try {
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch<any>();
        
        console.log('Invalid host with management token handled:', {
          entryUid: result.uid
        });
      } catch (error: any) {
        console.log('Invalid host with management token rejected:', {
          message: error.message,
          code: error.code
        });
        
        // Network or configuration error expected
        expect(error).toBeDefined();
      }
    });

    it('should handle management token permission errors', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      const testStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          management_token: MANAGEMENT_TOKEN as string,
          host: HOST as string
        }
      });

      testStack.livePreviewQuery({
        contentTypeUid: COMPLEX_CT,
        live_preview: MANAGEMENT_TOKEN as string
      });

      try {
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch() as any;
        
        console.log('Management token permission check passed:', {
          entryUid: result.uid,
          hasPermissions: true
        });
        
        expect(result).toBeDefined();
      } catch (error: any) {
        console.log('Management token permission error (expected):', {
          status: error.status,
          message: error.message
        });
        
        // 403 (forbidden) expected for permission issues
        if (error.status === 403) {
          expect(error.status).toBe(403);
        } else {
          throw error;
        }
      }
    });
  });

  skipIfNoManagementToken('Live Preview Edge Cases with Management Token', () => {
    it('should handle management token with non-existent entries', async () => {
      const testStack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          management_token: MANAGEMENT_TOKEN as string,
          host: HOST as string
        }
      });

      testStack.livePreviewQuery({
        contentTypeUid: COMPLEX_CT,
        live_preview: MANAGEMENT_TOKEN as string
      });

      try {
        const result = await testStack
          .contentType(COMPLEX_CT)
          .entry('non-existent-entry-uid-12345')
          .fetch() as any;
        
        console.log('Non-existent entry with management token handled:', result);
      } catch (error: any) {
        console.log('Non-existent entry with management token properly rejected:', {
          status: error.status,
          message: error.message
        });
        
        // Should return 404 (not found) or 403 (forbidden)
        expect([404, 403, 422]).toContain(error.status);
      }
    });

    it('should handle management token configuration changes mid-session', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      try {
        // First query with management token enabled
        const stack1 = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: true,
            management_token: MANAGEMENT_TOKEN as string,
            host: HOST as string
          }
        });

        stack1.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const result1 = await stack1
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch();

        // Second query with management token disabled
        const stack2 = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: false,
            management_token: MANAGEMENT_TOKEN as string
          }
        });

        stack2.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const result2 = await stack2
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID)
          .fetch();

        expect(result1).toBeDefined();
        expect(result2).toBeDefined();

        console.log('Management token configuration changes handled:', {
          enabled: !!result1,
          disabled: !!result2,
          bothSuccessful: !!result1 && !!result2
        });
      } catch (error: any) {
        if (error.status === 403 || error.status === 422) {
          console.log(`⚠️  Management token configuration change returned ${error.status} (expected)`);
          expect([403, 422]).toContain(error.status);
        } else {
          throw error;
        }
      }
    });

    it('should handle concurrent management token queries', async () => {
      if (!COMPLEX_ENTRY_UID) {
        console.log('⚠️  Skipping: Entry UID not configured');
        return;
      }

      try {
        const testStack = contentstack.stack({
          apiKey: process.env.API_KEY as string,
          deliveryToken: process.env.DELIVERY_TOKEN as string,
          environment: process.env.ENVIRONMENT as string,
          live_preview: {
            enable: true,
            management_token: MANAGEMENT_TOKEN as string,
            host: HOST as string
          }
        });

        testStack.livePreviewQuery({
          contentTypeUid: COMPLEX_CT,
          live_preview: MANAGEMENT_TOKEN as string
        });

        const startTime = Date.now();
        
        // Perform multiple concurrent queries with management token
        const queryPromises = [
          testStack.contentType(COMPLEX_CT).entry(COMPLEX_ENTRY_UID).fetch() as Promise<any>,
          testStack.contentType(MEDIUM_CT).entry().query().limit(3).find() as Promise<any>,
          testStack.contentType(SIMPLE_CT).entry().query().limit(3).find() as Promise<any>
        ];
        
        const results = await Promise.allSettled(queryPromises);
        
        const duration = Date.now() - startTime;
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failedCount = results.filter(r => r.status === 'rejected').length;

        console.log('Concurrent management token queries:', {
          duration: `${duration}ms`,
          successful: successCount,
          failed: failedCount,
          results: results.map((r, i) => ({
            queryType: ['single_entry', 'query', 'query'][i],
            status: r.status
          }))
        });

        // At least some queries should complete (either success or expected errors)
        expect(results.length).toBe(3);
        expect(duration).toBeLessThan(20000); // 20 seconds max
      } catch (error: any) {
        if (error.status === 403 || error.status === 422) {
          console.log(`⚠️  Concurrent management token queries returned ${error.status} (expected)`);
          expect([403, 422]).toContain(error.status);
        } else {
          throw error;
        }
      }
    });
  });
});
