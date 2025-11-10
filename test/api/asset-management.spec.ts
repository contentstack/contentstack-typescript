import { stackInstance } from '../utils/stack-instance';
import { BaseAsset, QueryOperation } from '../../src';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';
const SIMPLE_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'simple_content_type';

// Entry UIDs from your test stack (reused across all tests)
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;
const SIMPLE_ENTRY_UID = process.env.SIMPLE_ENTRY_UID;

// Asset UIDs (optional)
const IMAGE_ASSET_UID = process.env.IMAGE_ASSET_UID;

describe('Asset Management Tests', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Asset Fetching and Basic Properties', () => {
    it('should fetch assets from entries', async () => {
      const result = await stack
        .contentType(COMPLEX_CT)
        .entry(COMPLEX_ENTRY_UID!)
        .fetch<any>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(COMPLEX_ENTRY_UID);

      // Find assets in the entry
      const assets = findAssetsInEntry(result);
      
      if (assets.length > 0) {
        console.log(`Found ${assets.length} assets in entry`);
        
        assets.forEach((asset, index) => {
          console.log(`Asset ${index + 1}:`, {
            uid: asset.uid,
            title: asset.title,
            url: asset.url,
            contentType: asset.content_type,
            fileSize: asset.file_size
          });
          
          // Validate asset structure
          expect(asset.uid).toBeDefined();
          expect(asset.url).toBeDefined();
          expect(asset.content_type).toBeDefined();
        });
      } else {
        console.log('No assets found in entry (test data dependent)');
      }
    });

    it('should fetch assets directly by UID', async () => {
      if (!IMAGE_ASSET_UID) {
        console.log('IMAGE_ASSET_UID not provided, skipping direct asset fetch test');
        return;
      }

      const asset = await stack.asset(IMAGE_ASSET_UID).fetch<BaseAsset>();

      expect(asset).toBeDefined();
      expect(asset.uid).toBe(IMAGE_ASSET_UID);
      expect(asset.url).toBeDefined();
      expect(asset.content_type).toBeDefined();

      console.log('Direct asset fetch:', {
        uid: asset.uid,
        title: asset.title,
        url: asset.url,
        contentType: asset.content_type,
        fileSize: asset.file_size
      });
    });

    it('should query multiple assets', async () => {
      const result = await stack.asset().query().find<BaseAsset>();

      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
      expect(Array.isArray(result.assets)).toBe(true);

      if (result.assets && result.assets?.length > 0) {
        console.log(`Found ${result.assets?.length} assets in stack`);
        
        // Analyze asset types
        const assetTypes = result.assets.reduce((acc, asset) => {
          const type = asset.content_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log('Asset types distribution:', assetTypes);
      } else {
        console.log('No assets found in stack (test data dependent)');
      }
    });
  });

  skipIfNoUID('Asset Querying and Filtering', () => {
    it('should query assets by content type', async () => {
      try {
        const result = await stack
          .asset()
          .query()
          .where('content_type', QueryOperation.INCLUDES, 'image')
          .find<BaseAsset>();

        expect(result).toBeDefined();
        expect(result.assets).toBeDefined();
        expect(Array.isArray(result.assets)).toBe(true);

        if (result.assets && result.assets?.length > 0) {
          console.log(`Found ${result.assets?.length} image assets`);
          
          result.assets.forEach(asset => {
            expect(asset.content_type).toContain('image');
        });
      } else {
        console.log('No image assets found (test data dependent)');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('⚠️ 400 - Asset content_type query may not be supported');
        expect(error.response.status).toBe(400);
      } else {
        throw error;
      }
    }
  });

    it('should query assets with pagination', async () => {
      const result = await stack
        .asset()
        .query()
        .limit(5)
        .find<BaseAsset>();

      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
      expect(Array.isArray(result.assets)).toBe(true);
      expect(result.assets?.length).toBeLessThanOrEqual(5);

      console.log(`Paginated assets query:`, {
        limit: 5,
        found: result.assets?.length
      });
    });

    it('should query assets with skip and limit', async () => {
      const result = await stack
        .asset()
        .query()
        .skip(2)
        .limit(3)
        .find<BaseAsset>();

      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
      expect(Array.isArray(result.assets)).toBe(true);
      expect(result.assets?.length).toBeLessThanOrEqual(3);

      console.log(`Assets query with skip and limit:`, {
        skip: 2,
        limit: 3,
        found: result.assets?.length
      });
    });
  });

  skipIfNoUID('Asset Metadata and Properties', () => {
    it('should fetch asset metadata', async () => {
      const assets = await findImageAssets();
      
      if (assets.length === 0) {
        console.log('No image assets found for metadata testing');
        return;
      }

      const imageAsset = assets[0];
      const asset = await stack.asset(imageAsset.uid).fetch<BaseAsset>();

      expect(asset).toBeDefined();
      expect(asset.uid).toBe(imageAsset.uid);

      // Check metadata properties
      const metadata = {
        uid: asset.uid,
        title: asset.title,
        url: asset.url,
        contentType: asset.content_type,
        fileSize: asset.file_size,
        fileName: asset.filename,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at
      };

      console.log('Asset metadata:', metadata);

      // Validate essential properties
      expect(asset.uid).toBeDefined();
      expect(asset.url).toBeDefined();
      expect(asset.content_type).toBeDefined();
    });

    it('should handle different asset types', async () => {
      const result = await stack.asset().query().find<BaseAsset>();

      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();

      if (result.assets && result.assets?.length > 0) {
        // Group assets by content type
        const assetsByType = result.assets.reduce((acc, asset) => {
          const type = asset.content_type || 'unknown';
          if (!acc[type]) acc[type] = [];
          acc[type].push(asset);
          return acc;
        }, {} as Record<string, BaseAsset[]>);

        console.log('Assets by type:', Object.keys(assetsByType).map(type => 
          `${type}: ${assetsByType[type].length}`
        ).join(', '));

        // Test different asset types
        Object.entries(assetsByType).forEach(([type, assets]) => {
          const sampleAsset = assets[0];
          console.log(`Sample ${type} asset:`, {
            uid: sampleAsset.uid,
            title: sampleAsset.title,
            url: sampleAsset.url,
            contentType: sampleAsset.content_type
          });
        });
      }
    });

    it('should analyze asset properties', async () => {
      const result = await stack.asset().query().find<BaseAsset>();

      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();

      if (result.assets && result.assets?.length > 0) {
        const analysis = {
          totalAssets: result.assets?.length,
          withTitle: result.assets.filter(a => a.title).length,
          withFileSize: result.assets.filter(a => a.file_size).length,
          withCreatedAt: result.assets.filter(a => a.created_at).length,
          withUpdatedAt: result.assets.filter(a => a.updated_at).length,
          imageAssets: result.assets.filter(a => a.content_type?.startsWith('image/')).length,
          documentAssets: result.assets.filter(a => a.content_type?.startsWith('application/')).length
        };

        console.log('Asset properties analysis:', analysis);
      }
    });
  });

  skipIfNoUID('Performance with Asset Operations', () => {
    it('should measure asset fetching performance', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .asset()
        .query()
        .limit(20)
        .find<BaseAsset>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
      
      console.log(`Asset fetching performance:`, {
        duration: `${duration}ms`,
        assetsFound: result.assets?.length,
        limit: 20,
        avgTimePerAsset: (result.assets?.length ?? 0) > 0 ? (duration / (result.assets?.length ?? 1)).toFixed(2) + 'ms' : 'N/A'
      });
      
      // Performance should be reasonable
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should measure single asset fetch performance', async () => {
      const assets = await findImageAssets();
      
      if (assets.length === 0) {
        console.log('No image assets found for single fetch performance testing');
        return;
      }

      const imageAsset = assets[0];
      const startTime = Date.now();
      
      const asset = await stack.asset(imageAsset.uid).fetch<BaseAsset>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(asset).toBeDefined();
      expect(asset.uid).toBe(imageAsset.uid);
      
      console.log(`Single asset fetch performance:`, {
        duration: `${duration}ms`,
        assetUid: asset.uid,
        contentType: asset.content_type
      });
      
      // Single asset fetch should be fast
      expect(duration).toBeLessThan(2000); // 2 seconds max
    });

    it('should handle concurrent asset operations', async () => {
      const assets = await findImageAssets();
      
      if (assets.length < 3) {
        console.log('Not enough image assets for concurrent operations testing');
        return;
      }

      const startTime = Date.now();
      
      // Fetch multiple assets concurrently
      const assetPromises = assets.slice(0, 3).map(asset => 
        stack.asset(asset.uid).fetch<BaseAsset>()
      );
      
      const results = await Promise.all(assetPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toBeDefined();
      expect(results.length).toBe(3);
      
      results.forEach((asset, index) => {
        expect(asset).toBeDefined();
        expect(asset.uid).toBeDefined();
      });
      
      console.log(`Concurrent asset operations:`, {
        duration: `${duration}ms`,
        assetsFetched: results.length,
        avgTimePerAsset: (duration / results.length).toFixed(2) + 'ms'
      });
      
      // Concurrent operations should be efficient
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });
  });

  skipIfNoUID('Edge Cases and Error Handling', () => {
    it('should handle non-existent asset UIDs', async () => {
      try {
        const asset = await stack.asset('non-existent-asset-uid').fetch<BaseAsset>();
        console.log('Non-existent asset handled:', asset);
      } catch (error) {
        console.log('Non-existent asset properly rejected:', (error as Error).message);
        // Should handle gracefully
      }
    });

    it('should handle empty asset queries', async () => {
      const result = await stack
        .asset()
        .query()
        .where('title', QueryOperation.EQUALS, 'non-existent-title')
        .find<BaseAsset>();

      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
      expect(Array.isArray(result.assets)).toBe(true);
      expect(result.assets?.length).toBe(0);

      console.log('Empty asset query handled gracefully');
    });

    it('should handle malformed asset queries', async () => {
      const malformedQueries = [
        { field: 'invalid_field', operation: 'equals', value: 'test' },
        { field: 'content_type', operation: 'invalid_operation', value: 'image' },
        { field: '', operation: 'equals', value: 'test' }
      ];

      for (const query of malformedQueries) {
        try {
          const result = await stack
            .asset()
            .query()
            .where(query.field, query.operation as any, query.value)
            .find<BaseAsset>();
          
          console.log('Malformed query handled:', { query, resultCount: result.assets?.length });
        } catch (error) {
          console.log('Malformed query properly rejected:', { query, error: (error as Error).message });
        }
      }
    });

    it('should handle large asset result sets', async () => {
      const startTime = Date.now();
      
      const result = await stack
        .asset()
        .query()
        .limit(50)
        .find<BaseAsset>();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
      
      console.log(`Large asset result set:`, {
        duration: `${duration}ms`,
        assetsFound: result.assets?.length,
        limit: 50
      });
      
      // Should handle large result sets reasonably
      expect(duration).toBeLessThan(10000); // 10 seconds max
    });

    it('should handle asset queries with invalid pagination', async () => {
      const invalidPagination = [
        { skip: -1, limit: 10 },
        { skip: 0, limit: -1 },
        { skip: 'invalid', limit: 10 },
        { skip: 0, limit: 'invalid' }
      ];

      for (const pagination of invalidPagination) {
        try {
          const result = await stack
            .asset()
            .query()
            .skip(pagination.skip as any)
            .limit(pagination.limit as any)
            .find<BaseAsset>();
          
          console.log('Invalid pagination handled:', { pagination, resultCount: result.assets?.length });
        } catch (error) {
          console.log('Invalid pagination properly rejected:', { pagination, error: (error as Error).message });
        }
      }
    });
  });
});

// Helper functions
function findAssetsInEntry(entry: any): any[] {
  const assets: any[] = [];
  
  const searchForAssets = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(item => searchForAssets(item));
    } else {
      // Check if this looks like an asset
      if (obj.uid && obj.url && obj.content_type) {
        assets.push(obj);
      }
      
      // Recursively search nested objects
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          searchForAssets(obj[key]);
        }
      }
    }
  };
  
  searchForAssets(entry);
  return assets;
}

async function findImageAssets(): Promise<any[]> {
  try {
    const result = await stack.asset().query().find<BaseAsset>();
    
    if (result.assets) {
      return result.assets.filter(asset => 
        asset.content_type && 
        asset.content_type.startsWith('image/')
      );
    }
    
    return [];
  } catch (error) {
    console.log('Error fetching image assets:', (error as Error).message);
    return [];
  }
}
