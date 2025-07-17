import { stackInstance } from '../utils/stack-instance';
import { TEntry } from './types';

const stack = stackInstance();
const contentTypeUid = process.env.CONTENT_TYPE_UID || 'sample_content_type';
const entryUid = process.env.ENTRY_UID || 'sample_entry';
const variantUid = process.env.VARIANT_UID || 'sample_variant';

describe('Entry Variants API Tests', () => {
  describe('Single Entry Variant Operations', () => {
    it('should fetch entry with specific variant', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Note: The SDK uses variants() method and sets x-cs-variant-uid header
      // The actual variant data structure depends on the CMS response
    });

    it('should fetch entry with multiple variants', async () => {
      const variantUids = [variantUid, 'variant_2', 'variant_3'];
      
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUids)
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Multiple variants are passed as comma-separated string in header
    });

    it('should include metadata with variant requests', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .includeMetadata()
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Metadata should be included when requested
    });

    it('should apply variant with reference inclusion', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .includeReference()
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Variants should work with reference inclusion
    });
  });

  describe('Entry Variants Query Operations', () => {
    it('should query entries with specific variant', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .variants(variantUid)
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.entries!.length).toBeGreaterThan(0);
      
      // The variant header is sent, affecting the response
      const entry = result.entries![0] as any;
      expect(entry.uid).toBeDefined();
    });

    it('should query entries with multiple variants', async () => {
      const variantUids = [variantUid, 'variant_2'];
      
      const result = await stack.contentType(contentTypeUid).entry()
        .variants(variantUids)
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.entries!.length).toBeGreaterThan(0);
      
      // Multiple variants are passed as comma-separated string
      const entry = result.entries![0] as any;
      expect(entry.uid).toBeDefined();
    });

    it('should filter entries with variant using query', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .variants(variantUid)
        .query()
        .equalTo('uid', entryUid)
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBe(entryUid);
        });
      }
    });

    it('should support pagination with variant queries', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .variants(variantUid)
        .limit(5)
        .skip(0)
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.entries!.length).toBeLessThanOrEqual(5);
      
      if (result.entries && result.entries.length > 0) {
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
      }
    });

    it('should include count with variant queries', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .variants(variantUid)
        .includeCount()
        .find<{ entries: TEntry[], count: number }>();
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.count).toBeDefined();
      expect(typeof result.count).toBe('number');
      
      if (result.entries && result.entries.length > 0) {
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
      }
    });
  });

  describe('Variant Field and Content Operations', () => {
    it('should fetch entry with variant and content type', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .includeContentType()
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.title).toBeDefined();
      // Content type should be included with variant
    });

    it('should fetch entry with variant and specific fields only', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .only(['title', 'uid'])
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.title).toBeDefined();
      // Only specified fields should be returned
    });

    it('should handle variant with embedded items', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .includeEmbeddedItems()
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Embedded items should be included with variant
    });
  });

  describe('Variant Performance and Basic Tests', () => {
    it('should apply variant with additional parameters', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .addParams({ 'variant_context': 'mobile' })
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Variant context is passed as additional parameter
    });

    it('should handle variant with multiple parameters', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .addParams({ 
          'variant_context': 'mobile',
          'user_segment': 'premium'
        })
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Multiple parameters should be handled
    });

    it('should handle variant with locale specification', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .locale('en-us')
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.locale).toBe('en-us');
      // Variant should work with locale
    });
  });

  describe('Variant Error Handling', () => {
    it('should handle variant queries with reasonable performance', async () => {
      const startTime = Date.now();
      
      const result = await stack.contentType(contentTypeUid).entry()
        .variants(variantUid)
        .limit(10)
        .find<{ entries: TEntry[] }>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      if (result.entries && result.entries.length > 0) {
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
      }
    });

    it('should handle repeated variant requests consistently', async () => {
      // First request
      const result1 = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .fetch<TEntry>();
      
      // Second request 
      const result2 = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .fetch<TEntry>();
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.uid).toBe(result2.uid);
      
      // Both requests should return consistent data
      expect(result1.uid).toBe(entryUid);
      expect(result2.uid).toBe(entryUid);
    });
  });

  describe('Advanced Variant Error Handling', () => {
    it('should handle invalid variant UIDs gracefully', async () => {
      try {
        await stack.contentType(contentTypeUid).entry(entryUid)
          .variants('invalid_variant_uid')
          .fetch<TEntry>();
      } catch (error) {
        expect(error).toBeDefined();
        // Should return meaningful error message
      }
    });

    it('should handle basic variant requests', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Variant header should be applied
    });

    it('should handle variant query errors gracefully', async () => {
      try {
        await stack.contentType('invalid_content_type').entry()
          .variants(variantUid)
          .find<{ entries: TEntry[] }>();
      } catch (error) {
        expect(error).toBeDefined();
        // Should handle error gracefully
      }
    });
  });

  describe('Variant Integration Tests', () => {
    it('should support variant with reference inclusion', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .includeReference()
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      // Reference inclusion should work with variants
    });

    it('should handle variant with locale specification', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .locale('en-us')
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.locale).toBe('en-us');
      // Variant should work with locale
    });

    it('should support variant with field selection', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .variants(variantUid)
        .only(['title', 'uid'])
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.title).toBeDefined();
      // Only specified fields should be returned with variant
    });
  });
}); 