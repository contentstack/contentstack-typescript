import { Query } from "./query";
import { AxiosInstance, getData } from "@contentstack/core";
import { FindResponse } from "./types";

export class TaxonomyQuery extends Query {
  constructor(client: AxiosInstance) {
    super(client, {}, {}); // will need make changes to Query class so that CT uid is not mandatory
    this._client = client;
    this._urlPath = `/taxonomies/entries`;
  }
  /**
   * @method find
   * @memberof TaxonomyQuery
   * @description Fetches all taxonomies of the stack using /taxonomy-manager endpoint
   * @returns {Promise<FindResponse<T>>}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const taxonomyQuery = stack.taxonomy();
   * const result = await taxonomyQuery.find();
   */
  override async find<T>(): Promise<FindResponse<T>> {
    this._urlPath = "/taxonomy-manager"; // TODO: change to /taxonomies
    const response = await getData(this._client, this._urlPath, {
      params: this._queryParams,
    });

    return response as FindResponse<T>;
  }
}