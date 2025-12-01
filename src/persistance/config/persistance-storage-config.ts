import { Storage } from '../types/storage';
import { StorageType } from '../types/storage-type';

/**
 * Configuration type for persistence store
 * Can be either a custom storage with Store interface or standard storage with PersistanceStoreOptions
 */
export type PersistanceStoreConfig =
  | (Store & PersistanceStoreOptions)
  | ({ storeType?: StorageType } & PersistanceStoreOptions);

/**
 * Interface for custom storage configuration
 */
export interface Store {
  /** Custom storage implementation */
  storage: Storage;
  /** Storage type identifier */
  storeType: 'customStorage';
}

/**
 * Options for persistence store configuration
 */
export interface PersistanceStoreOptions {
  /** Maximum age for cached items in milliseconds (default: 24 hours) */
  maxAge?: number;
  /** Serializer function for storing data (default: JSON.stringify) */
  serializer?: (content: any) => string;
  /** Deserializer function for retrieving data (default: JSON.parse) */
  deserializer?: (cacheString: string) => any;
}
