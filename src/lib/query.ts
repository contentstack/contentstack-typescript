import { AxiosInstance, getData } from '@contentstack/core';
import { BaseQuery } from './base-query';
import { BaseQueryParameters, QueryOperation, QueryOperator, TaxonomyQueryOperation, params, queryParams, FindResponse } from './types';
import { encodeQueryParams } from './utils';

export class Query extends BaseQuery {
  private _contentTypeUid?: string;

  constructor(client: AxiosInstance, params: params, queryParams: queryParams, variants?: string, uid?: string, queryObj?: { [key: string]: any }) {
    super();
    this._client = client;
    this._contentTypeUid = uid;
    this._urlPath = `/content_types/${this._contentTypeUid}/entries`;
    this._parameters = params || {};
    this._queryParams = queryParams || {};
    this._variants = variants || '';

    if (!uid) {
      this._urlPath = `/assets`;
    }
    if (queryObj) {
      this._parameters = { ...this._parameters, ...queryObj };
    }
  }
  // Validate if input is alphanumeric 
  private isValidAlphanumeric(input: string): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9_.-]+$/;
    return alphanumericRegex.test(input);
  }

  // Validate if input matches any of the safe, pre-approved patterns
  private isValidRegexPattern(input: string): boolean {
    const validRegex = /^[a-zA-Z0-9|^$.*+?()[\]{}\\-]+$/; // Allow only safe regex characters
    if (!validRegex.test(input)) {
        return false;
    }
    try {
        new RegExp(input);
        return true;
    } catch (e) {
        return false;
    }
  }

  private isValidValue(value: any[]): boolean {
    return Array.isArray(value) && value.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean');
  }

  /**
   * @method where
   * @memberof Query
   * @description Filters the results based on the specified criteria.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.where("field_UID", QueryOperation.IS_LESS_THAN, ["field1", "field2"]).find()
   * // OR
   * const asset = await stack.asset().query().where("field_UID", QueryOperation.IS_LESS_THAN, ["field1", "field2"]).find()
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.where("field_UID", QueryOperation.MATCHES, ["field1", "field2"]).find()
   * @returns {Query}
   */
  where(
    fieldUid: string,
    queryOperation: QueryOperation | TaxonomyQueryOperation,
    fields: string | string[] | number | number[] | object | boolean,
    additionalData?: object
  ): Query {
    if (!this.isValidAlphanumeric(fieldUid)) {
      console.error("Invalid fieldUid:", fieldUid);
      return this;
    }
    if (queryOperation == QueryOperation.EQUALS) {
      this._parameters[fieldUid] = fields;
    }
    else {
      const parameterValue: { [key in QueryOperation]?: string | string[] } = { [queryOperation]: fields, ...additionalData };
      this._parameters[fieldUid] = parameterValue;
    }
    return this;
  }

  /**
   * @method regex
   * @memberof Query
   * @description Retrieve entries that match the provided regular expressions
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.regex('title','^Demo').find()
   * // OR
   * const result = await query.regex('title','^Demo', 'i').find() // regex with options
   * @returns {Query}
   */
  regex(fieldUid: string, regexPattern: string, options?: string): Query {
    if (!this.isValidAlphanumeric(fieldUid)) {
      console.error("Invalid fieldUid:", fieldUid);
      return this;
    }
    if (!this.isValidRegexPattern(regexPattern)) {
      throw new Error("Invalid regexPattern: Must be a valid regular expression");
    }
    else {
      this._parameters[fieldUid] = { $regex: regexPattern };
      if (options) this._parameters[fieldUid].$options = options;
      return this;
    }
  }

  /**
   * @method whereIn
   * @memberof Query
   * @description Get entries having values based on referenced fields.
   * The query retrieves all entries that satisfy the query conditions made on referenced fields
   * This method sets the '$in_query' parameter to a reference field UID and a query instance in the API request.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const subQuery = stack.contentType("referencedContentTypeUid").entry().query().where("title", QueryOperation.EQUALS, "value");
   * query.whereIn("brand", subQuery)
   * const result = await query.find()
   *
   * @param {string} referenceUid - UID of the reference field to query.
   * @param {Query} queryInstance - The Query instance to include in the where clause.
   * @returns {Query} - Returns the Query instance for chaining.
   */
  whereIn(referenceUid: string, queryInstance: Query): Query {
    // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    if (!this.isValidAlphanumeric(referenceUid)) {
      throw new Error("Invalid referenceUid: Must be alphanumeric.");
    }
    this._parameters[referenceUid] = { '$in_query': queryInstance._parameters };
    return this;
  }

  /**
   * @method whereNotIn
   * @memberof Query
   * @description Get entries having values based on referenced fields.
   * This query works the opposite of $in_query and retrieves all entries that does not satisfy query conditions made on referenced fields.
   * This method sets the '$nin_query' parameter to a reference field UID and a query instance in the API request.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const subQuery = stack.contentType("referencedContentTypeUid").entry().query().where("title", QueryOperation.EQUALS, "value");
   * query.whereNotIn("brand", subQuery)
   * const result = await query.find()
   *
   * @param {string} referenceUid - UID of the reference field to query.
   * @param {Query} queryInstance - The Query instance to include in the where clause.
   * @returns {Query} - Returns the Query instance for chaining.
   */
  whereNotIn(referenceUid: string, queryInstance: Query): Query {
    // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    if (!this.isValidAlphanumeric(referenceUid)) {
      throw new Error("Invalid referenceUid: Must be alphanumeric.");
    }
    this._parameters[referenceUid] = { '$nin_query': queryInstance._parameters };
    return this;
  }

  /**
   * @method queryOperator
   * @memberof Query
   * @description In case of '$and' get entries that satisfy all the conditions provided in the '$and' query and
   * in case of '$or' query get all entries that satisfy at least one of the given conditions provided in the '$or' query.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentType1Uid").entry().query();
   * const subQuery1 = stack.contentType("contentType2Uid").entry().query().where("price", QueryOperation.IS_LESS_THAN, 90);
   * const subQuery2 = stack.contentType("contentType3Uid").entry().query().where("discount", QueryOperation.INCLUDES, [20, 45]);
   * query.queryOperator(QueryOperator.AND, subQuery1, subQuery2)
   * const result = await query.find()
   *
   * @param {QueryOperator} queryType - The type of query operator to apply.
   * @param {...Query[]} queryObjects - The Query instances to apply the query to.
   * @returns {Query} - Returns the Query instance for chaining.
   */
  queryOperator(queryType: QueryOperator, ...queryObjects: Query[]): Query {
    const paramsList: BaseQueryParameters[] = [];
    for (const queryItem of queryObjects) {
      paramsList.push(queryItem._parameters);
    }
    this._parameters[queryType] = paramsList;

    return this;
  }

  /**
   * @method getQuery
   * @memberof Query
   * @description Returns the raw (JSON) query based on the filters applied on Query object.
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = query.getQuery()
   * // OR
   * const assetQuery = stack.asset().query();
   * const assetResult = assetQuery.getQuery()
   *
   * @returns {{ [key: string]: any }} The raw query object
   */
  getQuery(): { [key: string]: any } {
    return this._parameters;
  }

  /**
   * @method containedIn
   * @memberof Query
   * @description Filters entries where the field value is contained in the provided array of values
   * @param {string} key - The field UID to filter on
   * @param {(string | number | boolean)[]} value - Array of values to match against
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.containedIn('fieldUid', ['value1', 'value2']).find()
   * 
   * @returns {Query}
   */
  containedIn(key: string, value: (string | number | boolean)[]): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (!this.isValidValue(value)) {
      console.error("Invalid value:", value);
      return this;
    }
    this._parameters[key] = { '$in': value };
    return this;
  }

  /**
   * @method notContainedIn
   * @memberof Query
   * @description Filters entries where the field value is not contained in the provided array of values
   * @param {string} key - The field UID to filter on
   * @param {(string | number | boolean)[]} value - Array of values to exclude
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.notContainedIn('fieldUid', ['value1', 'value2']).find()
   * 
   * @returns {Query}
   */
  notContainedIn(key: string, value: (string | number | boolean)[]): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (!this.isValidValue(value)) {
      console.error("Invalid value:", value);
      return this;
    }
    this._parameters[key] = { '$nin': value };
    return this;
  }

  /**
   * @method exists
   * @memberof Query
   * @description Filters entries where the specified field exists
   * @param {string} key - The field UID to check for existence
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.exists('fieldUid').find()
   * 
   * @returns {Query}
   */
  exists(key: string): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    this._parameters[key] = { '$exists': true };
    return this;
  }

  /**
   * @method notExists
   * @memberof Query
   * @description Filters entries where the specified field does not exist
   * @param {string} key - The field UID to check for non-existence
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query = stack.contentType("contentTypeUid").entry().query();
   * const result = await query.notExists('fieldUid').find()
   * 
   * @returns {Query}
   */
  notExists(key: string): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    this._parameters[key] = { '$exists': false };
    return this;
  }

  /**
   * @method or
   * @memberof Query
   * @description Combines multiple queries with OR logic - returns entries that match at least one of the provided queries
   * @param {...Query} queries - Query instances to combine with OR logic
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query1 = stack.contentType('contenttype_uid').entry().query().containedIn('fieldUID', ['value']);
   * const query2 = stack.contentType('contenttype_uid').entry().query().where('fieldUID', QueryOperation.EQUALS, 'value2');
   * const result = await stack.contentType('contenttype_uid').entry().query().or(query1, query2).find();
   *  
   * @returns {Query}
   */
  or(...queries: Query[]): Query {
    const paramsList: BaseQueryParameters[] = [];
    for (const queryItem of queries) {
      paramsList.push(queryItem._parameters);
    }
    this._parameters.$or = paramsList;
    return this;
  }

  /**
   * @method and
   * @memberof Query
   * @description Combines multiple queries with AND logic - returns entries that match all of the provided queries
   * @param {...Query} queries - Query instances to combine with AND logic
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const query1 = stack.contentType('contenttype_uid').entry().query().containedIn('fieldUID', ['value']);
   * const query2 = stack.contentType('contenttype_uid').entry().query().where('fieldUID', QueryOperation.EQUALS, 'value2');
   * const result = await stack.contentType('contenttype_uid').entry().query().and(query1, query2).find();
   *  
   * @returns {Query}
   */
  and(...queries: Query[]): Query {
    const paramsList: BaseQueryParameters[] = [];
    for (const queryItem of queries) {
      paramsList.push(queryItem._parameters);
    }
    this._parameters.$and = paramsList;
    return this;
  }

  /**
   * @method equalTo
   * @memberof Query
   * @description Filters entries where the field value equals the specified value
   * @param {string} key - The field UID to filter on
   * @param {string | number | boolean} value - The value to match
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().equalTo('fieldUid', 'value').find();
   *  
   * @returns {Query}
   */
  equalTo(key: string, value: string | number | boolean): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error("Invalid value (expected string or number):", value);
      return this;
    }
    this._parameters[key] = value;
    return this;
  }

  /**
   * @method notEqualTo
   * @memberof Query
   * @description Filters entries where the field value does not equal the specified value
   * @param {string} key - The field UID to filter on
   * @param {string | number | boolean} value - The value to exclude
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().notEqualTo('fieldUid', 'value').find();
   *  
   * @returns {Query}
   */
  notEqualTo(key: string, value: string | number | boolean): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error("Invalid value (expected string or number):", value);
      return this;
    }
    this._parameters[key] = { '$ne': value };
    return this;
  }

  /**
   * @method referenceIn
   * @memberof Query
   * @description Filters entries where the reference field matches entries from the provided query
   * @param {string} key - The reference field UID to filter on
   * @param {Query} query - Query instance to match referenced entries against
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const subQuery = stack.contentType('contenttype_uid').entry().query().where('title', QueryOperation.EQUALS, 'value');
   * const result = await stack.contentType('contenttype_uid').entry().query().referenceIn('reference_uid', subQuery).find();
   *  
   * @returns {Query}
   */
  referenceIn(key: string, query: Query): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    this._parameters[key] = { '$in_query': query._parameters }
    return this;
  }

  /**
   * @method referenceNotIn
   * @memberof Query
   * @description Filters entries where the reference field does not match entries from the provided query
   * @param {string} key - The reference field UID to filter on
   * @param {Query} query - Query instance to exclude referenced entries against
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const subQuery = stack.contentType('contenttype_uid').entry().query().where('title', QueryOperation.EQUALS, 'value');
   * const result = await stack.contentType('contenttype_uid').entry().query().referenceNotIn('reference_uid', subQuery).find();
   *  
   * @returns {Query}
   */
  referenceNotIn(key: string, query: Query): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    this._parameters[key] = { '$nin_query': query._parameters }
    return this;
  }

  /**
   * @method tags
   * @memberof Query
   * @description Filters entries that have any of the specified tags
   * @param {(string | number | boolean)[]} values - Array of tag values to filter by
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().tags(['tag1']).find();
   *  
   * @returns {Query}
   */
  tags(values: (string | number | boolean)[]): Query {
    if (!this.isValidValue(values)) {
      console.error("Invalid value:", values);
      return this;
    }
    this._parameters['tags'] = values;
    return this;
  }

  /**
   * @method search
   * @memberof Query
   * @description Enables typeahead search functionality for the query
   * @param {string} key - The search term to use for typeahead search
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().search('key').find();
   *  
   * @returns {Query}
   */
  search(key: string): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    this._queryParams['typeahead'] = key
    return this
  }

  /**
   * @method lessThan
   * @memberof Query
   * @description Filters entries where the field value is less than the specified value
   * @param {string} key - The field UID to filter on
   * @param {string | number} value - The value to compare against
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().lessThan('fieldUid', 100).find();
   *  
   * @returns {Query}
   */
  lessThan(key: string, value: (string | number)): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error("Invalid value (expected string or number):", value);
      return this;
    }

    this._parameters[key] = { '$lt': value };
    return this;
  }

  /**
   * @method lessThanOrEqualTo
   * @memberof Query
   * @description Filters entries where the field value is less than or equal to the specified value
   * @param {string} key - The field UID to filter on
   * @param {string | number} value - The value to compare against
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().lessThanOrEqualTo('fieldUid', 100).find();
   *  
   * @returns {Query}
   */
  lessThanOrEqualTo(key: string, value: (string | number)): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error("Invalid value (expected string or number):", value);
      return this;
    }
    this._parameters[key] = { '$lte': value };
    return this;
  }

  /**
   * @method greaterThan
   * @memberof Query
   * @description Filters entries where the field value is greater than the specified value
   * @param {string} key - The field UID to filter on
   * @param {string | number} value - The value to compare against
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().greaterThan('fieldUid', 100).find();
   *  
   * @returns {Query}
   */
  greaterThan(key: string, value: (string | number)): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error("Invalid value (expected string or number):", value);
      return this;
    }
    this._parameters[key] = { '$gt': value };
    return this;
  }

  /**
   * @method greaterThanOrEqualTo
   * @memberof Query
   * @description Filters entries where the field value is greater than or equal to the specified value
   * @param {string} key - The field UID to filter on
   * @param {string | number} value - The value to compare against
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('contenttype_uid').entry().query().greaterThanOrEqualTo('fieldUid', 100).find();
   *  
   * @returns {Query}
   */
  greaterThanOrEqualTo(key: string, value: (string | number)): Query {
    if (!this.isValidAlphanumeric(key)) {
      console.error("Invalid key:", key);
      return this;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      console.error("Invalid value (expected string or number):", value);
      return this;
    }
    this._parameters[key] = { '$gte': value };
    return this;
  }

  /**
   * Override find method to include content type UID directly for better caching
   */
  override async find<T>(encode: boolean = false): Promise<FindResponse<T>> {
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
      // Add contentTypeUid directly for improved caching
      contentTypeUid: this._contentTypeUid
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
}
