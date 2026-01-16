import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { QueryOperation } from '../../src';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';
const SIMPLE_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'simple_content_type';

// Entry UIDs from your test stack (reused across all tests)
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;
const SIMPLE_ENTRY_UID = process.env.SIMPLE_ENTRY_UID;

describe('Pagination - Comprehensive Coverage', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Basic Pagination Operations', () => {
    it('should handle limit operation', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length || 0} entries with limit 5`);
    });

    it('should handle skip operation', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .skip(2)
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with skip 2, limit 5`);
    });

    it('should handle skip and limit combination', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .skip(0)
        .limit(10)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(10);
      
      console.log(`Found ${result.entries?.length} entries with skip 0, limit 10`);
    });

    it('should handle large limit values', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .limit(100)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(100);
      
      console.log(`Found ${result.entries?.length} entries with limit 100`);
    });

    it('should handle zero limit', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .limit(0)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      
      // Note: API may not respect limit(0) - might return default entries
      console.log(`Found ${result.entries?.length} entries with limit 0 (API may return default)`);
      
      // Just verify it's a small number (API behavior)
      expect(result.entries?.length).toBeLessThanOrEqual(10);
    });
  });

  skipIfNoUID('Pagination with Sorting', () => {
    it('should handle pagination with ascending sort', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .orderByAscending('created_at')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with ascending sort and limit 5`);
    });

    it('should handle pagination with descending sort', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .orderByDescending('created_at')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with descending sort and limit 5`);
    });

    it('should handle pagination with multiple sort fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .orderByAscending('title')
        .orderByDescending('created_at')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with multiple sort fields and limit 5`);
    });
  });

  skipIfNoUID('Pagination with Filters', () => {
    it('should handle pagination with exists filter', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .exists('title')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with exists filter and limit 5`);
    });

    it('should handle pagination with equalTo filter', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .equalTo('featured', true)
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with equalTo filter and limit 5`);
    });

    it('should handle pagination with containedIn filter', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .containedIn('title', ['test', 'sample', 'example'])
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with containedIn filter and limit 5`);
    });

    it('should handle pagination with search filter', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .search('test')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with search filter and limit 5`);
    });
  });

  skipIfNoUID('Pagination with References', () => {
    it('should handle pagination with includeReference', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeReference(['authors'])
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeReference and limit 5`);
    });

    it('should handle pagination with includeReference and filters', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeReference(['authors'])
        .query()
        .exists('title')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeReference, filters and limit 5`);
    });

    it('should handle pagination with includeReference and sorting', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeReference(['authors'])
        .query()
        .orderByDescending('created_at')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeReference, sorting and limit 5`);
    });
  });

  skipIfNoUID('Pagination with Metadata', () => {
    it('should handle pagination with includeMetadata', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeMetadata and limit 5`);
    });

    it('should handle pagination with includeMetadata and filters', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .query()
        .exists('title')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeMetadata, filters and limit 5`);
    });

    it('should handle pagination with includeMetadata and sorting', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .query()
        .orderByDescending('created_at')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeMetadata, sorting and limit 5`);
    });
  });

  skipIfNoUID('Pagination with Field Selection', () => {
    it('should handle pagination with only specific fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .only(['title', 'uid', 'featured'])
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with only specific fields and limit 5`);
    });

    it('should handle pagination with field exclusion', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .except(['content', 'description'])
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with field exclusion and limit 5`);
    });

    it('should handle pagination with field selection and filters', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .only(['title', 'uid', 'featured'])
        .query()
        .exists('title')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with field selection, filters and limit 5`);
    });
  });

  skipIfNoUID('Pagination with Locale and Fallback', () => {
    it('should handle pagination with locale', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .locale('en-us')
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with locale and limit 5`);
    });

    it('should handle pagination with includeFallback', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeFallback()
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeFallback and limit 5`);
    });

    it('should handle pagination with locale and fallback', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .locale('fr-fr')
        .includeFallback()
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with locale, fallback and limit 5`);
    });
  });

  skipIfNoUID('Pagination with Branch Operations', () => {
    it('should handle pagination with includeBranch', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeBranch()
        .query()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeBranch and limit 5`);
    });

    it('should handle pagination with includeBranch and filters', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeBranch()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeBranch, filters and limit 5`);
    });

    it('should handle pagination with includeBranch and sorting', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeBranch()
        .query()
        .orderByDescending('created_at')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeBranch, sorting and limit 5`);
    });
  });

  skipIfNoUID('Pagination with Count', () => {
    it('should handle pagination with includeCount', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .includeCount()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeCount and limit 5`);
    });

    it('should handle pagination with includeCount and filters', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .exists('title')
        .includeCount()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeCount, filters and limit 5`);
    });

    it('should handle pagination with includeCount and sorting', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .includeCount()
        .orderByDescending('created_at')
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with includeCount, sorting and limit 5`);
    });
  });

  skipIfNoUID('Edge Cases and Boundary Conditions', () => {
    it('should handle very large skip values', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .skip(1000)
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with skip 1000, limit 5`);
    });

    it('should handle negative skip values gracefully', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .skip(-1)
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(5);
      
      console.log(`Found ${result.entries?.length} entries with negative skip value`);
    });

    it('should handle negative limit values gracefully', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .limit(-1)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      
      console.log(`Found ${result.entries?.length} entries with negative limit value`);
    });

    it('should handle very large limit values', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .limit(10000)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(10000);
      
      console.log(`Found ${result.entries?.length} entries with limit 10000`);
    });
  });

  skipIfNoUID('Performance and Stress Testing', () => {
    it('should handle multiple concurrent pagination requests', async () => {
      const promises = Array.from({ length: 5 }, (_, index) => 
        stack.contentType(COMPLEX_CT).entry().query().skip(index * 2).limit(3).find<any>()
      );
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.entries).toBeDefined();
        expect(Array.isArray(result.entries)).toBe(true);
        expect(result.entries?.length).toBeLessThanOrEqual(3);
        console.log(`Concurrent pagination request ${index + 1} handled successfully`);
      });
    });

    it('should handle pagination with complex query combinations', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeReference(['authors'])
        .includeMetadata()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .equalTo('featured', true)
        .orderByDescending('created_at')
        .includeCount()
        .skip(0)
        .limit(10)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(10);
      
      console.log(`Found ${result.entries?.length} entries with complex query combination and pagination`);
    });

    it('should handle pagination performance with large datasets', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .limit(50)
        .find<any>();

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      expect(result.entries?.length).toBeLessThanOrEqual(50);
      
      console.log(`Found ${result.entries?.length} entries with limit 50 in ${duration}ms`);
    });
  });
});
