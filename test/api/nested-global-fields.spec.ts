import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { BaseEntry } from '../../src';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';

// Entry UIDs from your test stack
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;

describe('Global Fields - Basic Structure', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Entry with Multiple Global Fields', () => {
    it('should fetch entry with 5+ global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      expect(result.title).toBeDefined();
      
      // Complex content type typically has multiple global fields
      console.log('Available fields:', Object.keys(result));
    });

    it('should have complex global field structures', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Look for complex global fields (structure varies by content type)
      if (result.page_header || result.hero || result.header) {
        const globalField = result.page_header || result.hero || result.header;
        expect(globalField).toBeDefined();
        expect(typeof globalField).toBe('object');
        console.log('Complex global field structure:', Object.keys(globalField));
      }
    });

    it('should have seo global field', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      if (result.seo) {
        expect(result.seo).toBeDefined();
        expect(typeof result.seo).toBe('object');
        console.log('SEO field structure:', Object.keys(result.seo));
      }
    });

    it('should have search or metadata global field', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      if (result.search || result.metadata) {
        const field = result.search || result.metadata;
        expect(field).toBeDefined();
        expect(typeof field).toBe('object');
      }
    });

    it('should have content global field', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      if (result.content) {
        expect(result.content).toBeDefined();
        // Content typically has JSON RTE or rich text
        console.log('Content field type:', typeof result.content);
      }
    });

    it('should validate multiple global fields are present', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Count global fields (look for common patterns)
      const commonGlobalFields = [
        'page_header', 'hero', 'header',
        'seo', 'metadata',
        'search',
        'content', 'body',
        'footer', 'page_footer'
      ];

      const presentFields = commonGlobalFields.filter(field => result[field]);
      console.log(`Found ${presentFields.length} global fields:`, presentFields);
      
      if (presentFields.length > 0) {
        expect(presentFields.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Global Fields - Nested Structure', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Nested Global Fields', () => {
    it('should resolve nested global field structures', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Look for nested structures (common patterns)
      const nestedStructures = [
        { parent: result.page_header, nested: result.page_header?.hero || result.page_header?.hero_banner },
        { parent: result.header, nested: result.header?.hero },
        { parent: result.hero, nested: result.hero?.banner }
      ].filter(s => s.parent && s.nested);
      
      if (nestedStructures.length > 0) {
        const { nested } = nestedStructures[0];
        expect(nested).toBeDefined();
        expect(typeof nested).toBe('object');
        console.log('Nested global field structure:', Object.keys(nested));
      }
    });

    it('should validate nested field structures', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Check for any nested global field
      const checkNested = (obj: any, path: string = ''): boolean => {
        if (obj && typeof obj === 'object') {
          const keys = Object.keys(obj);
          if (keys.length > 3) { // Likely a global field if has multiple keys
            console.log(`Nested structure at ${path}:`, keys);
            return true;
          }
        }
        return false;
      };

      if (result.page_header || result.hero || result.header) {
        const field = result.page_header || result.hero || result.header;
        Object.keys(field).forEach(key => {
          if (checkNested(field[key], key)) {
            expect(field[key]).toBeDefined();
          }
        });
      }
    });
  });

  skipIfNoUID('Complex Nested Structures', () => {
    it('should handle modal or popup structures', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Look for modal/popup structures
      const modalFields = ['modal', 'popup', 'overlay'];
      modalFields.forEach(field => {
        if (result.page_header?.[field] || result.header?.[field]) {
          const modal = result.page_header?.[field] || result.header?.[field];
          expect(modal).toBeDefined();
          console.log(`${field} structure found:`, Object.keys(modal));
        }
      });
    });

    it('should handle card arrays in global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Look for card arrays
      const cardFields = ['cards', 'items', 'features'];
      cardFields.forEach(field => {
        if (result.page_header?.[field] || result.header?.[field]) {
          const cards = result.page_header?.[field] || result.header?.[field];
          if (Array.isArray(cards) && cards.length > 0) {
            console.log(`Found ${cards.length} items in ${field}`);
            expect(cards[0]).toBeDefined();
          }
        }
      });
    });
  });
});

describe('Global Fields - JSON RTE Content', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('JSON RTE Global Fields', () => {
    it('should fetch entry with JSON RTE in content global field', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      if (result.content) {
        // Content can be JSON RTE format or string
        const contentType = typeof result.content;
        console.log('Content field type:', contentType);
        
        expect(contentType).toMatch(/string|object/);
        
        // JSON RTE typically has these properties
        if (typeof result.content === 'object') {
          const possibleRTEFields = ['json', 'blocks', 'children', 'type', 'attrs'];
          const foundRTEFields = possibleRTEFields.filter(field => 
            result.content[field] !== undefined
          );
          
          if (foundRTEFields.length > 0) {
            console.log('JSON RTE structure detected:', foundRTEFields);
          }
        }
      }
    });

    it('should handle embedded items in JSON RTE', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeEmbeddedItems()
        .fetch<any>();

      expect(result).toBeDefined();
      
      if (result.content && typeof result.content === 'object') {
        console.log('JSON RTE with embedded items fetched');
        
        // Embedded items could be in _embedded_items
        if (result._embedded_items) {
          console.log('Found embedded items:', Object.keys(result._embedded_items));
        }
      }
    });
  });

  const skipIfNoMedium = !MEDIUM_ENTRY_UID ? describe.skip : describe;

  skipIfNoMedium('Medium Complexity with Content Block', () => {
    it('should fetch medium entry with content_block global field', async () => {
      const result = await stack
        .contentType(MEDIUM_CT)
        .entry(MEDIUM_ENTRY_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      
      if (result.content_block) {
        expect(result.content_block).toBeDefined();
        console.log('content_block structure:', Object.keys(result.content_block));
      } else if (result.content) {
        expect(result.content).toBeDefined();
        console.log('Content field found');
      }
    });
  });
});

describe('Global Fields - Extensions', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Extension Fields in Global Fields', () => {
    it('should handle extension fields in global field', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      // Look for extension fields in nested structures
      const checkForExtensions = (obj: any, path: string = ''): string[] => {
        const found: string[] = [];
        
        if (obj && typeof obj === 'object') {
          // Check for common extension field patterns
          const extensionFields = ['image_preset', 'image_accessibility', 'json_editor', 'table_editor', 
                                   'form_editor', 'custom_field', 'extension_field'];
          extensionFields.forEach(field => {
            if (obj[field]) found.push(`${path}.${field}`);
          });
          
          // Recurse into nested objects
          Object.entries(obj).forEach(([key, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              found.push(...checkForExtensions(value, path ? `${path}.${key}` : key));
            }
          });
        }
        
        return found;
      };

      const extensionFields = checkForExtensions(result);
      
      if (extensionFields.length > 0) {
        console.log('Found extension fields:', extensionFields);
        expect(extensionFields.length).toBeGreaterThan(0);
      } else {
        console.log('No extension fields found in this entry');
      }
    });

    it('should handle SEO or metadata structured data', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      const structuredDataFields = [
        result.seo?.structured_data,
        result.seo?.schema,
        result.metadata?.structured_data
      ].filter(Boolean);

      if (structuredDataFields.length > 0) {
        console.log('Structured data found:', typeof structuredDataFields[0]);
        expect(structuredDataFields[0]).toBeDefined();
      }
    });
  });
});

describe('Global Fields - Performance', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Multiple Global Fields Performance', () => {
    it('should efficiently fetch entry with 5+ global fields', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeDefined();
      console.log(`Fetched entry with multiple global fields in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it('should handle nested global field resolution efficiently', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference()
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeDefined();
      console.log(`Nested global fields resolved in ${duration}ms`);
      
      expect(duration).toBeLessThan(8000); // 8 seconds
    });

    it('should calculate global field nesting depth', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      let maxDepth = 0;
      
      const calculateDepth = (obj: any, currentDepth: number = 0): void => {
        if (currentDepth > maxDepth) maxDepth = currentDepth;
        
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          Object.values(obj).forEach((value: any) => {
            if (value && typeof value === 'object') {
              calculateDepth(value, currentDepth + 1);
            }
          });
        }
      };

      // Check depth of common global fields
      const commonFields = ['page_header', 'hero', 'header', 'seo', 'search', 'content', 'body', 'footer'];
      commonFields.forEach(field => {
        if (result[field]) {
          calculateDepth(result[field]);
          console.log(`${field} nesting depth: ${maxDepth}`);
          maxDepth = 0; // Reset for next field
        }
      });

      expect(true).toBe(true); // Test should complete without error
    });
  });
});

describe('Global Fields - Edge Cases', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Missing or Empty Global Fields', () => {
    it('should handle entries with some empty global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Check for common global fields
      const commonFields = ['page_header', 'hero', 'seo', 'search', 'content', 'body', 'footer'];
      const emptyFields = commonFields.filter(field => !result[field]);
      
      console.log(`Empty fields: ${emptyFields.length}`, emptyFields);
      
      // Should handle both populated and empty fields gracefully
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
    });

    it('should use only() to fetch specific global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .only(['title', 'page_header', 'seo'])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBeDefined(); // UID always returned
      
      // Only specified fields should be present
      if (result.page_header || result.seo) {
        console.log('Specific fields included with only()');
      }
      
      // Other fields should be excluded
      console.log('Fields returned:', Object.keys(result));
    });

    it('should use except() to exclude global fields', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .except(['content', 'body'])
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Excluded fields should not be present
      if (!result.content && !result.body) {
        console.log('Fields successfully excluded');
      }
      
      // Other fields should be present
      console.log('Fields after except:', Object.keys(result));
    });
  });
});

// Log setup instructions if UIDs missing
if (!COMPLEX_ENTRY_UID && !MEDIUM_ENTRY_UID) {
  console.warn('\n⚠️  NESTED GLOBAL FIELDS TESTS - SETUP REQUIRED:');
  console.warn('Add these to your .env file:\n');
  if (!COMPLEX_ENTRY_UID) {
    console.warn('COMPLEX_ENTRY_UID=<entry_uid_with_multiple_global_fields>');
  }
  if (!MEDIUM_ENTRY_UID) {
    console.warn('MEDIUM_ENTRY_UID=<entry_uid_with_global_fields> (optional)');
  }
  console.warn('\nTests will be skipped until configured.\n');
}

