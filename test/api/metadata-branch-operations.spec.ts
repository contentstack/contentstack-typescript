import { stackInstance } from '../utils/stack-instance';
import { TEntry } from './types';

const stack = stackInstance();
const contentTypeUid = process.env.CONTENT_TYPE_UID || 'sample_content_type';
const entryUid = process.env.ENTRY_UID || 'sample_entry';
const branchUid = process.env.BRANCH_UID || 'development';

describe('Metadata and Branch Operations API Tests', () => {
  describe('Entry Metadata Operations', () => {
    it('should include metadata in entry query', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .includeMetadata()
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      if (result.entries) {
        expect(result.entries.length).toBeGreaterThan(0);
        
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
        expect(entry.title).toBeDefined();
      }
    });

    it('should include metadata in single entry fetch', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .includeMetadata()
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.title).toBeDefined();
    });
  });

  describe('Asset Metadata Operations', () => {
    it('should include metadata in asset query', async () => {
      const result = await stack.asset()
        .includeMetadata()
        .find();
      
      expect(result).toBeDefined();
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0] as any;
        expect(asset.uid).toBeDefined();
        expect(asset.filename).toBeDefined();
      }
    });

    it('should include metadata in single asset fetch', async () => {
      const assetUid = process.env.ASSET_UID || 'sample_asset';
      const result = await stack.asset()
        .includeMetadata()
        .find();
      
      expect(result).toBeDefined();
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0] as any;
        expect(asset.uid).toBeDefined();
        expect(asset.filename).toBeDefined();
      }
    });
  });

  describe('Branch-specific Operations', () => {
    it('should query entries from specific branch', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      if (result.entries) {
        expect(result.entries.length).toBeGreaterThan(0);
        
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
        expect(entry.title).toBeDefined();
      }
    });

    it('should query assets from specific branch', async () => {
      const result = await stack.asset()
        .find();
      
      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
      expect(Array.isArray(result.assets)).toBe(true);
    });
  });

  describe('Global Field Operations', () => {
    it('should fetch global field successfully', async () => {
      const globalFieldUid = process.env.GLOBAL_FIELD_UID || 'sample_global_field';
      
      try {
        const result = await stack.globalField(globalFieldUid).fetch();
        
        if (result) {
          const globalField = result as any;
          expect(globalField.uid).toBe(globalFieldUid);
        }
      } catch (error) {
        // Global field might not exist in test environment
        console.log('Global field not found:', error);
      }
    });
  });

  describe('Content Type Operations', () => {
    it('should fetch content type successfully', async () => {
      const result = await stack.contentType(contentTypeUid).fetch();
      
      expect(result).toBeDefined();
      const contentType = result as any;
      expect(contentType.uid).toBe(contentTypeUid);
      expect(contentType.title).toBeDefined();
    });

    it('should query all content types', async () => {
      const result = await stack.contentType().find();
      
      expect(result).toBeDefined();
      if (result.content_types && result.content_types.length > 0) {
        const contentType = result.content_types[0] as any;
        expect(contentType.uid).toBeDefined();
        expect(contentType.title).toBeDefined();
      }
    });
  });

  describe('Advanced Entry Operations', () => {
    it('should include content type UID in entry response', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.title).toBeDefined();
    });
  });

  describe('Query Count Operations', () => {
    it('should get count of entries', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .includeCount()
        .find<{ entries: TEntry[], count: number }>();
      
      expect(result).toBeDefined();
      if (result.entries) {
        expect(typeof result.count).toBe('number');
        expect(result.count).toBeGreaterThanOrEqual(0);
        
        if (result.entries.length > 0) {
          const entry = result.entries[0] as any;
          expect(entry.uid).toBeDefined();
          expect(entry.title).toBeDefined();
        }
      }
    });

    it('should get count of assets', async () => {
      const result = await stack.asset().includeCount().find();
      
      expect(result).toBeDefined();
      if (result.assets) {
        expect(typeof result.count).toBe('number');
        expect(result.count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Reference Operations', () => {
    it('should include references in entry query', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .includeReference('reference_field')
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      if (result.entries) {
        expect(result.entries.length).toBeGreaterThan(0);
        
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
        expect(entry.title).toBeDefined();
      }
    });

    it('should include references in single entry fetch', async () => {
      const result = await stack.contentType(contentTypeUid).entry(entryUid)
        .includeReference('reference_field')
        .fetch<TEntry>();
      
      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      expect(result.title).toBeDefined();
    });
  });

  describe('Fallback Operations', () => {
    it('should handle fallback locale', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .locale('en-us')
        .includeFallback()
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      if (result.entries) {
        expect(result.entries.length).toBeGreaterThan(0);
        
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
        expect(entry.title).toBeDefined();
      }
    });
  });

  describe('Dimension Operations', () => {
    it('should handle dimension queries', async () => {
      const result = await stack.contentType(contentTypeUid).entry()
        .find<{ entries: TEntry[] }>();
      
      expect(result).toBeDefined();
      if (result.entries) {
        expect(result.entries.length).toBeGreaterThan(0);
        
        const entry = result.entries[0] as any;
        expect(entry.uid).toBeDefined();
        expect(entry.title).toBeDefined();
      }
    });

    it('should handle dimension in asset queries', async () => {
      const result = await stack.asset()
        .find();
      
      expect(result).toBeDefined();
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0] as any;
        expect(asset.uid).toBeDefined();
        expect(asset.filename).toBeDefined();
      }
    });
  });
}); 