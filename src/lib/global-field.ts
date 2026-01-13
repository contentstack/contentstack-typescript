import { AxiosInstance, getData } from '@contentstack/core';

export class GlobalField {
  private _client: AxiosInstance;
  private _urlPath: string;
  _queryParams: { [key: string]: string | number } = {};

  constructor(clientConfig: AxiosInstance, globalFieldUid: string) {
    this._client = clientConfig;
    this._urlPath = `/global_fields/${globalFieldUid}`;
  }
  /**
   * @method includeBranch
   * @memberof GlobalField
   * @description Includes the _branch top-level key in the response
   * @returns {GlobalField}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const globalField = stack.globalField('global_field_uid');
   * const result = await globalField.includeBranch().fetch();
   */
  includeBranch(): GlobalField {
    this._queryParams.include_branch = 'true';

    return this;
  }
  /**
   * @method fetch
   * @memberof GlobalField
   * @description Fetches comprehensive details of a specific global field
   * @returns {Promise<T>} Promise that resolves to the global field data
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const globalField = stack.globalField('global_field_uid');
   * const result = await globalField.fetch();
   */
  async fetch<T>(): Promise<T> {
    const response = await getData(this._client, this._urlPath, { params: this._queryParams });

    return response.global_field as T;
  }
}