import { AxiosInstance, getData } from "@contentstack/core";

export class Term {
  protected _client: AxiosInstance;
  private _taxonomyUid: string;
  private _termUid: string;
  private _urlPath: string;

  constructor(client: AxiosInstance, taxonomyUid: string, termUid: string) {
    this._client = client;
    this._taxonomyUid = taxonomyUid;
    this._termUid = termUid;
    this._urlPath = `/taxonomy-manager/${this._taxonomyUid}/terms/${this._termUid}`; // TODO: change to /taxonomies
  }

  /**
   * @method locales
   * @memberof Term
   * @description Fetches locales for the term
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
   * @description Fetches ancestors for the term
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

  async fetch<T>(): Promise<T> {
    const response = await getData(this._client, this._urlPath);

    if (response.term) return response.term as T;

    return response;
  }
}
