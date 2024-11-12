import { BaseQuery } from './base-query';

/* eslint-disable @cspell/spellchecker */
export class EntryQueryable extends BaseQuery {
  /**
   * @method only
   * @memberof EntryQueryable
   * @description Selects specific field/fields of an entry
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType("contentTypeUid").entry().only("fieldUID").find()
   *
   * @param {string} fieldUid - field uid to select
   * @returns {EntryQueryable} - returns EntryQueryable object for chaining method calls
   */
  only(fieldUid: string|string[]): EntryQueryable {
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
   * @method except
   * @memberof EntryQueryable
   * @description Excludes specific field/fields of an entry
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const result = await stack.contentType("contentTypeUid").entry().except("fieldUID").find()
   *
   * @param {string} fieldUid - field uid to exclude
   * @returns {EntryQueryable} - returns EntryQueryable object for chaining method calls
   */
  except(fieldUid: string|string[]): EntryQueryable {
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
}
