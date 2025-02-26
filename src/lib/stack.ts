import { StackConfig, SyncStack, SyncType, LivePreviewQuery } from './types';
import { AxiosInstance, getData } from '@contentstack/core';
import { Asset } from './asset';
import { AssetQuery } from './asset-query';
import { ContentType } from './content-type';
import { ContentTypeQuery } from './contenttype-query';
import { synchronization } from './synchronization';
import {TaxonomyQuery} from './taxonomy-query';
import { GlobalFieldQuery } from './global-field-query';
import { GlobalField } from './global-field';

export class Stack {
  readonly config: StackConfig;
  private _client: AxiosInstance;
  constructor(client: AxiosInstance, config: StackConfig) {
    this._client = client;
    this.config = config;
    this._client.stackConfig = this.config;
  }

  /**
   * @method asset
   * @memberOf Stack
   * @param {String} uid - uid of the asset
   * @description Creates an object for all assets of a stack by default. To retrieve a single asset, specify its UID.
   *
   * @returns {Asset}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const asset = stack.asset() // For collection of asset
   * // OR
   * const asset = stack.asset('assetUid') // For a single asset with uid 'assetUid'
   *
   */
  asset(uid: string): Asset;
  asset(): AssetQuery;
  asset(uid?: string): Asset | AssetQuery {
    if (uid) return new Asset(this._client, uid);

    return new AssetQuery(this._client);
  }

  /**
   * @method contentType
   * @memberOf Stack
   * @param {String} uid - uid of the asset
   * @description Retrieves all contentTypes of a stack by default. To retrieve a single asset, specify its UID.
   *
   * @returns {ContentType}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const contentType = stack.contentType() // For collection of contentType
   * // OR
   * const contentType = stack.contentType('contentTypeUid') // For a single contentType with uid 'contentTypeUid'
   */
  contentType(): ContentTypeQuery;
  contentType(uid: string): ContentType;
  contentType(uid?: string): ContentType | ContentTypeQuery {
    if (uid) return new ContentType(this._client, uid);

    return new ContentTypeQuery(this._client);
  }

  /**
   * @method Taxonomy
   * @memberOf Stack
   * @description Sets the url to /taxonomies/entries. Pass a query to fetch entries with taxonomies
   *
   * @returns {TaxonomyQuery} * @example
   * import contentstack from '@contentstack/typescript'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });

   * const taxonomy = stack.taxonomy() // For taxonomy query object
   */
  taxonomy(): TaxonomyQuery {
    return new TaxonomyQuery(this._client);
  }

  /**
   * @method GlobalField
   * @memberOf Stack
   * @param {String} uid - uid of the asset
   * @description Retrieves all contentTypes of a stack by default. To retrieve a single asset, specify its UID.
   *
   * @returns {ContentType}
   * const contentType = stack.contentType() // For collection of contentType
   * // OR
   * const contentType = stack.contentType('contentTypeUid') // For a single contentType with uid 'contentTypeUid'
   */
  globalField(): GlobalFieldQuery;
  globalField(uid: string): GlobalField;
  globalField(uid?: string): GlobalField | GlobalFieldQuery {
    if (uid) return new GlobalField(this._client, uid);

    return new GlobalFieldQuery(this._client);
  }

  /**
   * @method setLocale
   * @memberOf Stack
   * @description Sets the locale of the API server
   * @param {String} locale - valid locale e.g. fr-fr
   * @return {Stack}
   * @example
   * import contentstack from '@contentstack/delivery-sdk'
   *
   * const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * stack.setLocale('en-155');
   */
  setLocale(locale: string) {
    this.config.locale = locale;
    this._client.defaults.params.locale = locale;
  }

  /**
   * @method sync
   * @memberOf Stack
   * @description Syncs your Contentstack data with your app and ensures that the data is always up-to-date by providing delta updates
   * @param {object} params - params is an object that supports ‘locale’, ‘start_date’, ‘content_type_uid’, and ‘type’ queries.
   * @example
   * Stack.sync()        // For initializing sync
   * @example
   * Stack.sync({ 'locale': 'en-us'})     //For initializing sync with entries of a specific locale
   * @example
   * Stack.sync({ 'start_date': '2018-10-22'})    //For initializing sync with entries published after a specific date
   * @example
   * Stack.sync({ 'content_type_uid': 'session'})   //For initializing sync with entries of a specific content type
   * @example
   * Stack.sync({ 'type': 'entry_published'})
   * //Use the type parameter to get a specific type of content. Supports'asset_published',
   * // 'entry_published', 'asset_unpublished', 'entry_unpublished', 'asset_deleted', 'entry_deleted', 'content_type_deleted'.
   * @example
   * Stack.sync({'pagination_token': '<page_tkn>'})    // For fetching the next batch of entries using pagination token
   * @example
   * Stack.sync({'sync_token': '<sync_tkn>'})    // For performing subsequent sync after initial sync
   * @instance
   */
  async sync(params: SyncType | SyncStack = {}, recursive = false) {
    return await synchronization(this._client, params, recursive);
  }

  livePreviewQuery(query: LivePreviewQuery) {
    if (this.config.live_preview) {
      let livePreviewParams: any = { ...this.config.live_preview };

      if (query.live_preview) {
        livePreviewParams = {
          ...livePreviewParams,
          live_preview: query.live_preview,
          contentTypeUid: query.contentTypeUid || query.content_type_uid,
          entryUid: query.entryUid || query.entry_uid,
          preview_timestamp: query.preview_timestamp || "",
          include_applied_variants: query.include_applied_variants || false,
        };
      } else {
        livePreviewParams = {
          ...livePreviewParams,
          live_preview: "",
          contentTypeUid: "",
          entryUid: "",
          preview_timestamp: "",
          include_applied_variants: false,
        };
      }
      this._client.stackConfig.live_preview = livePreviewParams;
    }

    if (query.hasOwnProperty("release_id")) {
      this._client.defaults.headers["release_id"] = query.release_id;
    } else {
      delete this._client.defaults.headers["release_id"];
    }

    if (query.hasOwnProperty("preview_timestamp")) {
      this._client.defaults.headers["preview_timestamp"] =
        query.preview_timestamp;
    } else {
      delete this._client.defaults.headers["preview_timestamp"];
    }
  }

  getClient(): any {
    return this._client;
  }

  async getLastActivities() {
    try {
      const result = await getData(this._client, '/content_types', {
        params: {
          only_last_activity: true,
          environment: this.config.environment,
        },
      });
      return result;
    } catch (error) {
      throw new Error("Error fetching last activities");
    }
  }

  /**
   * @method setPort
   * @memberOf Stack
   * @description Sets the port of the host
   * @param {Number} port - Port Number
   * @return {Stack}
   * @instance
   * */
  setPort(port: number) {
    if (typeof port === "number") this.config.port = port;
    return this;
  }

  /**
   * @method setDebug
   * @memberOf Stack
   * @description Sets the debug option
   * @param {Number} debug - Debug value
   * @return {Stack}
   * @instance
   * */
  setDebug(debug: boolean) {
    if (typeof debug === "boolean") this.config.debug = debug;
    return this;
  }
}
