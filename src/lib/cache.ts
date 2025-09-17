// import { PersistanceStore } from '../persistance';

import { PersistanceStore } from '../persistance';
import { CacheOptions, Policy } from './types';

/**
 * Extracts entry UID from request URL if available
 * @param config - Request config object
 * @returns entry UID if found, null otherwise
 */
function extractEntryUidFromUrl(config: any): string | null {
  if (!config.url) return null;
  
  // Match patterns like: /content_types/{content_type_uid}/entries/{entry_uid}
  const entryUrlPattern = /\/content_types\/[^\/]+\/entries\/([^\/\?]+)/;
  const match = config.url.match(entryUrlPattern);
  
  return match ? match[1] : null;
}

/**
 * Generates an improved cache key using content type UID and entry UID
 * @param originalKey - Original cache key (apiKey)
 * @param contentTypeUid - Content type UID
 * @param entryUid - Entry UID (optional)
 * @returns Enhanced cache key
 */
function generateEnhancedCacheKey(originalKey: string, contentTypeUid?: string, entryUid?: string): string {
  let cacheKey = originalKey;
  
  if (contentTypeUid) {
    cacheKey = `${contentTypeUid}_${cacheKey}`;
  }
  
  if (entryUid) {
    cacheKey = `${cacheKey}_entry_${entryUid}`;
  }
  
  return cacheKey;
}

export async function handleRequest(
  cacheOptions: CacheOptions,
  apiKey: string,
  defaultAdapter: any,
  resolve: any,
  reject: any,
  config: any
) {
  const cacheStore = new PersistanceStore(cacheOptions);
  
  // Extract entry UID from URL or config
  const entryUid = config.entryUid || extractEntryUidFromUrl(config);
  
  // Generate enhanced cache key using content type UID and entry UID
  const enhancedCacheKey = generateEnhancedCacheKey(apiKey, config.contentTypeUid, entryUid);
  
  switch (cacheOptions.policy) {
    case Policy.NETWORK_ELSE_CACHE: {
      const apiResponse = await defaultAdapter(config);

      if (apiResponse.data) {
        cacheStore.setItem(enhancedCacheKey, JSON.parse(apiResponse.data), config.contentTypeUid, cacheOptions.maxAge);

        return resolve({data: JSON.parse(apiResponse.data)});
      } else {
        const cacheResponse = cacheStore.getItem(enhancedCacheKey, config.contentTypeUid);
        if (cacheResponse)
          return resolve({
            data: cacheResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
          });
      }

      return reject(apiResponse);
    }
    case Policy.CACHE_THEN_NETWORK: {
      const cacheResponse = cacheStore.getItem(enhancedCacheKey, config.contentTypeUid);
      if (cacheResponse)
        return resolve({
          data: cacheResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        });

      const apiResponse = await defaultAdapter(config);

      if (apiResponse.data) {
        cacheStore.setItem(enhancedCacheKey, JSON.parse(apiResponse.data), config.contentTypeUid, cacheOptions.maxAge);

        return resolve({data: JSON.parse(apiResponse.data)});
      } else {
        return reject(apiResponse);
      }
    }
    case Policy.CACHE_ELSE_NETWORK: {
      const cacheResponse = cacheStore.getItem(enhancedCacheKey, config.contentTypeUid);

      if (cacheResponse)
        return resolve({
          data: cacheResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        });
      else {
        const apiResponse = await defaultAdapter(config);

        if (apiResponse.data) {
          cacheStore.setItem(enhancedCacheKey, JSON.parse(apiResponse.data), config.contentTypeUid, cacheOptions.maxAge);

          return resolve({data: JSON.parse(apiResponse.data)});
        } else {
          return reject(apiResponse);
        }
      }
    }
  }
}