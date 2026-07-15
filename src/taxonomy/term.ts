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

  _queryParams: { [key: string]: string | number } = {};

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
   * @method depth
   * @memberof Term
   * @description Limits how many levels of ancestors/descendants are resolved. Applies to the ancestors() and descendants() endpoints.
   * @param {number} depth - The depth limit
   * @returns {Term}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').depth(2).descendants();
   */
  depth(depth: number): Term {
    this._queryParams.depth = depth;

    return this;
  }

  /**
   * @method includeFallback
   * @memberof Term
   * @description Falls back through the branch locale hierarchy when the term is not published in the requested locale.
   * @returns {Term}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').includeFallback().fetch();
   */
  includeFallback(): Term {
    this._queryParams.include_fallback = 'true';

    return this;
  }

  /**
   * @method includeBranch
   * @memberof Term
   * @description Adds a _branch field to the response object.
   * @returns {Term}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').includeBranch().fetch();
   */
  includeBranch(): Term {
    this._queryParams.include_branch = 'true';

    return this;
  }

  /**
   * @method param
   * @memberof Term
   * @description Adds a single query parameter to the request.
   * @param {string} key - The parameter key
   * @param {string | number} value - The parameter value
   * @returns {Term}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').param('key', 'value').fetch();
   */
  param(key: string, value: string | number): Term {
    this._queryParams[key] = value;

    return this;
  }

  /**
   * @method addParams
   * @memberof Term
   * @description Adds multiple query parameters to the request.
   * @param {object} paramObj - The parameters to add
   * @returns {Term}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').addParams({ key: 'value' }).fetch();
   */
  addParams(paramObj: { [key: string]: string | number }): Term {
    this._queryParams = { ...this._queryParams, ...paramObj };

    return this;
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
    const response = await getData(this._client, `${this._urlPath}/locales`, { params: this._queryParams });
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
    const response = await getData(this._client, `${this._urlPath}/ancestors`, { params: this._queryParams });
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
    const response = await getData(this._client, `${this._urlPath}/descendants`, { params: this._queryParams });
    if (response.descendants) return response.descendants as T;
    return response;
  }

  /**
   * @method fetch
   * @memberof Term
   * @description Fetches a single published term. Pass a locale code to retrieve the localized version.
   * @param {string} [locale] - Optional locale code (e.g. 'mr-in'). Omit to retrieve the master locale.
   * @returns {Promise<T>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term('term_uid').fetch();
   * const localized = await stack.taxonomy('taxonomy_uid').term('term_uid').fetch('mr-in');
   */
  async fetch<T>(locale?: string): Promise<T> {
    if (locale) this._queryParams.locale = locale;
    const response = await getData(this._client, this._urlPath, { params: this._queryParams });
    if (response.term) return response.term as T;
    return response;
  }
}
