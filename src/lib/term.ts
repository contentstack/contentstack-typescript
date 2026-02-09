import { AxiosInstance, getData } from "@contentstack/core";

/**
 * @class Term
 * @description Represents a published taxonomy term with methods to fetch term data, locales, ancestors, and descendants. Requires taxonomy_publish feature flag to be enabled.
 */
export class Term {
  protected _client: AxiosInstance;
  private _taxonomyUid: string;
  private _termUid: string;
  private _urlPath: string;

  /**
   * @constructor
   * @param {AxiosInstance} client - The HTTP client instance
   * @param {string} taxonomyUid - The taxonomy UID
   * @param {string} termUid - The term UID
   */
  constructor(client: AxiosInstance, taxonomyUid: string, termUid: string) {
    this._client = client;
    this._taxonomyUid = taxonomyUid;
    this._termUid = termUid;
    this._urlPath = `/taxonomies/${this._taxonomyUid}/terms/${this._termUid}`;
  }

  /**
   * @method locales
   * @memberof Term
   * @description Fetches all published, localized versions of a single term.
   * @returns {Promise<T>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').locales();
   */
  async locales<T>(): Promise<T> {
    const response = await getData(this._client, `${this._urlPath}/locales`); 
    if (response.locales) return response.locales as T;
    return response;
  }

  /**
   * @method ancestors
   * @memberof Term
   * @description Fetches all ancestors of a single published term, up to the root.
   * @returns {Promise<T>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').ancestors();
   */
  async ancestors<T>(): Promise<T> {
    const response = await getData(this._client, `${this._urlPath}/ancestors`);
    if (response.ancestors) return response.ancestors as T;
    return response;
  }

  /**
   * @method descendants
   * @memberof Term
   * @description Fetches all descendants of a single published term.
   * @returns {Promise<T>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').descendants();
   */
  async descendants<T>(): Promise<T> {
    const response = await getData(this._client, `${this._urlPath}/descendants`);
    if (response.descendants) return response.descendants as T;
    return response;
  }

  /**
   * @method fetch
   * @memberof Term
   * @description Fetches all descendants of a single published term.
   * @returns {Promise<T>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').fetch();
   */
  async fetch<T>(): Promise<T> {
    const response = await getData(this._client, this._urlPath);
    if (response.term) return response.term as T;
    return response;
  }
}
