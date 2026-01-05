import type { Callback } from '../helper/utils';
import { Storage } from '../types/storage';

export const memoryStorage: Storage = {
  name: 'memoryStorage',
  clear: clear,
  each: each,
  getItem: getItem,
  removeItem: removeItem,
  setItem: setItem,
};

let memory: { [key: string]: string | null } = {};

/**
 * Clears all items from memory storage
 */
function clear() {
  memory = {};
}

/**
 * Iterates over all items in memory storage and calls the callback for each
 * @param {Callback} callback - Function to call for each item with (value, key) parameters
 */
function each(callback: Callback) {
  for (const key in memory) {
    const value = getItem(key);
    callback(value, key);
  }
}
/**
 * Sets an item in memory storage
 * @param {string} key - The key to store under
 * @param {string} value - The value to store
 */
function setItem(key: string, value: string) {
  if (!key) {
    return;
  }
  memory[key] = value;
}

/**
 * Gets an item from memory storage
 * @param {string} key - The key to retrieve
 * @returns {string | null} The stored value or null if not found
 */
function getItem(key: string): string | null {
  return memory[key];
}

/**
 * Removes an item from memory storage
 * @param {string} key - The key to remove
 */
function removeItem(key: string) {
  delete memory[key];
}
