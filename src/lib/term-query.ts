import { AxiosInstance, getData } from '@contentstack/core';
import { FindResponse } from './types';

export class TermQuery {
  private _taxonomyUid: string;
  private _client: AxiosInstance;
  private _urlPath: string;
  _queryParams: { [key: string]: string | number } = {};
  
  constructor(client: AxiosInstance, taxonomyUid: string) {
    this._client = client;
    this._taxonomyUid = taxonomyUid;
    this._urlPath = `/taxonomy-manager/${this._taxonomyUid}/terms`;
  }
  
  async find<T>(): Promise<FindResponse<T>> {
    const response = await getData(this._client, this._urlPath, { params: this._queryParams });
    return response as FindResponse<T>;
  }
}
