import { AxiosInstance, getData } from '@contentstack/core';

interface EntryResponse<T> {
  entry: T;
}
export class Entry {
  protected _client: AxiosInstance;
  private _contentTypeUid: string;
  private _entryUid: string;
  private _urlPath: string;
  protected _variants: string;
  _queryParams: { [key: string]: string | number | string[] } = {};
  constructor(client: AxiosInstance, contentTypeUid: string, entryUid: string) {
    this._client = client;
    this._contentTypeUid = contentTypeUid;
    this._entryUid = entryUid;
    this._urlPath = `/content_types/${this._contentTypeUid}/entries/${this._entryUid}`;
    this._variants = '';
  }

  /**
   * @method includeFallback
   * @memberof Entry
   * @description When an entry is not published in a specific language, content can be fetched from its fallback language
   * @returns {Entry}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry(entry_uid).includeFallback().fetch();
   */
  includeFallback(): Entry {
    this._queryParams.include_fallback = 'true';

    return this;
  }

  /**
   * @method variants
   * @memberof Entry
   * @description The variant header will be added to axios client
   * @returns {Entry}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType('abc').entry('entry_uid').variants('xyz').fetch();
   */
  variants(variants: string | string[]): Entry {
    if (Array.isArray(variants) && variants.length > 0) {
      this._variants = variants.join(',');
    } else if (typeof variants == 'string' && variants.length > 0) {
      this._variants = variants;
    }

    return this;
  }

  /**
   * @method includeMetadata
   * @memberof Entry
   * @description Include the metadata for getting metadata content for the entry.
   * @returns {Entry}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry(entry_uid).includeMetadata().fetch();
   */
  includeMetadata(): Entry {
    this._queryParams.include_metadata = 'true';

    return this;
  }

  /**
   * @method includeEmbeddedItems
   * @memberof Entry
   * @description Include Embedded Objects (Entry and Assets) along with entry/entries details.
   * @returns {Entry}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry(entry_uid).includeEmbeddedItems().fetch();
   */
  includeEmbeddedItems(): Entry {
    this._queryParams['include_embedded_items[]'] = 'BASE';

    return this;
  }

  /**
   * @method includeReference
   * @memberof Entry
   * @description To include the content of the referred entry in your response,
   * you need to use the include[] parameter and specify the UID of the reference field as value.
   * This function sets the include parameter to a reference field UID in the API request.
   * @example
   * const stack = contentstack.stack("apiKey", "deliveryKey", "environment");
   * const query = stack.contentType("contentTypeUid").entry(entry_uid).includeReference("brand").fetch()
   *
   * @param {string} referenceFieldUid - UID of the reference field to include.
   * @returns {Entry} - Returns the Entry instance for chaining.
   */
  includeReference(...referenceFieldUid: (string | string[])[]): Entry {
    if (referenceFieldUid.length) {
      referenceFieldUid.forEach(value => {
        if (!Array.isArray(this._queryParams['include[]'])) {
          this._queryParams['include[]'] = [];
        }
        (this._queryParams['include[]'] as string[]).push(...(Array.isArray(value) ? value : [value]));
      });
    } else {
      console.error("Argument should be a String or an Array.");
    }
    return this;
  }

  /**
   * @method includeContentType
   * @memberof Entry
   * @description IInclude the details of the content type along with the entries details
   * @returns {Entry}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry(entry_uid).includeContentType().fetch();
   */
  includeContentType(): Entry {
    this._queryParams.include_content_type = 'true';

    return this;
  }

  /**
   * @method includeBranch
   * @memberof Entry
   * @description Includes the branch in result
   * @returns {Entry}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry(entry_uid).includeBranch().fetch();
   */
  includeBranch(): Entry {
    this._queryParams.include_branch = 'true';

    return this;
  }

  /**
   * @method locale
   * @memberof Entry
   * @description The assets published in the locale will be fetched
   * @returns {Entry}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.assetQuery().locale('en-us').fetch();
   */
  locale(locale: string): Entry {
    this._queryParams.locale = locale;

    return this;
  }

  /**
   * @method fetch
   * @memberof Entry
   * @description Fetches the entry data on the basis of the entry uid
   * @returns {Collection}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry(entry_uid).fetch();
   */
  async fetch<T>(): Promise<T> {
    const getRequestOptions: any = { params: this._queryParams};
    if (this._variants) {
      getRequestOptions.headers = {
        ...getRequestOptions.headers,
        'x-cs-variant-uid': this._variants
      };
    }

    const response = await getData(this._client, this._urlPath, getRequestOptions);

    if (response.entry) return response.entry as T;

    return response;
  }

    /**
   * @method addParams
   * @memberof Entry
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
   * @returns {Entry}
   */
  addParams(paramObj: { [key: string]: string | number | string[] }): Entry {
    this._queryParams = { ...this._queryParams, ...paramObj };

    return this;
  }
}
