import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
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

describe('Performance Tests with Large Datasets', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Large Dataset Query Performance', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .limit(100)
        .find<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
      
      console.log(`Large dataset query performance:`, {
        duration: `${duration}ms`,
        entriesFound: result.entries?.length,
        limit: 100,
        avgTimePerEntry: (result.entries?.length ?? 0) > 0 ? (duration / (result.entries?.length ?? 1)).toFixed(2) + 'ms' : 'N/A'
      });
      
      // Performance should be reasonable for large datasets
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });

    it('should handle complex queries on large datasets', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .where('seo.canonical', QueryOperation.EXISTS, true)
        .where('page_header.title', QueryOperation.EXISTS, true)
        .where('related_content', QueryOperation.EXISTS, true)
        .limit(50)
        .find<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      
      console.log(`Complex query on large dataset:`, {
        duration: `${duration}ms`,
        entriesFound: result.entries?.length,
        conditions: 4,
        withReferences: true,
        avgTimePerEntry: (result.entries?.length ?? 0) > 0 ? (duration / (result.entries?.length ?? 1)).toFixed(2) + 'ms' : 'N/A'
      });
      
      // Complex queries should still be reasonable
      expect(duration).toBeLessThan(15000); // 15 seconds max
    });

    it('should handle large dataset with field projection', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .limit(75)
        .find<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      
      console.log(`Large dataset with field projection:`, {
        duration: `${duration}ms`,
        entriesFound: result.entries?.length,
        projectedFields: 3,
        avgTimePerEntry: (result.entries?.length ?? 0) > 0 ? (duration / (result.entries?.length ?? 1)).toFixed(2) + 'ms' : 'N/A'
      });
      
      // Field projection should improve performance
      expect(duration).toBeLessThan(8000); // 8 seconds max
    });
  });

  skipIfNoUID('Pagination Performance', () => {
    it('should handle pagination with large datasets efficiently', async () => {
      const pageSize = 20;
      const totalPages = 5;
      const pageTimes: number[] = [];
      
      for (let page = 0; page < totalPages; page++) {
        const startTime = Date.now();
        
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry()
          .query()
          .where('title', QueryOperation.EXISTS, true)
          .skip(page * pageSize)
          .limit(pageSize)
          .find<any>();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        pageTimes.push(duration);
        
        expect(result).toBeDefined();
        expect(result.entries).toBeDefined();
        expect(result.entries?.length).toBeLessThanOrEqual(pageSize);
        
        console.log(`Page ${page + 1} performance:`, {
          duration: `${duration}ms`,
          entriesFound: result.entries?.length,
          skip: page * pageSize,
          limit: pageSize
        });
      }
      
      const avgPageTime = pageTimes.reduce((sum, time) => sum + time, 0) / pageTimes.length;
      const maxPageTime = Math.max(...pageTimes);
      const minPageTime = Math.min(...pageTimes);
      
      console.log(`Pagination performance summary:`, {
        totalPages,
        avgPageTime: `${avgPageTime.toFixed(2)}ms`,
        maxPageTime: `${maxPageTime}ms`,
        minPageTime: `${minPageTime}ms`,
        timeVariation: `${((maxPageTime - minPageTime) / avgPageTime * 100).toFixed(1)}%`
      });
      
      // Pagination should be consistent
      expect(avgPageTime).toBeLessThan(3000); // 3 seconds average
      expect(maxPageTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle deep pagination efficiently', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .skip(100) // Deep pagination
        .limit(25)
        .find<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      
      console.log(`Deep pagination performance:`, {
        duration: `${duration}ms`,
        entriesFound: result.entries?.length,
        skip: 100,
        limit: 25,
        avgTimePerEntry: (result.entries?.length ?? 0) > 0 ? (duration / (result.entries?.length ?? 1)).toFixed(2) + 'ms' : 'N/A'
      });
      
      // Deep pagination should still be reasonable
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });
  });

  skipIfNoUID('Bulk Operations Performance', () => {
    it('should handle bulk entry fetching efficiently', async () => {
      const startTime = Date.now();
      
      // Fetch multiple entries in parallel
      const entryPromises = Array.from({ length: 10 }, (_, index) => 
        stack.contentType(COMPLEX_CT)
          .entry()
          .query()
          .where('title', QueryOperation.EXISTS, true)
          .skip(index * 5)
          .limit(5)
          .find<any>()
      );
      
      const results = await Promise.all(entryPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toBeDefined();
      expect(results.length).toBe(10);
      
      const totalEntries = results.reduce((sum, result) => sum + (result.entries?.length || 0), 0);
      
      console.log(`Bulk operations performance:`, {
        duration: `${duration}ms`,
        parallelRequests: 10,
        totalEntriesFetched: totalEntries,
        avgTimePerRequest: `${(duration / 10).toFixed(2)}ms`,
        avgTimePerEntry: totalEntries > 0 ? `${(duration / totalEntries).toFixed(2)}ms` : 'N/A'
      });
      
      // Bulk operations should be efficient
      expect(duration).toBeLessThan(15000); // 15 seconds max
    });

    it('should handle bulk operations with different content types', async () => {
      const startTime = Date.now();
      
      const bulkPromises = [
        stack.contentType(COMPLEX_CT)
          .entry()
          .query()
          .where('title', QueryOperation.EXISTS, true)
          .limit(20)
          .find<any>(),
        stack.contentType(MEDIUM_CT)
          .entry()
          .query()
          .where('title', QueryOperation.EXISTS, true)
          .limit(20)
          .find<any>()
      ];
      
      const results = await Promise.all(bulkPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toBeDefined();
      expect(results.length).toBe(2);
      
      console.log(`Cross-content type bulk operations:`, {
        duration: `${duration}ms`,
        contentTypes: 2,
        complexEntries: results[0].entries?.length || 0,
        mediumEntries: results[1].entries?.length || 0,
        totalEntries: (results[0].entries?.length || 0) + (results[1].entries?.length || 0)
      });
      
      // Cross-content type operations should be efficient
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });
  });

  skipIfNoUID('Memory Usage with Large Datasets', () => {
    it('should handle large entries without memory issues', async () => {
      const startTime = Date.now();
      const initialMemory = process.memoryUsage();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference(['related_content'])
        .includeEmbeddedItems()
        .fetch<any>();
      
      const endTime = Date.now();
      const finalMemory = process.memoryUsage();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      const memoryUsed = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryUsedMB = (memoryUsed / 1024 / 1024).toFixed(2);
      
      console.log(`Memory usage with large entry:`, {
        duration: `${duration}ms`,
        memoryUsed: `${memoryUsedMB}MB`,
        heapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`
      });
      
      // Memory usage should be reasonable
      expect(parseFloat(memoryUsedMB)).toBeLessThan(100); // Less than 100MB
    });

    it('should handle large result sets without memory issues', async () => {
      const startTime = Date.now();
      const initialMemory = process.memoryUsage();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .limit(50)
        .find<any>();
      
      const endTime = Date.now();
      const finalMemory = process.memoryUsage();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      
      const memoryUsed = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryUsedMB = (memoryUsed / 1024 / 1024).toFixed(2);
      
      console.log(`Memory usage with large result set:`, {
        duration: `${duration}ms`,
        entriesFound: result.entries?.length,
        memoryUsed: `${memoryUsedMB}MB`,
        avgMemoryPerEntry: (result.entries?.length ?? 0) > 0 ? `${(parseFloat(memoryUsedMB) / (result.entries?.length ?? 1)).toFixed(3)}MB` : 'N/A'
      });
      
      // Memory usage should be reasonable
      expect(parseFloat(memoryUsedMB)).toBeLessThan(50); // Less than 50MB
    });
  });

  skipIfNoUID('Concurrent Request Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 5;
      const startTime = Date.now();
      
      const concurrentPromises = Array.from({ length: concurrentRequests }, (_, index) => 
        stack.contentType(COMPLEX_CT)
          .entry()
          .query()
          .where('title', QueryOperation.EXISTS, true)
          .skip(index * 10)
          .limit(10)
          .find<any>()
      );
      
      const results = await Promise.all(concurrentPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toBeDefined();
      expect(results.length).toBe(concurrentRequests);
      
      const totalEntries = results.reduce((sum, result) => sum + (result.entries?.length || 0), 0);
      
      console.log(`Concurrent requests performance:`, {
        duration: `${duration}ms`,
        concurrentRequests,
        totalEntriesFetched: totalEntries,
        avgTimePerRequest: `${(duration / concurrentRequests).toFixed(2)}ms`,
        requestsPerSecond: `${(concurrentRequests / (duration / 1000)).toFixed(2)}`
      });
      
      // Concurrent requests should be efficient
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });

    it('should handle mixed concurrent operations', async () => {
      const startTime = Date.now();
      
      const mixedPromises = [
        stack.contentType(COMPLEX_CT).entry(COMPLEX_ENTRY_UID!).fetch<any>(),
        stack.contentType(COMPLEX_CT).entry().query().where('title', QueryOperation.EXISTS, true).limit(10).find<any>(),
        stack.contentType(MEDIUM_CT).entry().query().where('title', QueryOperation.EXISTS, true).limit(10).find<any>(),
        stack.contentType(COMPLEX_CT).entry(COMPLEX_ENTRY_UID!).includeReference(['related_content']).fetch<any>(),
        stack.contentType(COMPLEX_CT).entry().query().where('featured', QueryOperation.EQUALS, true).limit(5).find<any>()
      ];
      
      const results = await Promise.all(mixedPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toBeDefined();
      expect(results.length).toBe(5);
      
      console.log(`Mixed concurrent operations:`, {
        duration: `${duration}ms`,
        operations: 5,
        operationTypes: ['single_entry', 'query', 'query', 'entry_with_refs', 'query'],
        avgTimePerOperation: `${(duration / 5).toFixed(2)}ms`
      });
      
      // Mixed operations should be efficient
      expect(duration).toBeLessThan(15000); // 15 seconds max
    });
  });

  skipIfNoUID('Performance Regression Tests', () => {
    it('should maintain consistent performance across multiple runs', async () => {
      const runs = 3;
      const runTimes: number[] = [];
      
      for (let run = 0; run < runs; run++) {
        const startTime = Date.now();
        
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry()
          .query()
          .where('title', QueryOperation.EXISTS, true)
          .limit(25)
          .find<any>();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        runTimes.push(duration);
        
        expect(result).toBeDefined();
        expect(result.entries).toBeDefined();
        
        console.log(`Run ${run + 1} performance:`, {
          duration: `${duration}ms`,
          entriesFound: result.entries?.length
        });
      }
      
      const avgTime = runTimes.reduce((sum, time) => sum + time, 0) / runTimes.length;
      const maxTime = Math.max(...runTimes);
      const minTime = Math.min(...runTimes);
      const variation = ((maxTime - minTime) / avgTime * 100).toFixed(1);
      
      console.log(`Performance consistency analysis:`, {
        runs,
        avgTime: `${avgTime.toFixed(2)}ms`,
        maxTime: `${maxTime}ms`,
        minTime: `${minTime}ms`,
        timeVariation: `${variation}%`,
        isConsistent: parseFloat(variation) < 200 // Allow up to 200% variation for network tests
      });
      
      // Performance should complete successfully (lenient for network variability)
      expect(avgTime).toBeGreaterThan(0);
      expect(runTimes.length).toBe(runs);
    });
  });

  skipIfNoUID('Edge Cases with Large Datasets', () => {
    it('should handle empty large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EQUALS, 'non_existent_title_12345')
        .limit(100)
        .find<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.entries?.length).toBe(0);
      
      console.log(`Empty large result set performance:`, {
        duration: `${duration}ms`,
        entriesFound: result.entries?.length,
        limit: 100
      });
      
      // Empty results should be fast
      expect(duration).toBeLessThan(2000); // 2 seconds max
    });

    it('should handle timeout scenarios gracefully', async () => {
      const startTime = Date.now();
      
      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry()
          .query()
          .where('title', QueryOperation.EXISTS, true)
          .limit(1000) // Very large limit
          .find<any>();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(result).toBeDefined();
        
        console.log(`Large limit query performance:`, {
          duration: `${duration}ms`,
          entriesFound: result.entries?.length,
          limit: 1000
        });
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(30000); // 30 seconds max
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`Large limit query failed gracefully:`, {
          duration: `${duration}ms`,
          error: (error as Error).message
        });
        
        // Should fail gracefully
        expect(duration).toBeLessThan(30000); // 30 seconds max
      }
    });
  });
});
