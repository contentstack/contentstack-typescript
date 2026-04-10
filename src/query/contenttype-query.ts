import { BaseQuery } from './base-query';
import { AxiosInstance } from '@contentstack/core';

export class ContentTypeQuery extends BaseQuery {
  constructor(client: AxiosInstance) {
    super();
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
}
