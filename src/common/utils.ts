import { Region, params } from './types';
import { getContentstackEndpoint } from '@contentstack/utils';

export function getHostforRegion(region: Region | string, host?: string): string {
  if (host) return host;

  return getContentstackEndpoint(region, 'contentDelivery', true) as string;
}

/**
 * Checks if the code is running in a browser environment
 * @returns {boolean} True if running in browser, false otherwise
 */
export function isBrowser() {
  return (typeof window !== "undefined");
}

/**
 * Node.js/libuv error codes that represent transient, retryable network-layer
 * failures. All occur before an HTTP response is received (error.response is
 * undefined). ECONNABORTED is excluded — @contentstack/core handles it as a
 * structured TIMEOUT error and it should not be retried here.
 */
export const TRANSIENT_NETWORK_ERROR_CODES: ReadonlySet<string> = new Set([
  'ENOTFOUND',    // DNS resolution failed
  'ENETUNREACH',  // no route to host
  'ECONNRESET',   // connection reset mid-flight
  'ECONNREFUSED', // port closed / service not listening
  'EAI_AGAIN',    // DNS server returned SERVFAIL (transient)
  'ETIMEDOUT',    // OS-level connection timeout
  'EHOSTUNREACH', // no route to host at IP layer
  'ENETDOWN',     // local network interface down
]);

/**
 * Determines whether an error represents a transient, retryable network-layer
 * failure (e.g. DNS lookup failure, connection reset), used to build the SDK's
 * default retry behavior so a single blip doesn't crash the caller (e.g. a
 * Next.js static build) instead of being silently retried.
 * @param {any} error - The error thrown by the underlying HTTP client (Axios)
 * @returns {boolean} True if `error.code` matches a known transient network error code
 */
export function isTransientNetworkError(error: any): boolean {
  return !!error && typeof error.code === 'string' && TRANSIENT_NETWORK_ERROR_CODES.has(error.code);
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

/**
 * Builds request headers for entry variant requests.
 * @param variants - Comma-separated variant UID(s)
 * @param branch - Optional branch name to scope the variant request
 */
export function buildVariantRequestHeaders(
  variants: string,
  branch?: string
): Record<string, string> | undefined {
  const headers: Record<string, string> = {};

  if (variants) {
    headers['x-cs-variant-uid'] = variants;
  }
  if (branch) {
    headers.branch = branch;
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}
