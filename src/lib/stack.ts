import { StackConfig, SyncStack, SyncType, LivePreviewQuery } from './types';
import { HttpClient } from './http-client';
import { Asset } from './asset';
import { AssetQuery } from './asset-query';
import { ContentType } from './content-type';
import { ContentTypeQuery } from './contenttype-query';
import { synchronization } from './synchronization';
import {TaxonomyQuery} from './taxonomy-query';
import { GlobalFieldQuery } from './global-field-query';
import { GlobalField } from './global-field';
import { Entry } from './entry';
import { Query } from './query';

export class Stack {
  private _client: HttpClient;
  readonly config: StackConfig;

  constructor(config: StackConfig) {
    this._client = new HttpClient(config);
    this.config = config;
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
  asset(uid: string): Asset {
    return new Asset(this._client, uid);
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
  contentType(uid: string): Query {
    return new Query(this._client, uid);
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
   * @param {object} params - params is an object that supports 'locale', 'start_date', 'content_type_uid', and 'type' queries.
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
      (this._client as any).stackConfig.live_preview = livePreviewParams;
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

  getClient(): HttpClient {
    return this._client;
  }

  async getLastActivities() {
    try {
      const response = await this._client.get('/last_activities');
      return response.data;
    } catch (error) {
      throw error;
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
    this.config.port = port;
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
    this.config.debug = debug;
  }

  entry(contentTypeUid: string, entryUid: string): Entry {
    return new Entry(this._client, contentTypeUid, entryUid);
  }

  async getContentTypes() {
    try {
      const response = await this._client.get('/content_types');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getContentType(uid: string) {
    try {
      const response = await this._client.get(`/content_types/${uid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAssets() {
    try {
      const response = await this._client.get('/assets');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAsset(uid: string) {
    try {
      const response = await this._client.get(`/assets/${uid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEntries(contentTypeUid: string) {
    try {
      const response = await this._client.get(`/content_types/${contentTypeUid}/entries`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEntry(contentTypeUid: string, entryUid: string) {
    try {
      const response = await this._client.get(`/content_types/${contentTypeUid}/entries/${entryUid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
