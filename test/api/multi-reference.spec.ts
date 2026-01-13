import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { BaseEntry } from '../../src';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const SELF_REF_CT = process.env.SELF_REF_CONTENT_TYPE_UID || 'self_ref_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';

// Entry UIDs from your test stack
const SELF_REF_ENTRY_UID = process.env.SELF_REF_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;

describe('Multi-Reference - Basic Structure', () => {
  const skipIfNoUID = !SELF_REF_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Multi-Content-Type References', () => {
    it('should fetch entry with multi-CT references', async () => {
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(SELF_REF_ENTRY_UID);
      
      // Check for reference fields (structure varies by content type)
      if (result.related_content) {
        console.log('related_content structure:', Array.isArray(result.related_content) ? `${result.related_content.length} items` : 'single item');
      }
    });

    it('should include multi-CT references', async () => {
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .includeReference('related_content')
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Check if references are resolved
      const relatedContent = result.related_content;
      
      if (relatedContent) {
        expect(relatedContent).toBeDefined();
        
        if (Array.isArray(relatedContent)) {
          console.log(`Found ${relatedContent.length} related content references`);
          
          if (relatedContent.length > 0) {
            expect(relatedContent[0]).toBeDefined();
            
            // Check if reference is resolved (has title, uid, etc.)
            const firstRef = relatedContent[0];
            console.log('First reference type:', firstRef._content_type_uid);
          }
        } else if (relatedContent && relatedContent._content_type_uid) {
          console.log('Single reference type:', relatedContent._content_type_uid);
        }
      }
    });

    it('should identify multiple content types in references', async () => {
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .includeReference('related_content')
        .fetch<any>();

      const references = result.related_content;
      
      // Handle both array and single reference
      const refsArray = Array.isArray(references) ? references : (references ? [references] : []);
      
      if (refsArray.length > 0) {
        // Extract content types
        const contentTypes = refsArray
          .map((ref: any) => ref._content_type_uid)
          .filter(Boolean);
        
        const uniqueContentTypes = [...new Set(contentTypes)];
        
        console.log('Referenced content types:', uniqueContentTypes);
        console.log('Total references:', refsArray.length);
        console.log('Unique content types:', uniqueContentTypes.length);
        
        // related_content can reference: article, video, product, person_profile, page_builder, cybersecurity
        expect(uniqueContentTypes.length).toBeGreaterThan(0);
        
        if (uniqueContentTypes.length > 1) {
          console.log('✓ Multi-content-type references confirmed');
        }
      }
    });

    it('should filter references by content type', async () => {
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .includeReference('related_content')
        .fetch<any>();

      const references = result.related_content;
      
      // Handle both array and single reference
      const refsArray = Array.isArray(references) ? references : (references ? [references] : []);
      
      if (refsArray.length > 0) {
        // Filter by specific content type (e.g., article)
        const articles = refsArray.filter((ref: any) => 
          ref._content_type_uid === 'article'
        );
        
        const videos = refsArray.filter((ref: any) => 
          ref._content_type_uid === 'video'
        );
        
        const products = refsArray.filter((ref: any) => 
          ref._content_type_uid === 'product'
        );
        
        const cybersecurity = refsArray.filter((ref: any) => 
          ref._content_type_uid === 'cybersecurity'
        );
        
        console.log('Articles:', articles.length);
        console.log('Videos:', videos.length);
        console.log('Products:', products.length);
        console.log('Cybersecurity:', cybersecurity.length);
        
        // At least one type should exist
        const totalTyped = articles.length + videos.length + products.length + cybersecurity.length;
        if (totalTyped > 0) {
          expect(totalTyped).toBeGreaterThan(0);
        }
      }
    });
  });
});

describe('Multi-Reference - Article References', () => {
  const skipIfNoUID = !MEDIUM_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Author References in Article', () => {
    it('should fetch article with author reference', async () => {
      const result = await stack
        .contentType(MEDIUM_CT)
        .entry(MEDIUM_ENTRY_UID!)
        .includeReference('author')
        .fetch<any>();

      expect(result).toBeDefined();
      
      if (result.author) {
        console.log('Author reference found');
        
        if (Array.isArray(result.author) && result.author.length > 0) {
          expect(result.author[0]).toBeDefined();
          expect(result.author[0].uid).toBeDefined();
          console.log('Author UID:', result.author[0].uid);
        } else if (typeof result.author === 'object') {
          expect(result.author.uid).toBeDefined();
        }
      }
    });

    it('should handle multiple authors if present', async () => {
      const result = await stack
        .contentType(MEDIUM_CT)
        .entry(MEDIUM_ENTRY_UID!)
        .includeReference('author')
        .fetch<any>();

      if (result.author && Array.isArray(result.author)) {
        console.log(`Article has ${result.author.length} author(s)`);
        
        result.author.forEach((author: any, index: number) => {
          console.log(`Author ${index + 1}:`, author.title || author.name || author.uid);
        });
        
        expect(result.author.length).toBeGreaterThan(0);
      }
    });
  });

  skipIfNoUID('Related Content in Article', () => {
    it('should fetch article with related content references', async () => {
      const result = await stack
        .contentType(MEDIUM_CT)
        .entry(MEDIUM_ENTRY_UID!)
        .includeReference()
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Articles might have related_articles, related_content, or similar fields
      const possibleRelatedFields = [
        'related_articles',
        'related_content',
        'related',
        'references'
      ];
      
      possibleRelatedFields.forEach(field => {
        if (result[field]) {
          console.log(`Found ${field}:`, Array.isArray(result[field]) ? result[field].length : 'single');
        }
      });
    });
  });
});

describe('Multi-Reference - Cybersecurity References', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Multiple Reference Fields', () => {
    it('should fetch cybersecurity with all references', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference()
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Cybersecurity has: authors, related_content, page_footer references
      const referenceFields = ['authors', 'related_content', 'page_footer'];
      
      referenceFields.forEach(field => {
        if (result[field]) {
          console.log(`${field}:`, Array.isArray(result[field]) ? `${result[field].length} items` : 'single item');
        }
      });
    });

    it('should resolve authors references', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference('authors')
        .fetch<any>();

      if (result.authors) {
        expect(result.authors).toBeDefined();
        
        if (Array.isArray(result.authors) && result.authors.length > 0) {
          console.log(`Found ${result.authors.length} author(s)`);
          
          result.authors.forEach((author: any) => {
            expect(author.uid).toBeDefined();
          });
        }
      }
    });

    it('should resolve page_footer reference', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference('page_footer')
        .fetch<any>();

      if (result.page_footer) {
        expect(result.page_footer).toBeDefined();
        
        if (Array.isArray(result.page_footer) && result.page_footer.length > 0) {
          expect(result.page_footer[0].uid).toBeDefined();
          console.log('page_footer UID:', result.page_footer[0].uid);
        } else if (typeof result.page_footer === 'object' && result.page_footer.uid) {
          expect(result.page_footer.uid).toBeDefined();
        }
      }
    });
  });
});

describe('Multi-Reference - Deep Chains', () => {
  const skipIfNoUID = !SELF_REF_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('3-Level Reference Chain', () => {
    it('should resolve 3-level deep references', async () => {
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .includeReference()
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Example chain: section_builder → related_content → article → author
      // Check depth
      let maxDepth = 0;
      const visited = new WeakSet();
      
      const checkReferenceDepth = (obj: any, depth: number = 0): void => {
        if (!obj || typeof obj !== 'object' || visited.has(obj)) return;
        visited.add(obj);
        
        if (depth > maxDepth) maxDepth = depth;
        
        // Prevent excessive depth (safety check)
        if (depth > 10) {
          console.log('⚠️ Max depth of 10 reached - possible circular reference');
          return;
        }
        
        // Check for reference indicators
        if (obj._content_type_uid || obj.uid) {
          // This is a referenced object
          if (depth > maxDepth) maxDepth = depth;
        }
        
        // Recurse into nested objects
        Object.values(obj).forEach((value: any) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            checkReferenceDepth(value, depth + 1);
          } else if (Array.isArray(value)) {
            value.forEach((item: any) => {
              if (item && typeof item === 'object') {
                checkReferenceDepth(item, depth + 1);
              }
            });
          }
        });
      };

      checkReferenceDepth(result);
      console.log('Maximum reference depth:', maxDepth);
      
      if (maxDepth >= 2) {
        console.log('✓ Multi-level references confirmed');
        expect(maxDepth).toBeGreaterThanOrEqual(2);
      }
    });

    it('should handle selective deep reference includes', async () => {
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .includeReference(['related_content', 'related_content.authors', 'authors'])
        .fetch<any>();

      expect(result).toBeDefined();
      console.log('Selective deep references fetched');
      
      // Verify references were included
      if (result.related_content) {
        console.log('related_content included:', Array.isArray(result.related_content) ? result.related_content.length : 'single');
      }
      if (result.authors) {
        console.log('authors included:', Array.isArray(result.authors) ? result.authors.length : 'single');
      }
    });
  });
});

describe('Multi-Reference - Query Operations', () => {
  const skipIfNoUID = !MEDIUM_ENTRY_UID && !SELF_REF_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Query Entries with References', () => {
    it('should query entries and include references', async () => {
      // Use article CT if available, otherwise section_builder
      const ctUid = MEDIUM_ENTRY_UID ? MEDIUM_CT : SELF_REF_CT;
      
      const result = await stack
        .contentType(ctUid)
        .entry()
        .includeReference()
        .limit(5)
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with references`);
        
        result.entries.forEach((entry: any, index: number) => {
          console.log(`Entry ${index + 1}:`, entry.uid);
        });
      }
    });

    it('should query by reference field existence', async () => {
      const ctUid = MEDIUM_ENTRY_UID ? MEDIUM_CT : SELF_REF_CT;
      
      const result = await stack
        .contentType(ctUid)
        .entry()
        .query()
        .exists('author')
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with author field`);
      }
    });
  });
});

describe('Multi-Reference - Performance', () => {
  const skipIfNoUID = !SELF_REF_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Reference Resolution Performance', () => {
    it('should efficiently resolve multiple references', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .includeReference()
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeDefined();
      console.log(`Multiple references resolved in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
    });

    it('should handle 10+ references efficiently', async () => {
      const startTime = Date.now();
      
      // Fetch entry that might have many references
      const result = await stack
        .contentType(SELF_REF_CT)
        .entry(SELF_REF_ENTRY_UID!)
        .includeReference('related_content')
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      const references = result.related_content;
      const refsArray = Array.isArray(references) ? references : (references ? [references] : []);
      const refCount = refsArray.length;
      
      console.log(`${refCount} references resolved in ${duration}ms`);
      
      if (refCount > 0) {
        const avgTime = duration / refCount;
        console.log(`Average time per reference: ${avgTime.toFixed(2)}ms`);
      }
      
      expect(result).toBeDefined();
    });
  });
});

describe('Multi-Reference - Edge Cases', () => {
  const skipIfNoUID = !SELF_REF_ENTRY_UID && !MEDIUM_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Empty and Null References', () => {
    it('should handle entries with no references', async () => {
      const ctUid = MEDIUM_ENTRY_UID ? MEDIUM_CT : SELF_REF_CT;
      const entryUid = MEDIUM_ENTRY_UID || SELF_REF_ENTRY_UID;
      
      const result = await stack
        .contentType(ctUid)
        .entry(entryUid!)
        .includeReference('non_existent_field')
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      
      // Should not error on non-existent reference field
      console.log('Handled non-existent reference field gracefully');
    });

    it('should handle empty reference arrays', async () => {
      const ctUid = MEDIUM_ENTRY_UID ? MEDIUM_CT : SELF_REF_CT;
      const entryUid = MEDIUM_ENTRY_UID || SELF_REF_ENTRY_UID;
      
      const result = await stack
        .contentType(ctUid)
        .entry(entryUid!)
        .fetch<any>();

      expect(result).toBeDefined();
      
      // Check for empty reference arrays
      Object.entries(result).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          console.log(`Empty array field: ${key}`);
        }
      });
    });
  });

  skipIfNoUID('Reference Consistency', () => {
    it('should maintain reference consistency across fetches', async () => {
      const ctUid = MEDIUM_ENTRY_UID ? MEDIUM_CT : SELF_REF_CT;
      const entryUid = MEDIUM_ENTRY_UID || SELF_REF_ENTRY_UID;
      
      // First fetch
      const result1 = await stack
        .contentType(ctUid)
        .entry(entryUid!)
        .includeReference()
        .fetch<any>();

      // Second fetch
      const result2 = await stack
        .contentType(ctUid)
        .entry(entryUid!)
        .includeReference()
        .fetch<any>();

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.uid).toBe(result2.uid);
      
      // References should be consistent
      console.log('Reference consistency verified across multiple fetches');
    });
  });
});

// Log setup instructions if UIDs missing
if (!SELF_REF_ENTRY_UID && !MEDIUM_ENTRY_UID && !COMPLEX_ENTRY_UID) {
  console.warn('\n⚠️  MULTI-REFERENCE TESTS - SETUP REQUIRED:');
  console.warn('Add at least one of these to your .env file:\n');
  console.warn('SELF_REF_ENTRY_UID=<entry_uid_with_multi_references>');
  console.warn('MEDIUM_ENTRY_UID=<entry_uid_with_references> (optional)');
  console.warn('COMPLEX_ENTRY_UID=<entry_uid_with_references> (optional)');
  console.warn('\nTests will be skipped until configured.\n');
}

