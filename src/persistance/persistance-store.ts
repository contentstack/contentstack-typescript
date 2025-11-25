import { Store, PersistanceStoreConfig } from './config/persistance-storage-config';
import { localStorage } from './storages/local-storage';
import { memoryStorage } from './storages/memory-storage';
import { Storage } from './types/storage';
import { StorageType } from './types/storage-type';

/**
 * Persistence store for caching data with expiration support
 * Supports localStorage, memoryStorage, and custom storage implementations
 */
export class PersistanceStore {
  protected store: Storage = localStorage;
  readonly config: PersistanceStoreConfig;
  protected name: string;

  /**
   * Creates a new PersistanceStore instance
   * @param {PersistanceStoreConfig} [config] - Configuration options for the store
   */
  constructor(config?: PersistanceStoreConfig) {
    let defaultConfig: PersistanceStoreConfig = {
      storeType: 'localStorage',
      maxAge: 1000 * 60 * 60 * 24,
      serializer: JSON.stringify,
      deserializer: JSON.parse,
    };
    defaultConfig = {
      ...defaultConfig,
      ...config,
    };
    this.setStore(defaultConfig.storeType, (defaultConfig as unknown as Store).storage);
    this.config = defaultConfig;
    this.name = ''; // TODO add stack api key to name
  }
  private setStore(type?: StorageType | 'customStorage', store?: Storage) {
    switch (type) {
      case 'localStorage':
        break;
      case 'memoryStorage':
        this.store = memoryStorage;
        break;
      case 'customStorage':
        if (!store) {
          throw new TypeError('StorageType `customStorage` should have `storage`.');
        } else {
          this.store = store;
        }
        break;
    }
  }
  /**
   * Sets an item in the store with optional expiration
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store
   * @param {string} [contentTypeUid] - Optional content type UID for key scoping
   * @param {number} [maxAge] - Optional maximum age in milliseconds (overrides config maxAge)
   */
  setItem(key: string, value: any, contentTypeUid?: string, maxAge?: number) {
    if (!key) {
      return;
    }
    const generatedKey = this.generateCSKey(key, contentTypeUid);

    if (!value) {
      this.store.removeItem(generatedKey);

      return;
    }
    const expiry = this.calculateExpiry(maxAge);
    let content: any = { value, expiry };
    if (this.config.serializer) {
      content = this.config.serializer(content);
    }

    this.store.setItem(generatedKey, content);
  }
  /**
   * Gets an item from the store if it exists and hasn't expired
   * @param {string} key - The key to retrieve
   * @param {string} [contentTypeUid] - Optional content type UID for key scoping
   * @returns {any} The stored value if found and not expired, undefined otherwise
   */
  getItem(key: string, contentTypeUid?: string): any {
    const generatedKey = this.generateCSKey(key, contentTypeUid);
    const content = this.store.getItem(generatedKey);

    if (content) {
      if (this.config.deserializer) {
        const item = this.config.deserializer(content);
        if (!this.isExpire(item.expiry)) {
          return item.value;
        } else {
          this.removeItem(key, contentTypeUid);
        }
      }
    }
  }

  /**
   * Removes an item from the store
   * @param {string} key - The key to remove
   * @param {string} [contentTypeUid] - Optional content type UID for key scoping
   */
  removeItem(key: string, contentTypeUid?: string) {
    const generatedKey = this.generateCSKey(key, contentTypeUid);
    this.store.removeItem(generatedKey);
  }

  /**
   * Clears all items from the store, or items matching a specific content type UID
   * @param {string} [contentTypeUid] - Optional content type UID to clear only matching items
   */
  clear(contentTypeUid?: string) {
    if (!contentTypeUid) {
      this.store.clear();
    } else {
      this.store.each((_, key) => {
        if (key.match(contentTypeUid)) {
          this.store.removeItem(key);
        }
      });
    }
  }

  private generateCSKey(key: string, contentTypeUid?: string): string {
    let keyPrefix = 'cs_store_js';
    if (contentTypeUid) {
      keyPrefix = contentTypeUid + '_' + keyPrefix;
    }
    keyPrefix = this.name + '_' + keyPrefix + '_' + key;

    return keyPrefix;
  }
  private calculateExpiry(maxAge?: number): number {
    const now = new Date();
    const nowMSec = now.getTime();
    if (maxAge) {
      return nowMSec + maxAge;
    } else if (this.config.maxAge) {
      return nowMSec + this.config.maxAge;
    }

    return 0;
  }

  private isExpire(dateTime: number): boolean {
    if (dateTime) {
      return dateTime < new Date().getTime();
    }

    return true;
  }
}
