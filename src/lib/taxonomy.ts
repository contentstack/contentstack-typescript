import { AxiosInstance, getData } from '@contentstack/core';
import { TermQuery } from './term-query';
import { Term } from './term';

/**
 * @class Taxonomy
 * @description Represents a published taxonomy with methods to fetch taxonomy data and manage terms. Requires taxonomy_publish feature flag to be enabled.
 */
export class Taxonomy {
  private _client: AxiosInstance;
  private _taxonomyUid: string;
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
    this._urlPath = `/taxonomy-manager/${this._taxonomyUid}`; // TODO: change to /taxonomies/${this._taxonomyUid}
  }

  /**
   * @method term
   * @memberof Taxonomy
   * @description Gets a specific term or creates a term query
   * @param {string} [uid] - Optional term UID. If provided, returns a Term instance. If not provided, returns a TermQuery instance.
   * @returns {Term | TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * // Get a specific term
   * const term = stack.taxonomy('taxonomy_uid').term('term_uid');
   * // Get all terms
   * const termQuery = stack.taxonomy('taxonomy_uid').term();
   */
  term(uid: string): Term;
  term(): TermQuery;
  term(uid?: string): Term | TermQuery {
    if (uid) return new Term(this._client, this._taxonomyUid, uid);

    return new TermQuery(this._client, this._taxonomyUid);
  }

  /**
   * @method fetch
   * @memberof Taxonomy
   * @description Fetches the taxonomy data by UID
   * @returns {Promise<T>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').fetch();
   */
  async fetch<T>(): Promise<T> {
    const response = await getData(this._client, this._urlPath);

    if (response.taxonomy) return response.taxonomy as T;

    return response;
  }
}
