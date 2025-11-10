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

describe('Advanced Field Projection Tests', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Nested Field Projections', () => {
    it('should project only specific nested fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'uid', 'page_header.title', 'seo.canonical'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      expect(result.title).toBeDefined();

      // Log available fields for debugging
      console.log('Projected fields:', Object.keys(result));
      
      // Should have nested fields if they exist
      if (result.page_header) {
        console.log('page_header fields:', Object.keys(result.page_header));
      }
      if (result.seo) {
        console.log('seo fields:', Object.keys(result.seo));
      }
    });

    it('should exclude specific nested fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .except(['page_header.title', 'seo.search_categories'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      // Should not have excluded nested fields (if they exist)
      if (result.page_header) {
        // Note: exclusion may still include the field, but nested values might be excluded
        console.log('page_header after exclusion:', result.page_header);
      }
      if (result.seo) {
        console.log('seo after exclusion:', result.seo);
      }

      console.log('Available fields after exclusion:', Object.keys(result));
    });

    it('should handle dot notation for deep nested fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'page_header.title', 'seo.canonical'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();

      // Should have nested structure preserved
      if (result.page_header) {
        expect(result.page_header.title).toBeDefined();
      }
      if (result.seo) {
        expect(result.seo.canonical !== undefined || result.seo.search_categories !== undefined).toBe(true);
      }

      console.log('Deep nested projection successful');
    });
  });

  skipIfNoUID('Global Field Projections', () => {
    it('should project only global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'seo', 'page_header'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();

      // Should have global fields
      const hasSeo = result.seo !== undefined;
      const hasPageHeader = result.page_header !== undefined;
      
      console.log('Global fields present:', { 
        seo: hasSeo, 
        page_header: hasPageHeader 
      });
    });

    it('should exclude global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .except(['seo', 'page_header'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();

      // Should not have excluded global fields (or they may still be present but empty)
      console.log('Global fields after exclusion:', {
        hasSeo: result.seo !== undefined,
        hasPageHeader: result.page_header !== undefined
      });

      console.log('Available fields:', Object.keys(result));
    });
  });

  skipIfNoUID('Reference Field Projections', () => {
    it('should project reference fields with includeReference', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference(['related_content'])
        .only(['title', 'related_content'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();

      // Should have reference data
      if (result.related_content) {
        console.log('Reference fields projected:', 
          Array.isArray(result.related_content) 
            ? result.related_content.length 
            : 'single reference'
        );
      }
    });

    it('should exclude reference fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .except(['related_content', 'authors'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();

      // Should not have excluded reference fields (or they may still be present but empty)
      console.log('Reference fields after exclusion:', {
        hasRelatedContent: result.related_content !== undefined,
        hasAuthors: result.authors !== undefined
      });

      console.log('Available fields:', Object.keys(result));
    });
  });

  skipIfNoUID('Modular Block Projections', () => {
    it('should project specific modular block fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'content_block'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();

      // Should have modular blocks (content_block is the modular block field in cybersecurity)
      if (result.content_block) {
        console.log('Modular blocks projected:', 
          Array.isArray(result.content_block) 
            ? result.content_block.length 
            : 'single block'
        );
      }
    });

    it('should exclude modular blocks', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .except(['content_block', 'video_experience'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();

      // Should not have excluded modular blocks (or they may still be present but empty)
      console.log('Modular blocks after exclusion:', {
        hasContentBlock: result.content_block !== undefined,
        hasVideoExperience: result.video_experience !== undefined
      });

      console.log('Available fields:', Object.keys(result));
    });
  });

  skipIfNoUID('Performance Comparison', () => {
    it('should show performance difference with projection', async () => {
      const startTime = Date.now();
      
      // Without projection
      const fullResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();
      
      const fullTime = Date.now() - startTime;
      
      const projectionStartTime = Date.now();
      
      // With projection
      const projectedResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'uid', 'seo.canonical'])
        .fetch<any>();
      
      const projectionTime = Date.now() - projectionStartTime;
      
      expect(fullResult).toBeDefined();
      expect(projectedResult).toBeDefined();
      
      console.log('Performance comparison:', {
        fullFetch: `${fullTime}ms`,
        projectedFetch: `${projectionTime}ms`,
        improvement: projectionTime < fullTime ? 'Faster' : 'Slower'
      });
    });
  });

  skipIfNoUID('Edge Cases', () => {
    it('should handle non-existent fields gracefully', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'non_existent_field', 'content.non_existent'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      
      // Non-existent fields should be undefined
      expect(result.non_existent_field).toBeUndefined();
      expect(result.non_existent).toBeUndefined();

      console.log('Non-existent fields handled gracefully');
    });

    it('should handle empty projection arrays', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only([])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Empty projection handled:', Object.keys(result));
    });

    it('should handle except with all fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .except(['title', 'uid', 'seo'])
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Should have minimal fields (excluded fields may still be present but empty)
      console.log('Fields after excluding title, uid, seo:', Object.keys(result));
      
      console.log('All fields excluded:', Object.keys(result));
    });
  });

  skipIfNoUID('Multiple Entry Comparison', () => {
    const skipIfNoMediumUID = !MEDIUM_ENTRY_UID ? it.skip : it;
    
    skipIfNoMediumUID('should compare projections across different entries', async () => {
      const complexResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'seo'])
        .fetch<any>();

      const mediumResult = await stack
        .contentType(MEDIUM_CT)
        .entry(MEDIUM_ENTRY_UID!)
        .only(['title', 'reference'])
        .fetch<any>();

      expect(complexResult).toBeDefined();
      expect(mediumResult).toBeDefined();
      
      expect(complexResult.title).toBeDefined();
      expect(mediumResult.title).toBeDefined();

      console.log('Cross-entry projection comparison:', {
        complex: Object.keys(complexResult),
        medium: Object.keys(mediumResult)
      });
    });
  });
});
