import { Region, params } from './types';
import regionsData from '../assets/regions.json';

export function getHostforRegion(cloudRegion: string = "aws_na", host?: string): string {
  if (host) return host;

  // Handle null, undefined, or empty string cases
  if (!cloudRegion || typeof cloudRegion !== 'string') {
    throw new Error("Unable to set host using the provided region. Please provide a valid region.");
  }

  const normalizedRegion = cloudRegion.toLowerCase();

  const regionObj = regionsData.regions.find(r =>
    r.id === normalizedRegion ||
    r.alias.some(alias => alias === normalizedRegion)
  );

  if (!regionObj) {
    throw new Error("Unable to set host using the provided region. Please provide a valid region.");
  }

  return regionObj ? regionObj.endpoints.contentDelivery.replace(/^https?:\/\//, '') : 'cdn.contentstack.io';
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