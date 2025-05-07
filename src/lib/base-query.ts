import { HttpClient } from './http-client';

export interface FindResponse<T> {
  entries: T[];
  total: number;
}

export class BaseQuery {
  protected _client: HttpClient;
  protected _urlPath: string = '';
  protected _parameters: { [key: string]: any } = {};
  protected _queryParams: { [key: string]: any } = {};
  protected _variants: string = '';

  constructor(client: HttpClient) {
    this._client = client;
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
   * @returns {BaseQuery}
   */
  includeCount(): BaseQuery {
    this._queryParams.include_count = 'true';

    return this;
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
   * const asset = await stack.asset().orderByAscending().find()
   *
   * @returns {BaseQuery}
   */
  orderByAscending(key: string): BaseQuery {
    this._queryParams.asc = key;

    return this;
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
   * const asset = await stack.asset().orderByDescending().find()
   *
   * @returns {BaseQuery}
   */
  orderByDescending(key: string): BaseQuery {
    this._queryParams.desc = key;

    return this;
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
   * const result = await query.limit("limit_value").find()
   * // OR
   * const asset = await stack.asset().limit(5).find()
   *
   * @returns {BaseQuery}
   */
  limit(key: number): BaseQuery {
    this._queryParams.limit = key;

    return this;
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
   * const result = await query.skip("skip_value").find()
   * // OR
   * const asset = await stack.asset().skip(5).find()
   *
   * @returns {BaseQuery}
   */
  skip(key: number): BaseQuery {
    this._queryParams.skip = key;

    return this;
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
   * @returns {BaseQuery}
   */
  param(key: string, value: string | number): BaseQuery {
    this._queryParams[key] = value;

    return this;
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
   * @returns {BaseQuery}
   */
  addParams(paramObj: { [key: string]: string | boolean | number }): BaseQuery {
    this._queryParams = { ...this._queryParams, ...paramObj };

    return this;
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
   * @returns {BaseQuery}
   */
  removeParam(key: string): BaseQuery {
    delete this._queryParams[key];

    return this;
  }

  /**
   * @method find
   * @memberof AssetQuery
   * @description The assets of the stack will be fetched
   * @returns {Collection}
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
   * const result = await stack.asset(asset_uid).fetch();
   */

  async find<T>(): Promise<FindResponse<T>> {
    try {
      const response = await this._client.get<FindResponse<T>>(this._urlPath, {
        params: this._queryParams,
        headers: this._variants ? { 'x-cs-variant-uid': this._variants } : undefined
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
