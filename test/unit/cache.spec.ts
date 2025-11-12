import MockAdapter from "axios-mock-adapter";
import { httpClient, AxiosInstance } from "@contentstack/core";
import { handleRequest } from "../../src/lib/cache";
import { HOST_URL } from "../utils/constant";
import { Policy } from "../../src/lib/types";
import { PersistanceStore } from "../../src/persistance";
import { iGlobal } from "../../src/persistance/helper/utils";

// Mock localStorage for Node.js environment
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Setup mock before tests
beforeAll(() => {
  (iGlobal as any).localStorage = mockLocalStorage;
});

describe("Cache handleRequest function", () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let apiKey: string;
  let resolve: jest.Mock<any, any>;
  let reject: jest.Mock<any, any>;
  let config: { contentTypeUid: string; headers: object };

  beforeAll(() => {
    client = httpClient({ defaultHostname: HOST_URL });
    mockClient = new MockAdapter(client as any);
  });

  beforeEach(() => {
    apiKey = "testKey";
    resolve = jest.fn();
    reject = jest.fn();
    config = { contentTypeUid: "testContentType", headers: {} };
  });

  describe("NETWORK_ELSE_CACHE policy", () => {
    it("should return network response when proper response is received", async () => {
      const cacheOptions = { policy: Policy.NETWORK_ELSE_CACHE, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).toHaveBeenCalledWith(config);
      expect(resolve).toBeCalledWith({ data: "foo" });
      expect(reject).not.toBeCalled();

      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });

    it("should return cache data when proper network response is not received", async () => {
      const cacheOptions = { policy: Policy.NETWORK_ELSE_CACHE, maxAge: 3600 };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });
      const cacheStore = new PersistanceStore(cacheOptions);

      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.setItem(
        enhancedCacheKey,
        "cacheData",
        config.contentTypeUid,
        cacheOptions.maxAge
      );
      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).toHaveBeenCalledWith(config);
      expect(resolve).toBeCalledWith({
        config: {},
        data: "cacheData",
        headers: {},
        status: 200,
        statusText: "OK",
      });
      expect(reject).not.toBeCalled();

      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });

    it("should return error data when network response has error", async () => {
      const cacheOptions = { policy: Policy.NETWORK_ELSE_CACHE, maxAge: 3600 };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });
      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).toHaveBeenCalledWith(config);
      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith({
        foo: "bar",
        baz: "quux",
      });

      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });
  });

  describe("CACHE_THEN_NETWORK policy", () => {
    it("should return cache response when proper cache is available then return network response", async () => {
      const cacheOptions = { policy: Policy.CACHE_THEN_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({ data: "foo" }));

      const cacheStore = new PersistanceStore(cacheOptions);
      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.setItem(
        enhancedCacheKey,
        "cacheData",
        config.contentTypeUid,
        cacheOptions.maxAge
      );

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).not.toHaveBeenCalled();
      expect(resolve).toBeCalledWith({
        config: {},
        data: "cacheData",
        headers: {},
        status: 200,
        statusText: "OK",
      });
      expect(reject).not.toBeCalled();

      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });
    it("should return api response when proper cache is not available", async () => {
      const cacheOptions = { policy: Policy.CACHE_THEN_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));

      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).toHaveBeenCalled();
      expect(resolve).toBeCalledWith({ data: "foo" });
      expect(reject).not.toBeCalled();

      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });
    it("should return error api response when data is not available in network or cache", async () => {
      const cacheOptions = { policy: Policy.CACHE_THEN_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });

      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).toHaveBeenCalled();
      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith({
        foo: "bar",
        baz: "quux",
      });

      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });
  });

  describe("CACHE_ELSE_NETWORK policy", () => {
    it("should return cache response when proper cache is available", async () => {
      const cacheOptions = { policy: Policy.CACHE_ELSE_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({ data: "foo" }));

      const cacheStore = new PersistanceStore(cacheOptions);
      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.setItem(
        enhancedCacheKey,
        "cacheData",
        config.contentTypeUid,
        cacheOptions.maxAge
      );

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).not.toHaveBeenCalledWith(config);
      expect(resolve).toBeCalledWith({
        config: {},
        data: "cacheData",
        headers: {},
        status: 200,
        statusText: "OK",
      });
      expect(reject).not.toBeCalled();

      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });

    it("should return network response data when cache is not available", async () => {
      const cacheOptions = { policy: Policy.CACHE_ELSE_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).toHaveBeenCalledWith(config);
      expect(resolve).toBeCalledWith({ data: "foo" });
      expect(reject).not.toBeCalled();

      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });

    it("should return error data when network response has error", async () => {
      const cacheOptions = { policy: Policy.CACHE_ELSE_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });
      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        config
      );

      expect(defaultAdapter).toHaveBeenCalled();
      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith({
        foo: "bar",
        baz: "quux",
      });

      // Use enhanced cache key format: contentTypeUid + apiKey
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });
  });

  describe("Enhanced cache key with entryUid", () => {
    it("should extract entryUid from URL pattern", async () => {
      const cacheOptions = { policy: Policy.CACHE_THEN_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const configWithUrl = {
        ...config,
        url: '/content_types/test_ct/entries/entry123',
      };

      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        configWithUrl
      );

      expect(defaultAdapter).toHaveBeenCalled();
      expect(resolve).toBeCalledWith({ data: "foo" });

      // Clean up with enhanced key that includes entry UID
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}_entry_entry123`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });

    it("should use entryUid from config when available", async () => {
      const cacheOptions = { policy: Policy.CACHE_THEN_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const configWithEntryUid = {
        ...config,
        entryUid: 'entry456',
      };

      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        configWithEntryUid
      );

      expect(defaultAdapter).toHaveBeenCalled();
      expect(resolve).toBeCalledWith({ data: "foo" });

      // Clean up with enhanced key that includes entry UID
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}_entry_entry456`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });

    it("should return null when URL does not match entry pattern", async () => {
      const cacheOptions = { policy: Policy.CACHE_THEN_NETWORK, maxAge: 3600 };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const configWithInvalidUrl = {
        ...config,
        url: '/assets',
      };

      const cacheStore = new PersistanceStore(cacheOptions);

      await handleRequest(
        cacheOptions,
        apiKey,
        defaultAdapter,
        resolve,
        reject,
        configWithInvalidUrl
      );

      expect(defaultAdapter).toHaveBeenCalled();
      expect(resolve).toBeCalledWith({ data: "foo" });

      // Clean up with standard enhanced key (no entry UID)
      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      cacheStore.removeItem(enhancedCacheKey, config.contentTypeUid);
    });
  });
});
