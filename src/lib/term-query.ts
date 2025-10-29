import { AxiosInstance, getData } from '@contentstack/core';
import { FindResponse } from './types';

/**
 * @class TermQuery
 * @description Represents a query for fetching multiple published terms from a taxonomy. Requires taxonomy_publish feature flag to be enabled.
 */
export class TermQuery {
  private _taxonomyUid: string;
  private _client: AxiosInstance;
  private _urlPath: string;
  _queryParams: { [key: string]: string | number } = {};
  
  /**
   * @constructor
   * @param {AxiosInstance} client - The HTTP client instance
   * @param {string} taxonomyUid - The taxonomy UID
   */
  constructor(client: AxiosInstance, taxonomyUid: string) {
    this._client = client;
    this._taxonomyUid = taxonomyUid;
    this._urlPath = `/taxonomy-manager/${this._taxonomyUid}/terms`;
  }
  
  /**
   * @method find
   * @memberof TermQuery
   * @description Fetches a list of all published terms within a specific taxonomy.
   * @returns {Promise<FindResponse<T>>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().find();
   */
  async find<T>(): Promise<FindResponse<T>> {
    const response = await getData(this._client, this._urlPath, { params: this._queryParams });
    return response as FindResponse<T>;
  }
}
