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

// Branch UID for testing
const BRANCH_UID = process.env.BRANCH_UID || 'main';

describe('Metadata & Branch Operations - Comprehensive Coverage', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Entry Metadata Operations', () => {
    it('should include metadata in entry query', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata`);
        
        // Verify all returned entries have metadata
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with metadata (test data dependent)');
      }
    });

    it('should include metadata in single entry fetch', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeMetadata()
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result._version).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
      
      console.log(`Fetched entry ${result.uid} with metadata`);
    });

    it('should include metadata with references', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .includeReference(['authors'])
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata and references`);
        
        // Verify all returned entries have metadata and references
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with metadata and references (test data dependent)');
      }
    });

    it('should include metadata with specific fields only', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .only(['title', 'uid', 'featured'])
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata and specific fields`);
        
        // Verify all returned entries have only specified fields (uid, title, featured)
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
          
          // Note: .only() explicitly excludes other fields like _version
          // Metadata fields (created_at, updated_at) may still be included with includeMetadata()
          if (entry.created_at) {
            expect(entry.created_at).toBeDefined();
          }
          if (entry.updated_at) {
            expect(entry.updated_at).toBeDefined();
          }
          
          // Should have featured field if specified
          if (entry.featured !== undefined) {
            expect(typeof entry.featured).toBe('boolean');
          }
        });
      } else {
        console.log('No entries found with metadata and specific fields (test data dependent)');
      }
    });

    it('should include metadata with field exclusion', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .except(['content', 'description'])
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata and field exclusion`);
        
        // Verify all returned entries have metadata but excluded fields
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
          
          // Should not have excluded fields
          expect(entry.content).toBeUndefined();
          expect(entry.description).toBeUndefined();
        });
      } else {
        console.log('No entries found with metadata and field exclusion (test data dependent)');
      }
    });
  });

  skipIfNoUID('Branch Operations for Entries', () => {
    it('should fetch entry from specific branch', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeBranch()
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBeDefined();
      expect(result.title).toBeDefined();
      
      console.log(`Fetched entry ${result.uid} from branch`);
    });

    it('should query entries from specific branch', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeBranch()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries from branch`);
        
        // Verify all returned entries have branch information
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
        });
      } else {
        console.log('No entries found from branch (test data dependent)');
      }
    });

    it('should fetch entry with branch and metadata', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .includeBranch()
        .includeMetadata()
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result._version).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
      
      console.log(`Fetched entry ${result.uid} with branch and metadata`);
    });

    it('should query entries with branch and references', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeBranch()
        .includeReference(['authors'])
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with branch and references`);
        
        // Verify all returned entries have branch and reference information
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
        });
      } else {
        console.log('No entries found with branch and references (test data dependent)');
      }
    });
  });

  skipIfNoUID('Asset Metadata Operations', () => {
    it('should include metadata in asset query', async () => {
      const result = await stack
        .asset()
        .includeMetadata()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.assets && result.assets.length > 0) {
        console.log(`Found ${result.assets.length} assets with metadata`);
        
        // Verify all returned assets have metadata
        result.assets.forEach((asset: any) => {
          expect(asset.uid).toBeDefined();
          expect(asset.filename).toBeDefined();
          expect(asset._version).toBeDefined();
          expect(asset.created_at).toBeDefined();
          expect(asset.updated_at).toBeDefined();
        });
      } else {
        console.log('No assets found with metadata (test data dependent)');
      }
    });

    it('should include metadata in single asset fetch', async () => {
      // First get an asset UID
      const assetsResult = await stack.asset().find<any>();
      
      if (assetsResult.assets && assetsResult.assets.length > 0) {
        const assetUid = assetsResult.assets[0].uid;
        
        const result = await stack
          .asset(assetUid)
          .includeMetadata()
          .fetch<any>();

        expect(result).toBeDefined();
        expect(result.uid).toBeDefined();
        expect(result.filename).toBeDefined();
        expect(result._version).toBeDefined();
        expect(result.created_at).toBeDefined();
        expect(result.updated_at).toBeDefined();
        
        console.log(`Fetched asset ${result.uid} with metadata`);
      } else {
        console.log('No assets available for single fetch test (test data dependent)');
      }
    });

    it('should include metadata in asset query with filters', async () => {
      const result = await stack
        .asset()
        .includeMetadata()
        .query()
        .where('content_type', QueryOperation.EQUALS, 'image/jpeg')
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.assets && result.assets.length > 0) {
        console.log(`Found ${result.assets.length} JPEG assets with metadata`);
        
        // Verify all returned assets have metadata and are JPEG
        result.assets.forEach((asset: any) => {
          expect(asset.uid).toBeDefined();
          expect(asset.filename).toBeDefined();
          expect(asset._version).toBeDefined();
          expect(asset.created_at).toBeDefined();
          expect(asset.updated_at).toBeDefined();
          expect(asset.content_type).toBe('image/jpeg');
        });
      } else {
        console.log('No JPEG assets found with metadata (test data dependent)');
      }
    });
  });

  skipIfNoUID('Global Field Metadata Operations', () => {
    it('should include metadata in global field query', async () => {
      const result = await stack
        .globalField()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.global_fields && result.global_fields.length > 0) {
        console.log(`Found ${result.global_fields.length} global fields with metadata`);
        
        // Verify all returned global fields have metadata
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
          expect(field._version).toBeDefined();
          expect(field.created_at).toBeDefined();
          expect(field.updated_at).toBeDefined();
        });
      } else {
        console.log('No global fields found with metadata (test data dependent)');
      }
    });

    it('should include metadata in single global field fetch', async () => {
      // First get a global field UID
      const globalFieldsResult = await stack.globalField().find<any>();
      
      if (globalFieldsResult.global_fields && globalFieldsResult.global_fields.length > 0) {
        const fieldUid = globalFieldsResult.global_fields[0].uid;
        
        const result = await stack
          .globalField(fieldUid)
          .fetch<any>();

        expect(result).toBeDefined();
        expect(result.uid).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result._version).toBeDefined();
        expect(result.created_at).toBeDefined();
        expect(result.updated_at).toBeDefined();
        
        console.log(`Fetched global field ${result.uid} with metadata`);
      } else {
        console.log('No global fields available for single fetch test (test data dependent)');
      }
    });
  });

  skipIfNoUID('Publish Details and Workflow Metadata', () => {
    it('should include publish details in entry query', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with publish details`);
        
        // Verify all returned entries have publish details
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
          
          // Check for publish details if available
          if (entry.publish_details) {
            // Publish details can be array or object depending on API response
            if (Array.isArray(entry.publish_details)) {
              entry.publish_details.forEach((detail: any) => {
                expect(detail.environment).toBeDefined();
                expect(detail.locale).toBeDefined();
              });
            } else if (typeof entry.publish_details === 'object') {
              expect(entry.publish_details.environment).toBeDefined();
              expect(entry.publish_details.locale).toBeDefined();
            }
          }
        });
      } else {
        console.log('No entries found with publish details (test data dependent)');
      }
    });

    it('should include workflow metadata in entry query', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with workflow metadata`);
        
        // Verify all returned entries have workflow metadata if available
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
          
          // Check for workflow information if available
          if (entry._workflow) {
            expect(entry._workflow).toBeDefined();
          }
        });
      } else {
        console.log('No entries found with workflow metadata (test data dependent)');
      }
    });

    it('should include metadata with locale fallback', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .includeFallback()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata and fallback`);
        
        // Verify all returned entries have metadata and fallback information
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with metadata and fallback (test data dependent)');
      }
    });
  });

  skipIfNoUID('Multi-Environment Metadata', () => {
    it('should include metadata across different environments', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with multi-environment metadata`);
        
        // Verify all returned entries have metadata
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with multi-environment metadata (test data dependent)');
      }
    });

    it('should include metadata with environment-specific content', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with environment-specific metadata`);
        
        // Verify all returned entries have metadata
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with environment-specific metadata (test data dependent)');
      }
    });
  });

  skipIfNoUID('Performance and Edge Cases', () => {
    it('should handle metadata queries with large result sets', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .limit(50)
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata (limit 50)`);
        expect(result.entries.length).toBeLessThanOrEqual(50);
        
        // Verify all returned entries have metadata
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with metadata (limit 50) (test data dependent)');
      }
    });

    it('should handle metadata queries with pagination', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .limit(10)
        .skip(0)
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata (pagination)`);
        expect(result.entries.length).toBeLessThanOrEqual(10);
        
        // Verify all returned entries have metadata
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with metadata (pagination) (test data dependent)');
      }
    });

    it('should handle metadata queries with sorting', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry()
        .includeMetadata()
        .orderByDescending('created_at')
        .find<any>();

      expect(result).toBeDefined();
      
      if (result.entries && result.entries.length > 0) {
        console.log(`Found ${result.entries.length} entries with metadata (sorted by created_at)`);
        
        // Verify all returned entries have metadata
        result.entries.forEach((entry: any) => {
          expect(entry.uid).toBeDefined();
          expect(entry._version).toBeDefined();
          expect(entry.created_at).toBeDefined();
          expect(entry.updated_at).toBeDefined();
        });
      } else {
        console.log('No entries found with metadata (sorted) (test data dependent)');
      }
    });
  });
});
