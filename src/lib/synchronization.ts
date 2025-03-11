import { AxiosInstance, getData } from '@contentstack/core';
import { SyncStack, SyncType, PublishType } from './types';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import humps from 'humps';

export async function synchronization(client: AxiosInstance, params: SyncStack | SyncType = {}, recursive = false) {
  const config: AxiosRequestConfig = { params };
  const SYNC_URL = '/stacks/sync';

  if (!('paginationToken' in params || 'syncToken' in params)) {
    // for every config except sync and pagination token
    config.params = { ...params, init: true };
  }

  if ((params as SyncType).type && typeof (params as SyncType).type !== 'string') {
    const type = (params as SyncType).type as PublishType[];
    config.params = { ...config.params, type: type.join(',') };
  }

  let response: AxiosResponse = await getData(client, SYNC_URL, { params: humps.decamelizeKeys(config.params) });
  const data = response.data;

  while (recursive && 'pagination_token' in response.data) {
    const recResponse: AxiosResponse = await getData(
      client,
      SYNC_URL,
      humps.decamelizeKeys({ paginationToken: data.pagination_token })
    );
    recResponse.data.items = { ...response.data.items, ...recResponse.data.items };
    response = { ...recResponse };
  }

  return response.data;
}
