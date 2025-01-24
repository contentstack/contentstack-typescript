import { httpClient, retryRequestHandler, retryResponseErrorHandler, retryResponseHandler } from '@contentstack/core';
import { InternalAxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';
import { handleRequest } from './cache';
import { Stack as StackClass } from './stack';
import { Policy, StackConfig } from './types';
import * as Utility from './utils';
export * as Utils from '@contentstack/utils';

let version = '{{VERSION}}';

/**
 * @method stack
 * @memberof Contentstack
 * @description Creates a stack instance
 * @param {StackConfig} config - config object for stack with apiKey, deliveryToken and environment as required fields
 *
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
 * }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function stack(config: StackConfig): StackClass {
  let defaultConfig = {
    defaultHostname: 'cdn.contentstack.io',
    headers: {} as AxiosRequestHeaders,
    params: {} as any,
    live_preview: {} as any
  };

  defaultConfig.defaultHostname = config.host || Utility.getHost(config.region, config.host);
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
  // Retry policy handlers
  const errorHandler = (error: any) => {
    return retryResponseErrorHandler(error, config, client);
  };
  client.interceptors.request.use(retryRequestHandler);
  client.interceptors.response.use(retryResponseHandler, errorHandler);

  if (config.plugins) {
    client.interceptors.request.use((reqConfig: any): any => {
      if (config && config.plugins)
        config.plugins.forEach((pluginInstance) => {
          reqConfig = pluginInstance.onRequest(reqConfig);
        });
      
      return reqConfig;
    });

    client.interceptors.response.use((response: any) => {
      if (config && config.plugins)
        config.plugins.forEach((pluginInstance) => {
          response = pluginInstance.onResponse(response.request, response, response.data);
        });

      return response;
    });
  }

  return new StackClass(client, config);
}
