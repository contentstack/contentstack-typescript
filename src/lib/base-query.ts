import { AxiosInstance, getData } from '@contentstack/core';
import { Pagination } from './pagination';
import { FindResponse, params } from './types';
import { encodeQueryParams } from './utils';
import type { Query } from './query';

export class BaseQuery extends Pagination {
  _parameters: params = {}; // Params of query class ?query={}

  protected _client!: AxiosInstance;
  protected _urlPath!: string;
  protected _variants!: string;

  /**
   * Helper method to cast this instance to Query type
   * @private
   */
  protected asQuery(): Query {
    return this as unknown as Query;
  }

  /**
   * @method includeCount
   * @memberof BaseQuery
   * @description Retrieve count and data of objects in result
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.includeCount().find()
   * // OR
   * const asset = await stack.asset().includeCount().find()
   *
   * @returns {Query}
   */
  includeCount(): Query {
    this._queryParams.include_count = 'true';

    return this.asQuery();
  }

  /**
   * @method orderByAscending
   * @memberof BaseQuery
   * @description Sorts the results in ascending order based on the specified field UID.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.orderByAscending("field_uid").find()
   * // OR
   * const asset = await stack.asset().orderByAscending("field_uid").find()
   *
   * @returns {Query}
   */
  orderByAscending(key: string): Query {
    this._queryParams.asc = key;

    return this.asQuery();
  }

  /**
   * @method orderByDescending
   * @memberof BaseQuery
   * @description Sorts the results in descending order based on the specified key.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.orderByDescending("field_uid").find()
   * // OR
   * const asset = await stack.asset().orderByDescending("field_uid").find()
   *
   * @returns {Query}
   */
  orderByDescending(key: string): Query {
    this._queryParams.desc = key;

    return this.asQuery();
  }

  /**
   * @method limit
   * @memberof BaseQuery
   * @description Returns a specific number of entries based on the set limit
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.limit(10).find()
   * // OR
   * const asset = await stack.asset().limit(5).find()
   *
   * @returns {Query}
   */
  limit(key: number): Query {
    this._queryParams.limit = key;

    return this.asQuery();
  }

  /**
   * @method skip
   * @memberof BaseQuery
   * @description Skips at specific number of entries.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.skip(10).find()
   * // OR
   * const asset = await stack.asset().skip(5).find()
   *
   * @returns {Query}
   */
  skip(key: number): Query {
    this._queryParams.skip = key;

    return this.asQuery();
  }



  /**
   * @method param
   * @memberof BaseQuery
   * @description Adds query parameters to the URL.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.param("key", "value").find()
   * // OR
   * const asset = await stack.asset().param("key", "value").find()
   *
   * @returns {Query}
   */
  param(key: string, value: string | number): Query {
    this._queryParams[key] = value;

    return this.asQuery();
  }

  /**
   * @method addParams
   * @memberof BaseQuery
   * @description Adds a query parameter to the query.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.addParams({"key": "value"}).find()
   * // OR
   * const asset = await stack.asset().addParams({"key": "value"}).find()
   *
   * @returns {Query}
   */
  addParams(paramObj: { [key: string]: string | boolean | number }): Query {
    this._queryParams = { ...this._queryParams, ...paramObj };

    return this.asQuery();
  }

  /**
   * @method removeParam
   * @memberof BaseQuery
   * @description Removes a query parameter from the query.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.removeParam("query_param_key").find()
   * // OR
   * const asset = await stack.asset().removeParam("query_param_key").find()
   *
   * @returns {Query}
   */
  removeParam(key: string): Query {
    delete this._queryParams[key];

    return this.asQuery();
  }

  /**
   * @method find
   * @memberof BaseQuery
   * @description Fetches the data based on the query parameters
   * @param {boolean} encode - Whether to encode query parameters
   * @returns {Promise<FindResponse<T>>} Promise that resolves to the find response
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.asset().find();
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType("contentType1Uid").entry().query().find();
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType("contentTypeUid").entry().query().find();
   */

  async find<T>(encode: boolean = false): Promise<FindResponse<T>> {
    let requestParams: { [key: string]: any } = this._queryParams;

    if (Object.keys(this._parameters).length > 0) {
      let queryParams = { ...this._parameters };
      
      if (encode) {
        queryParams = encodeQueryParams(queryParams);
      }
      
      requestParams = { ...this._queryParams, query: queryParams };
    }

    const getRequestOptions: any = { 
      params: requestParams,
      // Add contentTypeUid to config for improved caching (extract from URL if possible)
      contentTypeUid: this.extractContentTypeUidFromUrl()
    };

    if (this._variants) {
      getRequestOptions.headers = {
        ...getRequestOptions.headers,
        'x-cs-variant-uid': this._variants
      };
    }
    const response = await getData(this._client, this._urlPath, getRequestOptions);

    return response as FindResponse<T>;
  }

  /**
   * Extracts content type UID from the URL path
   * @returns content type UID if found, null otherwise
   */
  private extractContentTypeUidFromUrl(): string | null {
    if (!this._urlPath) return null;
    
    // Match patterns like: /content_types/{content_type_uid}/entries
    const contentTypePattern = /\/content_types\/([^\/]+)/;
    const match = this._urlPath.match(contentTypePattern);
    
    return match ? match[1] : null;
  }
}
