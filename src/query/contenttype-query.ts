import { AxiosInstance, getData } from '@contentstack/core';
import { FindResponse } from '../common/types';

export class ContentTypeQuery {
  private _client: AxiosInstance;
  private _urlPath: string;
  _queryParams: { [key: string]: string | number } = {};

  constructor(client: AxiosInstance) {
    this._client = client;
    this._urlPath = '/content_types';
  }
  /**
   * @method includeGlobalFieldSchema
   * @memberof ContentTypeQuery
   * @description Includes the global field schema in the content type response
   * @returns {ContentTypeQuery}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const contentTypeQuery = stack.contentType();
   * const result = await contentTypeQuery.includeGlobalFieldSchema().find();
   */
  includeGlobalFieldSchema(): this {
    this._queryParams.include_global_field_schema = 'true';

    return this;
  }
  /**
   * @method find
   * @memberof ContentTypeQuery
   * @description Fetches all contentTypes of the stack
   * @returns {Promise<FindResponse<T>>} Promise that resolves to the find response containing content types
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const contentTypeQuery = stack.contentType();
   * const result = await contentTypeQuery.find();
   */
  async find<T>(): Promise<FindResponse<T>> {
    const response = await getData(this._client, this._urlPath, { params: this._queryParams });

    return response as FindResponse<T>;
  }
}
