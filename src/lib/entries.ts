import { AxiosInstance, getData } from '@contentstack/core';
import { Query } from './query';
import { BaseQuery } from './base-query';

export class Entries extends BaseQuery {
  private _contentTypeUid: string;

  constructor(client: AxiosInstance, contentTypeUid: string) {
    super();
    this._client = client;
    this._contentTypeUid = contentTypeUid;
    this._urlPath = `/content_types/${this._contentTypeUid}/entries`;
    this._variants = '';
  }

  /**
   * @method except
   * @memberof Entries
   * @description Excludes specific field/fields of an entry
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType("contentTypeUid").entry().except("fieldUID").find()
   *
   * @param {string} fieldUid - field uid to exclude
   * @returns {Entries} - returns Entries object for chaining method calls
   */
  except(fieldUid: string|string[]): this {
    if (Array.isArray(fieldUid)) {
      let i = 0;
      for (const uid of fieldUid) {
        this._queryParams[`except[BASE][${i}]`] = uid;
        i++;
      }
    } else {
      this._queryParams["except[BASE][]"] = fieldUid;
    }

    return this;
  }

  /**
   * @method includeBranch
   * @memberof Entries
   * @description Includes the branch in result
   * @returns {Entries}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry().includeBranch().find();
   */
  includeBranch(): Entries {
    this._queryParams.include_branch = 'true';

    return this;
  }

  /**
   * @method includeContentType
   * @memberof Entries
   * @description IInclude the details of the content type along with the entries details
   * @returns {Entries}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry().includeContentType().fetch();
   */
  includeContentType(): Entries {
    this._queryParams.include_content_type = 'true';

    return this;
  }

  /**
   * @method includeEmbeddedItems
   * @memberof Entries
   * @description Include Embedded Objects (Entries and Assets) along with entry/entries details.
   * @returns {Entries}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry().includeEmbeddedItems().fetch();
   */
  includeEmbeddedItems(): Entries {
    this._queryParams['include_embedded_items[]'] = 'BASE';

    return this;
  }

  /**
   * @method includeFallback
   * @memberof Entries
   * @description When an entry is not published in a specific language, content can be fetched from its fallback language
   * @returns {Entries}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry().includeFallback().find();
   */
  includeFallback(): Entries {
    this._queryParams.include_fallback = 'true';

    return this;
  }

  /**
   * @method includeMetadata
   * @memberof Entries
   * @description Include the metadata for getting metadata content for the entry.
   * @returns {Entries}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType(contentType_uid).entry().includeMetadata().find();
   */
  includeMetadata(): Entries {
    this._queryParams.include_metadata = 'true';

    return this;
  }

  /**
   * @method includeReference
   * @memberof Entries
   * @description To include the content of the referred entries in your response,
   * you need to use the include[] parameter and specify the UID of the reference field as value.
   * This function sets the include parameter to a reference field UID in the API request.
   * @example
   * const stack = contentstack.stack("apiKey", "deliveryKey", "environment");
   * const query = stack.contentType("contentTypeUid").entry().includeReference("brand")
   * const res = await query.find()
   *
   * @param {string} referenceFieldUid - UID of the reference field to include.
   * @returns {Entries} - Returns the Entries instance for chaining.
   */
  includeReference(...referenceFieldUid: (string | string[])[]): Entries {
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
   * @method includeReferenceContentTypeUID
   * @memberof Entries
   * @description This method also includes the content type UIDs of the referenced entries returned in the response.
   * @example
   * const stack = contentstack.stack("apiKey", "deliveryKey", "environment");
   * const query = stack.contentType("contentTypeUid").entry().includeReferenceContentTypeUID()
   * const res = await query.find()
   *
   * @returns {Entries} - Returns the Entries instance for chaining.
   */
  includeReferenceContentTypeUID(): Entries {
    this._queryParams.include_reference_content_type_uid = 'true';

    return this;
  }

  /**
   * @method includeSchema
   * @memberof Entries
   * @description This method also includes the content type UIDs of the referenced entries returned in the response.
   * @example
   * const stack = contentstack.stack("apiKey", "deliveryKey", "environment");
   * const query = stack.contentType("contentTypeUid").entry().includeSchema()
   * const res = await query.find()
   *
   * @returns {Entries} - Returns the Entries instance for chaining.
   */
  includeSchema(): Entries {
    this._queryParams.include_schema = 'true';

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
   * const result = await stack.contentType("contentTypeUid").entry().locale('en-us').find();
   */
  locale(locale: string): Entries {
    this._queryParams.locale = locale;

    return this;
  }

  /**
   * @method only
   * @memberof Entries
   * @description Selects specific field/fields of an entry
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType("contentTypeUid").entry().only("fieldUID").find()
   *
   * @param {string} fieldUid - field uid to select
   * @returns {Entries} - returns Entries object for chaining method calls
   */
  only(fieldUid: string|string[]): this {
    if (Array.isArray(fieldUid)) {
      let i = 0;
      for (const uid of fieldUid) {
        this._queryParams[`only[BASE][${i}]`] = uid;
        i++;
      }
    } else {
      this._queryParams["only[BASE][]"] = fieldUid;
    }
    return this;
  }

  /**
   * @method query
   * @memberof Entries
   * @description Fetches the Entry data on the basis of the asset uid
   * @returns {Collection}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType("contentTypeUid").entry().query();
   */
  query(queryObj?: { [key: string]: any }) {
    if (queryObj) return new Query(this._client, this._parameters, this._queryParams, this._variants, this._contentTypeUid, queryObj);

    return new Query(this._client, this._parameters, this._queryParams, this._variants, this._contentTypeUid);
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
   * const result = await stack.contentType('abc').entry().variants('xyz').find();
   */
  variants(variants: string | string[]): Entries {
    if (Array.isArray(variants) && variants.length > 0) {
      this._variants = variants.join(',');
    } else if (typeof variants == 'string' && variants.length > 0) {
      this._variants = variants;
    }
    return this;
  }
}
