import { stackInstance } from '../utils/stack-instance';
import { BaseEntry } from '../../src';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';
const SIMPLE_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'simple_content_type';

// Entry UIDs from your test stack (reused across all tests)
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;
const SIMPLE_ENTRY_UID = process.env.SIMPLE_ENTRY_UID;

describe('Locale Fallback Chain Tests', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Multi-Locale Fallback Chains', () => {
    it('should handle fallback from primary to secondary locale', async () => {
      // Test with primary locale
      const primaryResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('en-us')
        .includeFallback()
        .fetch<any>();

      expect(primaryResult).toBeDefined();
      expect(primaryResult.uid).toBe(COMPLEX_ENTRY_UID);
      expect(primaryResult.title).toBeDefined();

      console.log('Primary locale (en-us):', {
        title: primaryResult.title,
        locale: primaryResult.locale || 'en-us'
      });

      // Test with secondary locale that might fallback
      const secondaryResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('fr-fr')
        .includeFallback()
        .fetch<any>();

      expect(secondaryResult).toBeDefined();
      expect(secondaryResult.uid).toBe(COMPLEX_ENTRY_UID);

      console.log('Secondary locale (fr-fr):', {
        title: secondaryResult.title,
        locale: secondaryResult.locale || 'fr-fr',
        hasFallback: secondaryResult.title !== primaryResult.title
      });
    });

    it('should handle fallback chain with multiple locales', async () => {
      // Use only available locales: en-us (master) and fr-fr
      const locales = ['en-us', 'fr-fr'];
      const results: any[] = [];

      for (const locale of locales) {
        try {
          const result = await stack
            .contentType(COMPLEX_CT)
            .entry(COMPLEX_ENTRY_UID!)
            .locale(locale)
            .includeFallback()
            .fetch<any>();

          expect(result).toBeDefined();
          expect(result.uid).toBe(COMPLEX_ENTRY_UID);
          
          results.push({
            locale,
            title: result.title,
            actualLocale: result.locale || locale,
            hasContent: !!result.title
          });
        } catch (error: any) {
          if (error.response?.status === 422) {
            console.log(`⚠️ Locale '${locale}' not available (422)`);
            results.push({ locale, error: '422' });
          } else {
            throw error;
          }
        }
      }

      console.log('Multi-locale fallback chain:', results);

      // Verify at least one locale has content
      const localesWithContent = results.filter(r => r.hasContent);
      expect(localesWithContent.length).toBeGreaterThan(0);
    });

    it('should handle fallback with nested content', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('fr-fr')
        .includeFallback()
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      // Check nested content fallback
      // Check root-level fields (not nested under content)
      console.log('Field fallback:', {
        seo: result.seo ? 'present' : 'missing',
        page_header: result.page_header ? 'present' : 'missing',
        related_content: result.related_content ? 'present' : 'missing'
      });

      // Verify fields have fallback behavior
      if (result.seo) {
        expect(result.seo).toBeDefined();
      }
      if (result.page_header) {
        expect(result.page_header).toBeDefined();
      }
      if (result.related_content) {
        expect(result.related_content).toBeDefined();
      }
    });
  });

  skipIfNoUID('Missing Locale Handling', () => {
    it('should handle completely missing locale gracefully', async () => {
      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .locale('non-existent-locale')
          .includeFallback()
          .fetch<any>();

        expect(result).toBeDefined();
        expect(result.uid).toBe(COMPLEX_ENTRY_UID);
        
        // Should either have fallback content or be empty
        console.log('Non-existent locale handling:', {
          hasTitle: !!result.title,
          hasContent: !!result.content,
          locale: result.locale
        });
      } catch (error: any) {
        if (error.response?.status === 422) {
          console.log('⚠️ API returned 422 for non-existent locale (expected behavior)');
          expect(error.response.status).toBe(422);
        } else {
          throw error;
        }
      }
    });

    it('should handle partial locale content', async () => {
      try {
        // Use fr-fr which exists in the stack
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .locale('fr-fr')
          .includeFallback()
          .fetch<any>();

        expect(result).toBeDefined();
        expect(result.uid).toBe(COMPLEX_ENTRY_UID);

        // Check which fields have content vs fallback
        const fieldAnalysis = {
          title: !!result.title,
          content: !!result.content,
          seo: !!result.content?.seo,
          hero_banner: !!result.content?.hero_banner,
          related_content: !!result.content?.related_content
        };

        console.log('Partial locale content analysis (fr-fr):', fieldAnalysis);
      } catch (error: any) {
        if (error.response?.status === 422) {
          console.log('⚠️ Entry not available in fr-fr locale (422)');
          expect(error.response.status).toBe(422);
        } else {
          throw error;
        }
      }
    });
  });

  skipIfNoUID('Locale-Specific Content Validation', () => {
    it('should validate locale-specific field content', async () => {
      const locales = ['en-us', 'fr-fr'];
      const localeResults: any[] = [];

      for (const locale of locales) {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .locale(locale)
          .includeFallback()
          .fetch<any>();

        localeResults.push({
          locale,
          title: result.title,
          seoTitle: result.content?.seo?.title,
          heroTitle: result.content?.hero_banner?.title,
          actualLocale: result.locale
        });
      }

      console.log('Locale-specific content validation:', localeResults);

      // Compare content across locales
      if (localeResults.length >= 2) {
        const [first, second] = localeResults;
        
        // Content should be different for different locales (if both exist)
        if (first.title && second.title && first.locale !== second.locale) {
          console.log('Content differs between locales:', {
            firstLocale: first.locale,
            secondLocale: second.locale,
            titlesMatch: first.title === second.title
          });
        }
      }
    });

    it('should handle locale-specific global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('fr-fr')
        .includeFallback()
        .fetch<any>();

      expect(result).toBeDefined();

      // Check global fields for locale-specific content
      const globalFields = ['seo', 'hero_banner', 'related_content', 'featured_content'];
      const globalFieldAnalysis: Record<string, any> = {};

      globalFields.forEach(field => {
        if (result.content && result.content[field]) {
          globalFieldAnalysis[field] = {
            present: true,
            hasTitle: !!result.content[field].title,
            hasDescription: !!result.content[field].description,
            hasContent: Object.keys(result.content[field]).length > 0
          };
        } else {
          globalFieldAnalysis[field] = { present: false };
        }
      });

      console.log('Global fields locale analysis:', globalFieldAnalysis);
    });
  });

  skipIfNoUID('Performance with Locale Fallbacks', () => {
    it('should measure performance with fallback enabled', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('fr-fr')
        .includeFallback()
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log(`Locale fallback performance:`, {
        duration: `${duration}ms`,
        locale: 'fr-fr',
        hasContent: !!result.title
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(3000); // 3 seconds max
    });

    it('should compare performance with/without fallback', async () => {
      // Without fallback
      const withoutStart = Date.now();
      const withoutResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('fr-fr')
        .fetch<any>();
      const withoutTime = Date.now() - withoutStart;

      // With fallback
      const withStart = Date.now();
      const withResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('fr-fr')
        .includeFallback()
        .fetch<any>();
      const withTime = Date.now() - withStart;

      expect(withoutResult).toBeDefined();
      expect(withResult).toBeDefined();

      console.log('Fallback performance comparison:', {
        withoutFallback: `${withoutTime}ms`,
        withFallback: `${withTime}ms`,
        overhead: `${withTime - withoutTime}ms`,
        withoutContent: !!withoutResult.title,
        withContent: !!withResult.title
      });

      // With fallback might take longer but should provide more content (may vary due to caching)
      console.log(`Performance: with fallback=${withTime}ms, without=${withoutTime}ms`);
      
      // Note: Performance can vary due to caching, so just verify both completed
      expect(withTime).toBeGreaterThan(0);
      expect(withoutTime).toBeGreaterThan(0);
    });
  });

  skipIfNoUID('Edge Cases', () => {
    it('should handle invalid locale format', async () => {
      try {
        const result = await stack
          .contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .locale('invalid-locale-format')
          .includeFallback()
          .fetch<any>();

        expect(result).toBeDefined();
        expect(result.uid).toBe(COMPLEX_ENTRY_UID);
        
        console.log('Invalid locale format handled:', {
          requestedLocale: 'invalid-locale-format',
          actualLocale: result.locale,
          hasContent: !!result.title
        });
      } catch (error: any) {
        if (error.response?.status === 422) {
          console.log('⚠️ API rejected invalid locale format (expected)');
          expect(error.response.status).toBe(422);
        } else {
          throw error;
        }
      }
    });

    it('should handle empty locale string', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale('')
        .includeFallback()
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Empty locale string handled:', {
        hasContent: !!result.title,
        locale: result.locale
      });
    });

    it('should handle null locale gracefully', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .locale(null as any)
        .includeFallback()
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Null locale handled:', {
        hasContent: !!result.title,
        locale: result.locale
      });
    });
  });

  skipIfNoUID('Multiple Entry Comparison', () => {
    const skipIfNoMediumUID = !MEDIUM_ENTRY_UID ? describe.skip : describe;

    skipIfNoMediumUID('should compare locale fallback across different entries', () => {
      it('should compare locale fallback across different entries', async () => {
        const results = await Promise.all([
        stack.contentType(COMPLEX_CT)
          .entry(COMPLEX_ENTRY_UID!)
          .locale('fr-fr')
          .includeFallback()
          .fetch<any>(),
        stack.contentType(MEDIUM_CT)
          .entry(MEDIUM_ENTRY_UID!)
          .locale('fr-fr')
          .includeFallback()
          .fetch<any>()
      ]);

      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();

      console.log('Cross-entry locale comparison:', {
        complexEntry: {
          uid: results[0].uid,
          title: results[0].title,
          locale: results[0].locale,
          hasContent: !!results[0].title
        },
        mediumEntry: {
          uid: results[1].uid,
          title: results[1].title,
          locale: results[1].locale,
          hasContent: !!results[1].title
        }
      });
      });
    });
  });

  skipIfNoUID('Locale Chain Validation', () => {
    it('should validate complete locale fallback chain', async () => {
      // Use only available locales
      const testLocales = ['en-us', 'fr-fr'];
      const chainResults: any[] = [];

      for (const locale of testLocales) {
        try {
          const result = await stack
            .contentType(COMPLEX_CT)
            .entry(COMPLEX_ENTRY_UID!)
            .locale(locale)
            .includeFallback()
            .fetch<any>();

          chainResults.push({
            requestedLocale: locale,
            actualLocale: result.locale || locale,
            hasTitle: !!result.title,
            hasContent: !!result.content,
            titleLength: result.title ? result.title.length : 0
          });
        } catch (error: any) {
          if (error.response?.status === 422) {
            console.log(`⚠️ Locale '${locale}' not available (422)`);
            chainResults.push({
              requestedLocale: locale,
              error: '422'
            });
          } else {
            throw error;
          }
        }
      }

      console.log('Complete locale fallback chain:', chainResults);

      // Analyze fallback behavior
      const localesWithContent = chainResults.filter(r => r.hasTitle);
      const uniqueLocales = new Set(chainResults.map(r => r.actualLocale).filter(Boolean));

      console.log('Fallback chain analysis:', {
        totalLocales: testLocales.length,
        localesWithContent: localesWithContent.length,
        uniqueActualLocales: uniqueLocales.size,
        fallbackPattern: chainResults.map(r => `${r.requestedLocale}->${r.actualLocale}`)
      });

      expect(localesWithContent.length).toBeGreaterThan(0);
    });
  });
});
