// import { PersistanceStore } from '../persistance';

import { CacheOptions, Policy } from './types';

export async function handleRequest(
  cacheOptions: CacheOptions,
  apiKey: string,
  defaultAdapter: any,
  resolve: any,
  reject: any,
  config: any
) {

  try {
    var PersistancePlugin = require('contentstack-persistance-typescript');
    var PersistanceStore = PersistancePlugin.PersistanceStore;

  } catch (e) {
    throw new Error('Persistance store not provided. Please install contentstack-persistance-typescript package.');
  }

  const cacheStore = new PersistanceStore(cacheOptions);
  switch (cacheOptions.policy) {
    case Policy.NETWORK_ELSE_CACHE: {
      const apiResponse = await defaultAdapter(config);

      if (apiResponse.data) {
        cacheStore.setItem(apiKey, JSON.parse(apiResponse.data), config.contentTypeUid, cacheOptions.maxAge);

        return resolve({data: JSON.parse(apiResponse.data)});
      } else {
        const cacheResponse = cacheStore.getItem(apiKey, config.contentTypeUid);
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
      const cacheResponse = cacheStore.getItem(apiKey, config.contentTypeUid);
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
        cacheStore.setItem(apiKey, JSON.parse(apiResponse.data), config.contentTypeUid, cacheOptions.maxAge);

        return resolve({data: JSON.parse(apiResponse.data)});
      } else {
        return reject(apiResponse);
      }
    }
    case Policy.CACHE_ELSE_NETWORK: {
      const cacheResponse = cacheStore.getItem(apiKey, config.contentTypeUid);

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
          cacheStore.setItem(apiKey, JSON.parse(apiResponse.data), config.contentTypeUid, cacheOptions.maxAge);

          return resolve({data: JSON.parse(apiResponse.data)});
        } else {
          return reject(apiResponse);
        }
      }
    }
  }
}
