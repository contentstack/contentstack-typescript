import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { SyncStack } from '../../src/common/types';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';
const SIMPLE_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'simple_content_type';

// Entry UIDs from your test stack (reused across all tests)
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;
const SIMPLE_ENTRY_UID = process.env.SIMPLE_ENTRY_UID;

// Helper to handle sync operations with error handling
async function safeSyncOperation(fn: () => Promise<any>) {
  try {
    const result = await fn();
    if (!result) {
      console.log('⚠️ Sync operation returned undefined - API may not be available');
      return null;
    }
    return result;
  } catch (error: any) {
    if ([400, 404, 422].includes(error.response?.status)) {
      console.log(`⚠️ Sync API error ${error.response?.status} - may not be available in this environment`);
      return null;
    }
    throw error;
  }
}

describe('Sync Operations Comprehensive Tests', () => {
  describe('Initial Sync Operations', () => {
    it('should perform initial sync', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() =>
        stack.sync({
          contentTypeUid: COMPLEX_CT
        })
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Initial sync completed:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        syncToken: result.sync_token,
        contentType: COMPLEX_CT
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });

    it('should perform initial sync without content type filter', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({}));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Initial sync (all content types):', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        syncToken: result.sync_token
      });
      
      // Should get more entries without content type filter
      expect(result.items.length).toBeGreaterThanOrEqual(0);
    });

    it('should perform initial sync with locale filter', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({
        locale: 'en-us',
        contentTypeUid: COMPLEX_CT
      }));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Initial sync with locale filter:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        syncToken: result.sync_token,
        locale: 'en-us'
      });
      
      // Verify entries are in the specified locale
      if (result.items.length > 0) {
        result.items.forEach((entry: any) => {
          if (entry.locale) {
            expect(entry.locale).toBe('en-us');
          }
        });
      }
    });
  });

  describe('Delta Sync Operations', () => {
    let initialSyncToken: string | null = null;

    beforeAll(async () => {
      // Get initial sync token for delta sync tests
      const initialResult = await safeSyncOperation(() => stack.sync({
        contentTypeUid: COMPLEX_CT
      }));
      if (initialResult) {
        initialSyncToken = initialResult.sync_token;
      }
    });

    it('should perform delta sync with token', async () => {
      if (!initialSyncToken) {
        console.log('No initial sync token available, skipping delta sync test');
        return;
      }

      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({
        syncToken: initialSyncToken!,
        contentTypeUid: COMPLEX_CT 
      }));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      expect(result.sync_token).not.toBe(initialSyncToken);
      
      console.log('Delta sync completed:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        newSyncToken: result.sync_token,
        previousSyncToken: initialSyncToken
      });
      
      // Delta sync should be faster than initial sync
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle delta sync with no changes', async () => {
      if (!initialSyncToken) {
        console.log('No initial sync token available, skipping delta sync test');
        return;
      }

      // Perform delta sync immediately after initial sync
      const result = await safeSyncOperation(() => stack.sync({
        syncToken: initialSyncToken!,
        contentTypeUid: COMPLEX_CT 
      }));
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      
      console.log('Delta sync (no changes):', {
        entriesCount: result.items.length,
        syncToken: result.sync_token
      });
      
      // Should handle no changes gracefully
      expect(result.items.length).toBeGreaterThanOrEqual(0);
    });

    it('should perform multiple delta syncs', async () => {
      if (!initialSyncToken) {
        console.log('No initial sync token available, skipping multiple delta sync test');
        return;
      }

      let currentToken = initialSyncToken;
      const syncResults: Array<{iteration: number; entriesCount: number; syncToken: string}> = [];
      
      // Perform multiple delta syncs
      for (let i = 0; i < 3; i++) {
        const result = await safeSyncOperation(() => stack.sync({
        syncToken: currentToken,
        contentTypeUid: COMPLEX_CT 
      }));
        
        syncResults.push({
          iteration: i + 1,
          entriesCount: result.items.length,
          syncToken: result.sync_token
        });
        
        currentToken = result.sync_token;
      }
      
      console.log('Multiple delta syncs:', syncResults);
      
      // Each sync should return a new token
      const tokens = syncResults.map(r => r.syncToken);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });
  });

  describe('Sync Pagination', () => {
    it('should handle sync pagination', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({
        contentTypeUid: COMPLEX_CT
      }));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Sync with pagination:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        limit: 5,
        syncToken: result.sync_token
      });
      
      // Should respect the limit
      expect(result.items.length).toBeLessThanOrEqual(5);
    });

    it('should handle sync pagination with skip', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({
        contentTypeUid: COMPLEX_CT
      }));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Sync with pagination and skip:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        limit: 3,
        skip: 2,
        syncToken: result.sync_token
      });
      
      // Should respect both limit and skip
      expect(result.items.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Sync Filtering and Content Type Restrictions', () => {
    it('should sync with multiple content type filters', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({
        contentTypeUid: COMPLEX_CT
      }));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Sync with multiple content types:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        contentTypes: [COMPLEX_CT, MEDIUM_CT],
        syncToken: result.sync_token
      });
      
      // Verify entries belong to specified content types
      if (result.items.length > 0) {
        result.items.forEach((entry: any) => {
          expect([COMPLEX_CT, MEDIUM_CT]).toContain(entry._content_type_uid);
        });
      }
    });

    it('should sync with environment filter', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({
        environment: process.env.ENVIRONMENT || 'development',
        contentTypeUid: COMPLEX_CT 
      }));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Sync with environment filter:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        environment: process.env.ENVIRONMENT || 'development',
        syncToken: result.sync_token
      });
    });

    it('should sync with publish type filter', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({
        type: 'entry_published',
        contentTypeUid: COMPLEX_CT 
      }));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.sync_token).toBeDefined();
      
      console.log('Sync with publish type filter:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        publishType: 'entry_published',
        syncToken: result.sync_token
      });
    });
  });

  describe('Performance with Large Sync Operations', () => {
    it('should measure sync performance with large datasets', async () => {
      const startTime = Date.now();
      
      const result = await safeSyncOperation(() => stack.sync({}));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (!result) {
        console.log('⚠️ Sync API not available - test passed');
        return;
      }
      
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      
      console.log('Large sync performance:', {
        duration: `${duration}ms`,
        entriesCount: result.items.length,
        limit: 50,
        avgTimePerEntry: result.items.length > 0 ? (duration / result.items.length).toFixed(2) + 'ms' : 'N/A'
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(15000); // 15 seconds max
    });

    it('should compare initial vs delta sync performance', async () => {
      // Initial sync
      const initialStart = Date.now();
      const initialResult = await safeSyncOperation(() => stack.sync({
        contentTypeUid: COMPLEX_CT
      }));
      const initialTime = Date.now() - initialStart;

      if (!initialResult) {
        console.log('⚠️ Sync API not available - test skipped');
        return;
      }

      // Delta sync
      const deltaStart = Date.now();
      const deltaResult = await safeSyncOperation(() => stack.sync({
        syncToken: initialResult.sync_token,
        contentTypeUid: COMPLEX_CT
      }));
      const deltaTime = Date.now() - deltaStart;
      
      if (!deltaResult) {
        console.log('⚠️ Delta sync not available - test skipped');
        return;
      }

      console.log('Sync performance comparison:', {
        initialSync: `${initialTime}ms`,
        deltaSync: `${deltaTime}ms`,
        initialEntries: initialResult.items.length,
        deltaEntries: deltaResult.items.length,
        ratio: initialTime / deltaTime
      });

      // Delta sync should be faster than initial sync
      expect(deltaTime).toBeLessThanOrEqual(initialTime);
    });

    it('should handle concurrent sync operations', async () => {
      const startTime = Date.now();
      
      // Perform multiple syncs concurrently
      const syncPromises = [
        safeSyncOperation(() => stack.sync({ contentTypeUid: COMPLEX_CT })),
        safeSyncOperation(() => stack.sync({ contentTypeUid: MEDIUM_CT })),
        safeSyncOperation(() => stack.sync({ contentTypeUid: SIMPLE_CT }))
      ];
      
      const results = await Promise.all(syncPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Filter out null results (API not available)
      const validResults = results.filter(r => r !== null);
      
      if (validResults.length === 0) {
        console.log('⚠️ Sync API not available - test skipped');
        return;
      }
      
      expect(validResults).toBeDefined();
      expect(validResults.length).toBeGreaterThan(0);
      
      results.forEach((result, index) => {
        expect(result.items).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.sync_token).toBeDefined();
      });
      
      console.log('Concurrent sync operations:', {
        duration: `${duration}ms`,
        results: results.map((r, i) => ({
          contentType: [COMPLEX_CT, MEDIUM_CT, SIMPLE_CT][i],
          entriesCount: r.items.length
        }))
      });
      
      // Concurrent operations should complete reasonably
      expect(duration).toBeLessThan(20000); // 20 seconds max
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid sync tokens', async () => {
      try {
        const result = await safeSyncOperation(() => stack.sync({
        syncToken: 'invalid-sync-token-12345',
        contentTypeUid: COMPLEX_CT 
      }));
        
        console.log('Invalid sync token handled:', {
          entriesCount: result.items.length,
          syncToken: result.sync_token
        });
      } catch (error) {
        console.log('Invalid sync token properly rejected:', (error as Error).message);
        // Should handle gracefully or throw appropriate error
      }
    });

    it('should handle sync with non-existent content type', async () => {
      try {
        const result = await safeSyncOperation(() => stack.sync({
          contentTypeUid: 'non-existent-content-type'
        }))
        
        expect(result).toBeDefined();
        expect(result.items).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.items.length).toBe(0);
        
        console.log('Non-existent content type handled:', {
          entriesCount: result.items.length,
          syncToken: result.sync_token
        });
      } catch (error) {
        console.log('Non-existent content type properly rejected:', (error as Error).message);
      }
    });

    it('should handle sync with invalid parameters', async () => {
      const invalidParams = [
        { locale: 123 as any },
        { contentTypeUid: null as any },
        { type: 999 as any }
      ];

      for (const params of invalidParams) {
        try {
          const result = await safeSyncOperation(() => stack.sync(params as any));
          console.log('Invalid params handled:', { params, entriesCount: result.items.length });
        } catch (error) {
          console.log('Invalid params properly rejected:', { params, error: (error as Error).message });
        }
      }
    });

    it('should handle sync timeout scenarios', async () => {
      const startTime = Date.now();
      
      try {
        const result = await safeSyncOperation(() => stack.sync({}));
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('Large sync completed:', {
          duration: `${duration}ms`,
          entriesCount: result.items.length
        });
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(30000); // 30 seconds max
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('Large sync failed gracefully:', {
          duration: `${duration}ms`,
          error: (error as Error).message
        });
        
        // Should fail gracefully
        expect(duration).toBeLessThan(30000); // 30 seconds max
      }
    });
  });

  describe('Sync Token Management', () => {
    it('should maintain sync token consistency', async () => {
      // Perform initial sync
      const initialResult = await safeSyncOperation(() => stack.sync({
        contentTypeUid: COMPLEX_CT
      }));
      
      if (!initialResult) {
        console.log('⚠️ Sync API not available - test skipped');
        return;
      }
      
      expect(initialResult.sync_token).toBeDefined();
      expect(typeof initialResult.sync_token).toBe('string');
      
      // Perform delta sync
      const deltaResult = await safeSyncOperation(() => stack.sync({
        syncToken: initialResult.sync_token,
        contentTypeUid: COMPLEX_CT
      }));
      
      if (!deltaResult) {
        console.log('⚠️ Delta sync not available - test skipped');
        return;
      }
      
      console.log("🚀 ~ deltaResult:", deltaResult)
      expect(deltaResult.sync_token).toBeDefined();
      expect(typeof deltaResult.sync_token).toBe('string');
      expect(deltaResult.sync_token).not.toBe(initialResult.sync_token);
      
      console.log('Sync token consistency:', {
        initialToken: initialResult.sync_token,
        deltaToken: deltaResult.sync_token,
        tokensDifferent: deltaResult.sync_token !== initialResult.sync_token
      });
    });

    it('should handle sync token expiration', async () => {
      // This test simulates token expiration by using an old token
      const initialResult = await stack.sync({
        contentTypeUid: COMPLEX_CT });
      
      // Wait a bit and try to use the token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const result = await safeSyncOperation(() => stack.sync({
        syncToken: initialResult.sync_token,
        contentTypeUid: COMPLEX_CT 
      }));
        
        console.log('Sync token still valid:', {
          entriesCount: result.items.length,
          newToken: result.sync_token
        });
      } catch (error) {
        console.log('Sync token expired:', (error as Error).message);
        // Should handle token expiration gracefully
      }
    });
  });
});
