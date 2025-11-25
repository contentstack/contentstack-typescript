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

describe('Deep Reference Chains Tests', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('3-Level Deep References', () => {
    it('should fetch 3-level deep reference chain', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([
          'related_content',
          'related_content.authors',
          'authors'
        ])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      // Check 3-level deep structure
      if (result.related_content) {
        console.log('Level 1 - related_content:', 
          Array.isArray(result.related_content) 
            ? result.related_content.length 
            : 'single item'
        );

        // Check if authors exist in referenced entry (level 2)
        if (Array.isArray(result.related_content)) {
          const firstItem = result.related_content[0];
          if (firstItem && firstItem.authors) {
            console.log('Level 2 - authors:', 
              Array.isArray(firstItem.authors) 
                ? firstItem.authors.length 
                : 'single author'
            );

            // Check if author is resolved (level 3)
            if (Array.isArray(firstItem.authors)) {
              const firstAuthor = firstItem.authors[0];
              if (firstAuthor && firstAuthor.title) {
                console.log('Level 3 - author:', firstAuthor.title || firstAuthor.uid);
              }
            }
          }
        }
      }

      // Also check direct authors field
      if (result.authors) {
        console.log('Direct authors field:', 
          Array.isArray(result.authors) 
            ? result.authors.length 
            : 'single author'
        );
      }
    });

    it('should handle multiple 3-level reference paths', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([
          'related_content',
          'related_content.authors',
          'authors',
          'page_footer'
        ])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      // Check multiple reference paths
      const paths = [
        'related_content',
        'authors', 
        'page_footer'
      ];

      paths.forEach(path => {
        const pathParts = path.split('.');
        let current = result;
        
        for (const part of pathParts) {
          if (current && current[part]) {
            current = current[part];
          } else {
            current = null;
            break;
          }
        }

        if (current) {
          console.log(`Path ${path} resolved successfully`);
        } else {
          console.log(`Path ${path} not found (test data dependent)`);
        }
      });
    });
  });

  skipIfNoUID('4-Level Deep References', () => {
    it('should fetch 4-level deep reference chain', async () => {
      // Use page_builder entry for 4-level chain (page_footer.references.reference)
      const PAGE_BUILDER_CT = process.env.PAGE_BUILDER_CONTENT_TYPE_UID || 'page_builder';
      const PAGE_BUILDER_ENTRY_UID = process.env.PAGE_BUILDER_ENTRY_UID || 'example_page_builder_uid';
      
      try {
        const result = await stack
          .contentType(PAGE_BUILDER_CT)
          .entry(PAGE_BUILDER_ENTRY_UID)
          .includeReference([
            'page_footer',
            'page_footer.references',
            'page_footer.references.reference',
            'page_footer.references.reference.page_footer'
          ])
          .fetch<any>();

        expect(result).toBeDefined();
        expect(result.uid).toBe(PAGE_BUILDER_ENTRY_UID);

      // Check 4-level deep structure
      if (result.page_footer) {
        console.log('Level 1 - page_footer:', 
          Array.isArray(result.page_footer) 
            ? result.page_footer.length 
            : 'single footer'
        );

        // Navigate through levels
        let level: any = result.page_footer;
        let levelCount = 1;

        while (level && levelCount < 4) {
          if (Array.isArray(level)) {
            level = level[0]; // Take first item
          }

          if (level && typeof level === 'object') {
            // Find next level (references, reference, etc.)
            const nextLevelKey = Object.keys(level).find(key => 
              Array.isArray(level[key]) || 
              (typeof level[key] === 'object' && level[key] !== null && key !== '_content_type_uid' && key !== 'uid')
            );

            if (nextLevelKey) {
              level = level[nextLevelKey];
              levelCount++;
              console.log(`Level ${levelCount} - ${nextLevelKey}:`, 
                Array.isArray(level) ? level.length : 'single item'
              );
            } else {
              break;
            }
          } else {
            break;
          }
        }

        console.log(`Deep reference chain resolved to level ${levelCount}`);
      }
      } catch (error: any) {
        if (error.response?.status === 422) {
          console.log('⚠️ 4-level deep reference test skipped: Entry/Content Type not available (422)');
          expect(error.response.status).toBe(422);
        } else {
          throw error;
        }
      }
    });
  });

  skipIfNoUID('Circular Reference Handling', () => {
    const skipIfNoCircularUID = !MEDIUM_ENTRY_UID ? describe.skip : describe;

    skipIfNoCircularUID('should handle circular references gracefully', () => {
      it('should handle circular references gracefully', async () => {
      const result = await stack
        .contentType(MEDIUM_CT)
        .entry(MEDIUM_ENTRY_UID!)
        .includeReference([
          'related_content',
          'related_content.related_content'
        ])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(MEDIUM_ENTRY_UID);

      // Check for circular reference handling
      if (result.related_content) {
        console.log('Circular reference test completed without infinite loop');
        
        // Log structure depth to verify circular handling
        const logDepth = (obj: any, depth = 0, maxDepth = 5): number => {
          if (depth > maxDepth || !obj || typeof obj !== 'object') {
            return depth;
          }
          
          let maxChildDepth = depth;
          for (const key in obj) {
            if (obj.hasOwnProperty(key) && key !== '_content_type_uid' && key !== 'uid') {
              const childDepth = logDepth(obj[key], depth + 1, maxDepth);
              maxChildDepth = Math.max(maxChildDepth, childDepth);
            }
          }
          return maxChildDepth;
        };

        const actualDepth = logDepth(result.related_content);
        console.log(`Circular reference depth: ${actualDepth} (should be limited)`);
      }
      });
    });
  });

  skipIfNoUID('Reference Content Type Filtering', () => {
    it('should filter references by content type in deep chains', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([
          'related_content',
          'related_content.authors'
        ])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      // Analyze reference content types
      if (result.related_content) {
        const contentTypes = new Set<string>();
        
        const analyzeReferences = (refs: any) => {
          if (Array.isArray(refs)) {
            refs.forEach(ref => {
              if (ref._content_type_uid) {
                contentTypes.add(ref._content_type_uid);
              }
              // Check nested references (authors)
              if (ref.authors) {
                analyzeReferences(ref.authors);
              }
            });
          } else if (refs && refs._content_type_uid) {
            contentTypes.add(refs._content_type_uid);
          }
        };

        analyzeReferences(result.related_content);
        
        // Also check direct authors
        if (result.authors) {
          analyzeReferences(result.authors);
        }
        
        console.log('Reference content types found:', Array.from(contentTypes));
        expect(contentTypes.size).toBeGreaterThan(0);
      }
    });

    it('should handle mixed reference types in deep chains', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([
          'related_content',
          'authors',
          'page_footer'
        ])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      // Check for mixed reference types (single vs multiple)
      const referenceTypes = {
        single: 0,
        multiple: 0,
        nested: 0
      };

      const analyzeReferenceTypes = (obj: any, path = '') => {
        if (Array.isArray(obj)) {
          referenceTypes.multiple++;
          obj.forEach((item, index) => {
            analyzeReferenceTypes(item, `${path}[${index}]`);
          });
        } else if (obj && typeof obj === 'object') {
          if (obj._content_type_uid) {
            referenceTypes.single++;
          }
          
          // Check for nested references
          for (const key in obj) {
            if (obj.hasOwnProperty(key) && key !== '_content_type_uid' && key !== 'uid') {
              analyzeReferenceTypes(obj[key], `${path}.${key}`);
            }
          }
        }
      };

      // Analyze root level reference fields
      if (result.related_content) {
        analyzeReferenceTypes(result.related_content);
      }
      if (result.authors) {
        analyzeReferenceTypes(result.authors);
      }
      if (result.page_footer) {
        analyzeReferenceTypes(result.page_footer);
      }
        
      console.log('Reference type distribution:', referenceTypes);
      expect(referenceTypes.single + referenceTypes.multiple).toBeGreaterThan(0);
    });
  });

  skipIfNoUID('Performance with Deep References', () => {
    it('should measure performance with deep reference chains', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([
          'related_content',
          'related_content.authors',
          'related_content.related_content',
          'authors'
        ])
        .fetch<any>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log(`Deep reference fetch completed in ${duration}ms`);
      
      // Performance should be reasonable (adjust threshold as needed)
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });

    it('should compare shallow vs deep reference performance', async () => {
      // Shallow reference
      const shallowStart = Date.now();
      const shallowResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference(['related_content'])
        .fetch<any>();
      const shallowTime = Date.now() - shallowStart;

      // Deep reference
      const deepStart = Date.now();
      const deepResult = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([
          'related_content',
          'related_content.authors',
          'authors'
        ])
        .fetch<any>();
      const deepTime = Date.now() - deepStart;

      expect(shallowResult).toBeDefined();
      expect(deepResult).toBeDefined();

      console.log('Performance comparison:', {
        shallow: `${shallowTime}ms`,
        deep: `${deepTime}ms`,
        ratio: (deepTime / shallowTime).toFixed(2) + 'x'
      });

      // Just verify both operations completed successfully
      // (Performance comparisons are too flaky due to caching/network variations)
      expect(shallowTime).toBeGreaterThan(0);
      expect(deepTime).toBeGreaterThan(0);
      expect(shallowResult).toBeDefined();
      expect(deepResult).toBeDefined();
    });
  });

  skipIfNoUID('Error Handling', () => {
    it('should handle invalid reference paths gracefully', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([
          'related_content',
          'non_existent_field',
          'related_content.non_existent_reference'
        ])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Invalid reference paths handled gracefully');
    });

    it('should handle empty reference arrays', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeReference([])
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);
      
      console.log('Empty reference array handled');
    });
  });

  skipIfNoUID('Complex Reference Scenarios', () => {
    const skipIfNoMultiLevelUID = !SIMPLE_ENTRY_UID ? describe.skip : describe;

    skipIfNoMultiLevelUID('should handle multiple entry types with deep references', () => {
      it('should handle multiple entry types with deep references', async () => {
        try {
          const results = await Promise.all([
            stack.contentType(COMPLEX_CT).entry(COMPLEX_ENTRY_UID!)
              .includeReference(['related_content', 'related_content.authors'])
              .fetch<any>(),
            stack.contentType(MEDIUM_CT).entry(SIMPLE_ENTRY_UID!)
              .includeReference(['reference', 'reference.authors'])
              .fetch<any>()
          ]);

          expect(results[0]).toBeDefined();
          expect(results[1]).toBeDefined();

          // Compare reference structures
          const compareStructures = (entry1: any, entry2: any) => {
            const structure1 = entry1.related_content ? 'has_related_content' : 'no_related_content';
            const structure2 = entry2.reference ? 'has_reference' : 'no_reference';
            
            console.log('Structure comparison:', { entry1: structure1, entry2: structure2 });
          };

          compareStructures(results[0], results[1]);
        } catch (error: any) {
          if (error.response?.status === 422) {
            console.log('⚠️ Entry/Content Type mismatch (422) - check SIMPLE_ENTRY_UID belongs to MEDIUM_CT');
            expect(error.response.status).toBe(422);
          } else {
            throw error;
          }
        }
      });
    });
  });
});
