/**
 * Request-capture plugin for rich test reports.
 *
 * Implements the SDK's ContentstackPlugin interface (onRequest/onResponse), which the
 * SDK registers as axios request/response interceptors. For every HTTP call made by a
 * test it records: method, full URL, a copy-paste cURL command (with tokens masked),
 * the inferred SDK method, request/response headers, status, duration and (truncated)
 * response body. jest.setup.ts reads the last capture in afterEach and attaches it to
 * the current test via jest-html-reporters' addMsg().
 *
 * Enabled only when ENABLE_HTTP_CAPTURE=true, so normal test runs are unaffected.
 */

export interface CapturedRequest {
  timestamp: string;
  method: string;
  url: string;
  requestHeaders: Record<string, any>;
  requestData?: any;
  sdkMethod: string;
  curl: string;
  status?: number | null;
  statusText?: string | null;
  responseHeaders?: Record<string, any>;
  responseBody?: any;
  success?: boolean;
  duration?: number | null;
}

const capturedRequests: CapturedRequest[] = [];
const MAX = 200;
// Credential-bearing header/param names (lower-cased) whose values must be masked.
// Note: sync_token / pagination_token are opaque cursors, NOT credentials, so they
// are intentionally left readable for replay/debugging.
const SENSITIVE_KEYS = [
  'authorization',
  'authtoken',
  'access_token',
  'preview_token',
  'preview-token',
  'x-cs-preview-token',
  'live_preview',
  'management_token',
  'x-user-agent',
];

function isSensitive(name: string): boolean {
  return SENSITIVE_KEYS.includes(String(name).toLowerCase());
}

function maskValue(name: string, value: any): any {
  if (isSensitive(name)) {
    const s = String(value);
    return s.length <= 8 ? '****' : `${s.slice(0, 4)}...${s.slice(-4)}`;
  }
  return value;
}

function buildFullUrl(config: any): string {
  const base = (config.baseURL || '').replace(/\/$/, '');
  const path = config.url || '';
  let url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const params = config.params;
  if (params && typeof params === 'object') {
    const qs = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== null)
      .map((k) => {
        const raw = typeof params[k] === 'object' ? JSON.stringify(params[k]) : params[k];
        const v = maskValue(k, raw);
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      })
      .join('&');
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  return url;
}

function generateCurl(config: any): string {
  const method = (config.method || 'GET').toUpperCase();
  const url = buildFullUrl(config);
  const parts = [`curl -X ${method} '${url}'`];
  const headers = config.headers || {};
  for (const key of Object.keys(headers)) {
    // axios stores per-method header buckets (common/get/post) plus flat headers; skip the buckets
    if (['common', 'get', 'post', 'put', 'patch', 'delete', 'head'].includes(key)) continue;
    const val = maskValue(key, headers[key]);
    parts.push(`  -H '${key}: ${val}'`);
  }
  if (config.data) {
    const body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    parts.push(`  -d '${body}'`);
  }
  return parts.join(' \\\n');
}

/** Infer a delivery-SDK call chain from the request path. */
export function detectSdkMethod(method: string, url: string): string {
  try {
    const path = url.split('?')[0].replace(/^https?:\/\/[^/]+/, '');
    const m: Record<string, string> = {};
    let r: RegExpMatchArray | null;

    if ((r = path.match(/\/content_types\/([^/]+)\/entries\/([^/]+)\/variants\/([^/]+)/))) {
      return `stack.contentType('${r[1]}').entry('${r[2]}').variants('${r[3]}').fetch()`;
    }
    if ((r = path.match(/\/content_types\/([^/]+)\/entries\/([^/]+)/))) {
      return `stack.contentType('${r[1]}').entry('${r[2]}').fetch()`;
    }
    if ((r = path.match(/\/content_types\/([^/]+)\/entries/))) {
      return `stack.contentType('${r[1]}').entry().query().find()`;
    }
    if ((r = path.match(/\/content_types\/([^/]+)$/))) {
      return `stack.contentType('${r[1]}').fetch()`;
    }
    if (path.match(/\/content_types$/)) return `stack.contentType().find()`;
    if ((r = path.match(/\/assets\/([^/]+)/))) return `stack.asset('${r[1]}').fetch()`;
    if (path.match(/\/assets$/)) return `stack.asset().query().find()`;
    if ((r = path.match(/\/taxonomies\/([^/]+)\/terms/))) {
      return `stack.taxonomy('${r[1]}').term().find()`;
    }
    if (path.match(/\/taxonomies$/)) return `stack.taxonomy().find()`;
    if ((r = path.match(/\/global_fields\/([^/]+)/))) return `stack.globalField('${r[1]}').fetch()`;
    if (path.match(/\/global_fields$/)) return `stack.globalField().find()`;
    if (path.match(/\/stacks\/sync/)) return `stack.sync()`;
    if (path.match(/\/stacks$/)) return `stack.fetch()`;
    void m;
    return `${method.toUpperCase()} ${path}`;
  } catch {
    return `${method} ${url}`;
  }
}

function normalizeHeaders(raw: any): Record<string, any> {
  const out: Record<string, any> = {};
  if (!raw) return out;
  if (typeof raw.entries === 'function') {
    for (const [k, v] of raw.entries()) out[k] = maskValue(k, v);
    return out;
  }
  for (const k of Object.keys(raw)) {
    if (['common', 'get', 'post', 'put', 'patch', 'delete', 'head'].includes(k)) continue;
    out[k] = maskValue(k, raw[k]);
  }
  return out;
}

function truncate(data: any, limit = 4000): any {
  try {
    const s = typeof data === 'string' ? data : JSON.stringify(data);
    if (s && s.length > limit) return s.slice(0, limit) + `\n… [truncated ${s.length - limit} chars]`;
    return data;
  } catch {
    return data;
  }
}

export const requestCapturePlugin = {
  onRequest(request: any) {
    request._startTime = Date.now();
    capturedRequests.push({
      timestamp: new Date().toISOString(),
      method: (request.method || 'GET').toUpperCase(),
      url: buildFullUrl(request),
      requestHeaders: normalizeHeaders(request.headers),
      requestData: request.data,
      sdkMethod: detectSdkMethod(request.method || 'GET', buildFullUrl(request)),
      curl: generateCurl(request),
      status: null,
    });
    if (capturedRequests.length > MAX) capturedRequests.shift();
    return request;
  },

  onResponse(request: any, response: any, _data: any) {
    const res = response || {};
    const cfg = res.config || request || {};
    const url = buildFullUrl(cfg);
    // Update the matching captured request (last one for this url) or push a fresh entry.
    let entry = [...capturedRequests].reverse().find((c) => c.url === url && c.status == null);
    if (!entry) {
      entry = {
        timestamp: new Date().toISOString(),
        method: (cfg.method || 'GET').toUpperCase(),
        url,
        requestHeaders: normalizeHeaders(cfg.headers),
        requestData: cfg.data,
        sdkMethod: detectSdkMethod(cfg.method || 'GET', url),
        curl: generateCurl(cfg),
      };
      capturedRequests.push(entry);
    }
    entry.status = res.status ?? null;
    entry.statusText = res.statusText ?? null;
    entry.responseHeaders = normalizeHeaders(res.headers);
    entry.responseBody = truncate(res.data);
    entry.success = res.status ? res.status >= 200 && res.status < 400 : undefined;
    entry.duration = cfg._startTime ? Date.now() - cfg._startTime : null;
    return response;
  },
};

export function getLastCapturedRequest(): CapturedRequest | undefined {
  return capturedRequests[capturedRequests.length - 1];
}

export function getCapturedRequests(): CapturedRequest[] {
  return capturedRequests.slice();
}

export function clearCapturedRequests(): void {
  capturedRequests.length = 0;
}
