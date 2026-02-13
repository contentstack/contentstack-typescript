import { AxiosInstance, getData } from '@contentstack/core';
import { SyncStack, SyncType, PublishType, SyncResponse } from '../common/types';
import { AxiosRequestConfig } from 'axios';
import humps from 'humps';

export async function synchronization(client: AxiosInstance, params: SyncStack | SyncType = {}, recursive = false): Promise<SyncResponse> {
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

  // getData returns response.data directly, not the full AxiosResponse
  let response: SyncResponse = await getData(client, SYNC_URL, { params: humps.decamelizeKeys(config.params) });

  while (recursive && 'pagination_token' in response) {
    const recResponse: SyncResponse = await getData(
      client,
      SYNC_URL,
      { params: humps.decamelizeKeys({ paginationToken: response.pagination_token }) }
    );
    // Merge items from all paginated responses
    recResponse.items = [...response.items, ...recResponse.items];
    response = recResponse;
  }

  return response;
}
