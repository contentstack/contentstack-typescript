import { StackConfig, SyncStack, SyncType, LivePreviewQuery, ReleasePreview } from './types';
import { AxiosInstance } from '@contentstack/core';
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
    if (this.config.release_preview) {
      this._client.defaults.headers['release_id'] = this.config.release_preview.release_id;
      this._client.defaults.headers['preview_timestamp'] = this.config.release_preview.preview_timestamp;
    }
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
   * const stack = contentstack.Stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const asset = stack.asset() // For collection of asset
   * // OR
   * const asset = stack.asset('assetUid') // For a single asset with uid 'assetUid'
   *
   */
  Asset(uid: string): Asset;
  Asset(): AssetQuery;
  Asset(uid?: string): Asset | AssetQuery {
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
   * const stack = contentstack.Stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * const contentType = stack.contentType() // For collection of contentType
   * // OR
   * const contentType = stack.contentType('contentTypeUid') // For a single contentType with uid 'contentTypeUid'
   */
  ContentType(): ContentTypeQuery;
  ContentType(uid: string): ContentType;
  ContentType(uid?: string): ContentType | ContentTypeQuery {
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
   * const stack = contentstack.Stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });

   * const taxonomy = stack.Taxonomy() // For taxonomy query object
   */
  Taxonomy(): TaxonomyQuery {
    return new TaxonomyQuery(this._client)
  };

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
  GlobalField(): GlobalFieldQuery;
  GlobalField(uid: string): GlobalField;
  GlobalField(uid?: string): GlobalField | GlobalFieldQuery {
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
   * const stack = contentstack.Stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
   * stack.setLocale('en-155');
   */
  setLocale(locale: string) {
    this.config.locale = locale;
  }

  /**
   * @method setReleasePreview
   * @memberOf Stack
   * @description Sets the release preview config of the API server
   * @param {ReleasePreview} release_preview_config - An object of type `ReleasePreview` which contains the `release_id` and `preview_timestamp` properties.
   * 
   * @example
   * let releasePreviewConfig = {
   *   release_id: "123",
   *   preview_timestamp: "2022-01-01T00:00:00Z"
   * };
   * 
   * setReleasePreview(releasePreviewConfig);
   */
  setReleasePreview(release_preview_config: ReleasePreview): Stack {
    this._client.defaults.headers['release_id'] = release_preview_config.release_id;
    this._client.defaults.headers['preview_timestamp'] = release_preview_config.preview_timestamp;

    return this;
  }

  /**
   * @method getReleasePreview
   * @memberOf Stack
   * @description Returns the current release preview configuration of the API server
   * 
   * @returns {ReleasePreview} An object of type `ReleasePreview` which contains the `release_id` and `preview_timestamp` properties.
   * 
   * @example
   * let releasePreviewConfig = Stack.getReleasePreview();
   * console.log(releasePreviewConfig);
   */
  getReleasePreview(): ReleasePreview {
    return {
        release_id: this._client.defaults.headers['release_id'],
        preview_timestamp: this._client.defaults.headers['preview_timestamp']
    };
  }

  /**
   * @method removeReleasePreview
   * @memberOf Stack
   * @description Removes the current release preview configuration from the API server
   * 
   * @example
   * Stack.removeReleasePreview();
   */
  removeReleasePreview(): Stack {
    delete this._client.defaults.headers['release_id'];
    delete this._client.defaults.headers['preview_timestamp'];

    return this;
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
      const livePreviewParams: any = {
        ...this.config.live_preview,
        live_preview: query.live_preview || 'init',
        contentTypeUid: query.contentTypeUid,
        entryUid: query.entryUid
      }
      this._client.stackConfig.live_preview = livePreviewParams;
    }
  }
}
