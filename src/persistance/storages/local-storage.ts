import type { Callback } from '../helper/utils';
import { iGlobal } from '../helper/utils';
import { Storage } from '../types/storage';

export const localStorage: Storage = {
  name: 'localStorage',
  clear: clear,
  each: each,
  getItem: getItem,
  removeItem: removeItem,
  setItem: setItem,
};

/**
 * Gets the localStorage instance from the global object
 * @returns {Storage} The localStorage instance
 * @private
 */
function _localStorage() {
  return iGlobal.localStorage;
}

/**
 * Clears all items from localStorage
 */
function clear() {
  _localStorage().clear();
}

/**
 * Iterates over all items in localStorage and calls the callback for each
 * @param {Callback} callback - Function to call for each item with (value, key) parameters
 */
function each(callback: Callback) {
  for (let i = _localStorage().length - 1; i >= 0; i--) {
    const key = _localStorage().key(i);
    if (key && getItem(key)) {
      const value = getItem(key);
      callback(value, key);
    }
  }
}
/**
 * Sets an item in localStorage
 * @param {string} key - The key to store under
 * @param {string} value - The value to store
 */
function setItem(key: string, value: string) {
  if (!key) {
    return;
  }
  _localStorage().setItem(key, value);
}

/**
 * Gets an item from localStorage
 * @param {string} key - The key to retrieve
 * @returns {string | null} The stored value or null if not found
 */
function getItem(key: string): string | null {
  return _localStorage().getItem(key);
}

/**
 * Removes an item from localStorage
 * @param {string} key - The key to remove
 */
function removeItem(key: string) {
  _localStorage().removeItem(key);
}
