import { Region, params } from './types';

export function getHostforRegion(region: Region = Region.US, host?: string): string {
  if (host) return host;

  let url = 'cdn.contentstack.io';
  if (region !== Region.US) {
    url = region.toString().toLowerCase() + '-cdn.contentstack.com';
  }

  return url;
}

/**
 * Checks if the code is running in a browser environment
 * @returns {boolean} True if running in browser, false otherwise
 */
export function isBrowser() {
  return (typeof window !== "undefined");
}

/**
 * Encodes query parameters recursively, handling nested objects
 * @param {params} params - Query parameters object to encode
 * @returns {params} Encoded query parameters object
 */
export function encodeQueryParams(params: params): params {
  const encodedParams: params = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      encodedParams[key] = encodeURIComponent(value);
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects recursively
      encodedParams[key] = encodeQueryParams(value as params);
    } else {
      // Keep non-string values as is (numbers, booleans, etc.)
      encodedParams[key] = value;
    }
  }
  
  return encodedParams;
}