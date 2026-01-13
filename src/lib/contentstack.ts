import { httpClient, retryRequestHandler, retryResponseErrorHandler, retryResponseHandler } from '@contentstack/core';
import { AxiosRequestHeaders } from 'axios';
import { handleRequest } from './cache';
import { Stack as StackClass } from './stack';
import { Policy, StackConfig, ContentstackPlugin, Region } from './types';
import * as Utility from './utils';
import * as Utils from '@contentstack/utils';
export { Utils };

let version = '{{VERSION}}';

/**
 * @method stack
 * @memberof Contentstack
 * @description Creates a stack instance
 * @param {StackConfig} config - config object for stack with apiKey, deliveryToken and environment as required fields
 * @returns {StackClass} Stack instance
 * @example
 * import contentstack from '@contentstack/delivery-sdk'
 * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
 * @example
 * import contentstack from '@contentstack/delivery-sdk'
 * const stack = contentstack.stack({
 *   apiKey: "apiKey",
 *   deliveryToken: "deliveryToken",
 *   environment: "environment",
 *   region:"region",
 *   locale:"locale",
 *   cacheOptions: {
 *    policy: Policy.CACHE_THEN_NETWORK,
 *    storeType: 'localStorage'
 *   }
 * });
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function stack(config: StackConfig): StackClass {
  const DEFAULT_HOST = Utility.getHostforRegion(config.region || Region.US, config.host);

  let defaultConfig = {
    defaultHostname: DEFAULT_HOST,
    headers: {} as AxiosRequestHeaders,
    params: {} as any,
    live_preview: {} as any,
    port: config.port as number,
    ...config
  };

  config.host = defaultConfig.defaultHostname;

  if (config.apiKey) {
    defaultConfig.headers.api_key = config.apiKey;
  } else {
    throw new Error('API key for Stack is required.');
  }
  if (config.deliveryToken) {
    defaultConfig.headers.access_token = config.deliveryToken;
  } else {
    throw new Error('Delivery token for Stack is required.');
  }
  if (config.environment) {
    defaultConfig.params.environment = config.environment;
  } else {
    throw new Error('Environment for Stack is required');
  }

  if (config.locale) {
    defaultConfig.params.locale = config.locale;
  }

  if (config.live_preview) {
    if (Utility.isBrowser()) {
      const params = new URL(document.location.toString()).searchParams;
      if (params.has('live_preview')) {
          config.live_preview.live_preview = params.get('live_preview') || config.live_preview.live_preview;
      }
      if (params.has('release_id')) {
          defaultConfig.headers['release_id'] = params.get('release_id');
      }
      if (params.has('preview_timestamp')) {
          defaultConfig.headers['preview_timestamp'] = params.get('preview_timestamp');
      }
    }
  }

  if (config.branch) {
    defaultConfig.headers.branch = config.branch;
  }

  if (config.early_access) {
    defaultConfig.headers['x-header-ea'] = config.early_access.join(',');
  }

  defaultConfig.headers['X-User-Agent'] = 'contentstack-delivery-typescript/' + version;


  const client = httpClient(defaultConfig as any);

  if (config.logHandler) client.defaults.logHandler = config.logHandler;

  if (config.cacheOptions && config.cacheOptions.policy !== Policy.IGNORE_CACHE) {
    const defaultAdapter = client.defaults.adapter;
    client.defaults.adapter = (adapterConfig: any) => {
      return new Promise(async (resolve, reject) => {
        if (config.cacheOptions)
          await handleRequest(config.cacheOptions, config.apiKey, defaultAdapter, resolve, reject, adapterConfig);
      });
    };
  }
  // LogHandler interceptors
  if (config.debug) {
    // Request interceptor for logging
    client.interceptors.request.use((requestConfig: any) => {
      config.logHandler!('info', {
        type: 'request',
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        headers: requestConfig.headers,
        params: requestConfig.params,
        timestamp: new Date().toISOString()
      });
      return requestConfig;
    });

    // Response interceptor for logging
    client.interceptors.response.use(
      (response: any) => {
        const level = getLogLevelFromStatus(response.status);
        config.logHandler!(level, {
          type: 'response',
          status: response.status,
          statusText: response.statusText,
          url: response.config?.url,
          method: response.config?.method?.toUpperCase(),
          headers: response.headers,
          data: response.data,
          timestamp: new Date().toISOString()
        });
        return response;
      },
      (error: any) => {
        const status = error.response?.status || 0;
        const level = getLogLevelFromStatus(status);
        config.logHandler!(level, {
          type: 'response_error',
          status: status,
          statusText: error.response?.statusText || error.message,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    );
  }

  // Helper function to determine log level based on HTTP status code
  function getLogLevelFromStatus(status: number): string {
    if (status >= 200 && status < 300) {
      return 'info';
    } else if (status >= 300 && status < 400) {
      return 'warn';
    } else if (status >= 400) {
      return 'error';
    } else {
      return 'debug';
    }
  }

  // Retry policy handlers
  const errorHandler = (error: any) => {
    return retryResponseErrorHandler(error, config, client);
  };
  client.interceptors.request.use(retryRequestHandler);
  client.interceptors.response.use(retryResponseHandler, errorHandler);

  if (config.plugins) {
    client.interceptors.request.use((reqConfig: any): any => {
      if (config && config.plugins)
        config.plugins.forEach((pluginInstance: ContentstackPlugin) => {
          reqConfig = pluginInstance.onRequest(reqConfig);
        });
      
      return reqConfig;
    });

    client.interceptors.response.use((response: any) => {
      if (config && config.plugins)
        config.plugins.forEach((pluginInstance: ContentstackPlugin) => {
          response = pluginInstance.onResponse(response.request, response, response.data);
        });

      return response;
    });
  }

  return new StackClass(client, config);
}
