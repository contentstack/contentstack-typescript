import { AxiosInstance, getData } from '@contentstack/core';

export class Taxonomy {
  private _client: AxiosInstance;
  private _taxonomyUid: string;
  private _urlPath: string;

  _queryParams: { [key: string]: string | number } = {};

  constructor(client: AxiosInstance, taxonomyUid: string) {
    this._client = client;
    this._taxonomyUid = taxonomyUid;
    this._urlPath = `/taxonomy-manager/${this._taxonomyUid}`; // TODO: change to /taxonomies/${this._taxonomyUid}
  }

  async fetch<T>(): Promise<T> {
    const response = await getData(this._client, this._urlPath);

    if (response.taxonomy) return response.taxonomy as T;

    return response;
  }
}
