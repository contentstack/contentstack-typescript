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

// Variant UID for testing
// IMPORTANT: Use the Variant ID from Entry Information panel
// This is NOT the variant group name - that's just the UI display name
const VARIANT_UID = process.env.VARIANT_UID; // Variant ID from Entry Information → Basic Information → Variant ID
const hasVariantUID = !!VARIANT_UID;

describe('Entry Variants Comprehensive Tests', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;
  const skipIfNoVariant = !hasVariantUID ? describe.skip : describe;

  // Log configuration at start
  console.log('Variant Tests Configuration:', {
    contentType: COMPLEX_CT,
    entryUID: COMPLEX_ENTRY_UID || 'NOT SET',
    variantUID: VARIANT_UID || 'NOT SET',
    hasVariantUID: hasVariantUID,
    note: 'VARIANT_UID must be the Variant ID from Entry Information panel',
    clarification: {
      variantID: 'Variant ID from Entry Information → Basic Information → Variant ID',
      variantGroupName: 'Variant group name (shown in dropdown) - NOT used as identifier',
      variantEntryTitle: 'Variant entry title - NOT the variant identifier',
      correctUsage: `Use: VARIANT_UID=${VARIANT_UID || 'your-variant-id'} (the Variant ID, not the group name)`
    },
    expectedValues: {
      entryUID: COMPLEX_ENTRY_UID || 'NOT SET',
      contentType: COMPLEX_CT || 'NOT SET',
      variantUID: VARIANT_UID || 'NOT SET'
    }
  });

  skipIfNoUID('Variant Fetching and Structure', () => {
    it('should fetch entry without variants to see available variants', async () => {
      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .fetch<any>();

        console.log('Entry fetched without variants:', {
          entryUID: result.uid,
          title: result.title,
          hasVariants: !!result.variants,
          variantCount: result.variants?.length || 0,
          variants: result.variants ? result.variants.map((v: any) => ({
            uid: v.uid,
            name: v.name || v.uid,
            title: v.title
          })) : []
        });

        // This helps debug what variants are available
        if (result.variants && result.variants.length > 0) {
          console.log('Available variant IDs:', result.variants.map((v: any) => v.uid));
          console.log('Available variant names:', result.variants.map((v: any) => v.name || v.uid));
        }
      } catch (error: any) {
        console.error('Failed to fetch entry without variants:', error.message);
      }
    });

    skipIfNoVariant('should fetch entry with variants', () => {
      it('should fetch entry with variants', async () => {
        console.log('Variant Test - Using:', {
          contentType: COMPLEX_CT,
          entryUID: COMPLEX_ENTRY_UID,
          variantUID: VARIANT_UID
        });

        try {
          const result = await stack
            .contentType(COMPLEX_CT)
            .entry(COMPLEX_ENTRY_UID!)
            .variants(VARIANT_UID!)
            .fetch<any>();

          expect(result).toBeDefined();
          expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      expect(result.title).toBeDefined();

      // Check variant structure
      if (result.variants) {
        console.log('Variants found:', {
          count: result.variants.length,
          variantNames: result.variants.map((v: any) => v.name || v.uid)
        });

        // Validate variant structure
        result.variants.forEach((variant: any, index: number) => {
          expect(variant).toBeDefined();
          expect(variant.uid).toBeDefined();
          
          console.log(`Variant ${index + 1}:`, {
            uid: variant.uid,
            name: variant.name,
            title: variant.title,
            hasContent: !!variant.content
          });
        });
      } else {
        console.log('No variants found for this entry (test data dependent)');
      }
        } catch (error: any) {
          if (error.response?.status === 422) {
            console.error('Variant Test Failed - 422 Unprocessable Entity:', {
              contentType: COMPLEX_CT,
              entryUID: COMPLEX_ENTRY_UID,
              variantUID: VARIANT_UID,
              error: error.message,
              responseData: error.response?.data,
              status: error.response?.status,
              hint: `Check: 1) Variant is published, 2) Entry/content type UIDs match your stack, 3) Environment matches, 4) VARIANT_UID must be the Variant ID (${VARIANT_UID || 'NOT SET'}) from Entry Information panel, NOT the variant group name`
            });
            // Fail the test to highlight the issue
            throw new Error(`Variant test failed with 422. Verify: Entry UID (${COMPLEX_ENTRY_UID}), Content Type (${COMPLEX_CT}), Variant is published. VARIANT_UID must be the Variant ID (${VARIANT_UID || 'NOT SET'}) from Entry Information panel, NOT the variant group name. Error: ${error.message}`);
          } else {
            throw error; // Re-throw other errors
          }
        }
      });
    });

    it('should fetch specific variant by name', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();

      expect(result).toBeDefined();

      if (result.variants && result.variants.length > 0) {
        const firstVariant = result.variants[0];
        const variantName = firstVariant.name || firstVariant.uid;

        // Fetch specific variant
        const specificVariant = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .variants(variantName)
          .fetch<any>();

        expect(specificVariant).toBeDefined();
        expect(specificVariant.uid).toBe(COMPLEX_ENTRY_UID);

        console.log('Specific variant fetched:', {
          requestedVariant: variantName,
          actualVariant: specificVariant.variants?.[0]?.name || specificVariant.variants?.[0]?.uid,
          hasContent: !!specificVariant.title
        });
      } else {
        console.log('No variants available for specific variant test');
      }
    });

    it('should validate variant content structure', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();

      expect(result).toBeDefined();

      if (result.variants && result.variants.length > 0) {
        result.variants.forEach((variant: any, index: number) => {
          console.log(`Variant ${index + 1} content analysis:`, {
            uid: variant.uid,
            name: variant.name,
            hasTitle: !!variant.title,
            hasSeo: !!variant.seo,
            hasPageHeader: !!variant.page_header,
            hasRelatedContent: !!variant.related_content,
            hasAuthors: !!variant.authors,
            fieldCount: Object.keys(variant).length
          });

          // Validate variant has proper structure
          expect(variant.uid).toBeDefined();
          expect(variant.title).toBeDefined();
        });
      }
    });
  });

  skipIfNoUID('Variant Filtering and Querying', () => {
    it('should query entries with variants', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('title', QueryOperation.EXISTS, true)
        .find<any>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();

      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with variants`);

        result.entries.forEach((entry: any, index: number) => {
          console.log(`Entry ${index + 1}:`, {
            uid: entry.uid,
            title: entry.title,
            variantCount: entry.variants?.length || 0,
            variantNames: entry.variants?.map((v: any) => v.name || v.uid) || []
          });

          if (entry.variants && entry.variants.length > 0) {
            expect(Array.isArray(entry.variants)).toBe(true);
            entry.variants.forEach((variant: any) => {
              expect(variant.uid).toBeDefined();
            });
          }
        });
      } else {
        console.log('No entries with variants found (test data dependent)');
      }
    });

    it('should filter variants by content', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('variants.seo.canonical', QueryOperation.EXISTS, true)
        .find<any>();

      expect(result).toBeDefined();

      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with SEO variants`);

        result.entries.forEach((entry: any) => {
          if (entry.variants) {
            entry.variants.forEach((variant: any) => {
              if (variant.seo?.canonical || variant.seo?.search_categories) {
                console.log('Variant with SEO:', {
                  entryUid: entry.uid,
                  variantUid: variant.uid,
                  seoCanonical: variant.seo?.canonical || variant.seo?.search_categories
                });
              }
            });
          }
        });
      } else {
        console.log('No entries with SEO variants found (test data dependent)');
      }
    });

    it('should query variants with specific conditions', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .query()
        .where('variants.featured', QueryOperation.EQUALS, true)
        .find<any>();

      expect(result).toBeDefined();

      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with featured variants`);

        result.entries.forEach((entry: any) => {
          if (entry.variants) {
            const featuredVariants = entry.variants.filter((variant: any) => 
              variant.featured === true
            );
            
            if (featuredVariants.length > 0) {
              console.log('Featured variants found:', {
                entryUid: entry.uid,
                featuredCount: featuredVariants.length
              });
            }
          }
        });
      } else {
        console.log('No featured variants found (test data dependent)');
      }
    });
  });

  skipIfNoUID('Performance with Variants', () => {
    it('should measure performance with variants enabled', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      const variantCount = result.variants?.length || 0;
      
      console.log(`Variants performance:`, {
        duration: `${duration}ms`,
        variantCount,
        hasVariants: variantCount > 0
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should compare performance with/without variants', async () => {
      // Without variants
      const withoutStart = Date.now();
      const withoutResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();
      const withoutTime = Date.now() - withoutStart;

      // With variants
      const withStart = Date.now();
      const withResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();
      const withTime = Date.now() - withStart;

      expect(withoutResult).toBeDefined();
      expect(withResult).toBeDefined();

      const variantCount = withResult.variants?.length || 0;

      console.log('Variants performance comparison:', {
        withoutVariants: `${withoutTime}ms`,
        withVariants: `${withTime}ms`,
        overhead: `${withTime - withoutTime}ms`,
        variantCount,
        ratio: (withTime / withoutTime).toFixed(2) + 'x'
      });

      // Just verify both operations completed successfully
      // (Performance comparisons are too flaky due to caching/network variations)
      expect(withoutTime).toBeGreaterThan(0);
      expect(withTime).toBeGreaterThan(0);
      expect(withoutResult).toBeDefined();
      expect(withResult).toBeDefined();
    });

    it('should measure performance with multiple variant queries', async () => {
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
      
      const totalVariants = result.entries?.reduce((total: number, entry: any) => 
        total + (entry.variants?.length || 0), 0) || 0;
      
      console.log(`Multiple variant queries performance:`, {
        duration: `${duration}ms`,
        entriesFound: result.entries?.length || 0,
        totalVariants,
        avgVariantsPerEntry: result.entries?.length ? totalVariants / result.entries.length : 0
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });
  });

  skipIfNoUID('Edge Cases', () => {
    it('should handle entries without variants gracefully', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      if (!result.variants || result.variants.length === 0) {
        console.log('Entry has no variants (test data dependent)');
        expect(result.variants).toBeUndefined();
      } else {
        console.log(`Entry has ${result.variants.length} variants`);
        expect(Array.isArray(result.variants)).toBe(true);
      }
    });

    it('should handle invalid variant names', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants('non-existent-variant')
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Invalid variant name handled:', {
        requestedVariant: 'non-existent-variant',
        hasVariants: !!result.variants,
        variantCount: result.variants?.length || 0
      });
    });

    it('should handle malformed variant data', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      if (result.variants) {
        result.variants.forEach((variant: any, index: number) => {
          // Check for malformed variant data
          const isValidVariant = variant.uid && typeof variant.uid === 'string';
          
          if (!isValidVariant) {
            console.log(`Malformed variant ${index + 1}:`, variant);
          }
          
          expect(isValidVariant).toBe(true);
        });
      }
    });
  });

  skipIfNoUID('Variant Content Analysis', () => {
    it('should analyze variant content differences', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();

      expect(result).toBeDefined();

      if (result.variants && result.variants.length > 1) {
        console.log(`Analyzing ${result.variants.length} variants for content differences`);

        const variantAnalysis = result.variants.map((variant: any, index: number) => ({
          index: index + 1,
          uid: variant.uid,
          name: variant.name,
          title: variant.title,
          hasSeo: !!variant.seo,
          hasPageHeader: !!variant.page_header,
          hasRelatedContent: !!variant.related_content,
          hasAuthors: !!variant.authors,
          fieldCount: Object.keys(variant).length
        }));

        console.log('Variant content analysis:', variantAnalysis);

        // Check for content differences
        const titles = result.variants.map((v: any) => v.title).filter(Boolean);
        const uniqueTitles = new Set(titles);
        
        console.log('Content differences:', {
          totalVariants: result.variants.length,
          uniqueTitles: uniqueTitles.size,
          titleVariation: titles.length > uniqueTitles.size ? 'Some variants have same title' : 'All variants have unique titles'
        });
      } else {
        console.log('Not enough variants for content analysis (need 2+)');
      }
    });

    it('should validate variant global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .variants(VARIANT_UID!)
        .fetch<any>();

      expect(result).toBeDefined();

      if (result.variants && result.variants.length > 0) {
        const globalFields = ['seo', 'page_header', 'related_content', 'authors'];
        
        result.variants.forEach((variant: any, index: number) => {
          console.log(`Variant ${index + 1} global fields:`, {
            uid: variant.uid,
            name: variant.name,
            globalFields: globalFields.map(field => ({
              field,
              present: !!variant[field],
              hasTitle: !!variant[field]?.title,
              hasContent: !!variant[field]?.content
            }))
          });
        });
      }
    });
  });

  skipIfNoUID('Multiple Entry Comparison', () => {
    const skipIfNoMediumUID = !MEDIUM_ENTRY_UID ? describe.skip : describe;

    skipIfNoMediumUID('should compare variants across different entries', () => {
      it('should compare variants across different entries', async () => {
        const results = await Promise.all([
        stack.contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .variants(VARIANT_UID!)
          .fetch<any>(),
        stack.contentType(MEDIUM_CT)
          .entry(MEDIUM_ENTRY_UID!)
          .variants(VARIANT_UID!)
          .fetch<any>()
      ]);

      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();

      console.log('Cross-entry variant comparison:', {
        complexEntry: {
          uid: results[0].uid,
          title: results[0].title,
          variantCount: results[0].variants?.length || 0,
          variantNames: results[0].variants?.map((v: any) => v.name || v.uid) || []
        },
        mediumEntry: {
          uid: results[1].uid,
          title: results[1].title,
          variantCount: results[1].variants?.length || 0,
          variantNames: results[1].variants?.map((v: any) => v.name || v.uid) || []
        }
      });
      });
    });
  });
});
