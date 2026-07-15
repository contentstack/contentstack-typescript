import { AxiosInstance, getData } from '@contentstack/core';
import { FindResponse } from '../common/types';

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
    this._urlPath = `/taxonomies/${this._taxonomyUid}/terms`;
  }

  /**
   * @method depth
   * @memberof TermQuery
   * @description Limits how many levels of the term tree are resolved.
   * @param {number} depth - The depth limit
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().depth(2).find();
   */
  depth(depth: number): TermQuery {
    this._queryParams.depth = depth;

    return this;
  }

  /**
   * @method skip
   * @memberof TermQuery
   * @description Skips the specified number of terms (pagination).
   * @param {number} skip - The number of terms to skip
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().skip(10).find();
   */
  skip(skip: number): TermQuery {
    this._queryParams.skip = skip;

    return this;
  }

  /**
   * @method limit
   * @memberof TermQuery
   * @description Limits the number of terms returned (pagination).
   * @param {number} limit - The maximum number of terms to return
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().limit(10).find();
   */
  limit(limit: number): TermQuery {
    this._queryParams.limit = limit;

    return this;
  }

  /**
   * @method includeCount
   * @memberof TermQuery
   * @description Includes a count field in the response.
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().includeCount().find();
   */
  includeCount(): TermQuery {
    this._queryParams.include_count = 'true';

    return this;
  }

  /**
   * @method includeFallback
   * @memberof TermQuery
   * @description Falls back through the branch locale hierarchy when a term is not published in the requested locale.
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().includeFallback().find();
   */
  includeFallback(): TermQuery {
    this._queryParams.include_fallback = 'true';

    return this;
  }

  /**
   * @method includeBranch
   * @memberof TermQuery
   * @description Adds a _branch field to the response objects.
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().includeBranch().find();
   */
  includeBranch(): TermQuery {
    this._queryParams.include_branch = 'true';

    return this;
  }

  /**
   * @method param
   * @memberof TermQuery
   * @description Adds a single query parameter to the request.
   * @param {string} key - The parameter key
   * @param {string | number} value - The parameter value
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().param('key', 'value').find();
   */
  param(key: string, value: string | number): TermQuery {
    this._queryParams[key] = value;

    return this;
  }

  /**
   * @method addParams
   * @memberof TermQuery
   * @description Adds multiple query parameters to the request.
   * @param {object} paramObj - The parameters to add
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().addParams({ key: 'value' }).find();
   */
  addParams(paramObj: { [key: string]: string | number }): TermQuery {
    this._queryParams = { ...this._queryParams, ...paramObj };

    return this;
  }

  /**
   * @method locale
   * @memberof TermQuery
   * @description Retrieves terms published in the specified locale.
   * @param {string} locale - The locale code (e.g. 'hi-in', 'en-us')
   * @returns {TermQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.taxonomy('taxonomy_uid').term().locale('hi-in').find();
   */
  locale(locale: string): TermQuery {
    this._queryParams.locale = locale;
    return this;
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
