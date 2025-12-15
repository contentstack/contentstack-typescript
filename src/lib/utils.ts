import { Region, params } from './types';

export function getHostforRegion(region: Region = Region.US, host?: string): string {
  if (host) return host;

  let url = 'cdn.contentstack.io';
  if (region !== Region.US) {
    url = region.toString().toLowerCase() + '-cdn.contentstack.com';
  }

  return url;
}

export function isBrowser() {
  return (typeof window !== "undefined");
}

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