import MockAdapter from "axios-mock-adapter";
import { httpClient, AxiosInstance } from "@contentstack/core";
import { handleRequest } from "../../src/cache";
import { HOST_URL } from "../utils/constant";
import { Policy, PersistenceStore } from "../../src/common/types";

/** In-memory mock store matching PersistenceStore interface for tests. */
function createMockPersistenceStore(): PersistenceStore {
  const store = new Map<string, any>();
  return {
    setItem(key: string, value: any, _contentTypeUid?: string, _maxAge?: number) {
      store.set(key, value);
    },
    getItem(key: string, _contentTypeUid?: string): any {
      return store.get(key);
    },
  };
}

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

  it("should throw when persistenceStore is missing", async () => {
    const cacheOptions = {
      policy: Policy.CACHE_THEN_NETWORK,
      maxAge: 3600,
    } as any;
    const defaultAdapter = jest.fn();

    await expect(
      handleRequest(cacheOptions, apiKey, defaultAdapter, resolve, reject, config)
    ).rejects.toThrow(/persistenceStore/);
    expect(defaultAdapter).not.toHaveBeenCalled();
  });

  describe("NETWORK_ELSE_CACHE policy", () => {
    it("should return network response when proper response is received", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.NETWORK_ELSE_CACHE,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));

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
    });

    it("should return cache data when proper network response is not received", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.NETWORK_ELSE_CACHE,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });

      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      persistenceStore.setItem(
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
    });

    it("should return error data when network response has error", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.NETWORK_ELSE_CACHE,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });

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
    });
  });

  describe("CACHE_THEN_NETWORK policy", () => {
    it("should return cache response when proper cache is available then return network response", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_THEN_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({ data: "foo" }));

      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      persistenceStore.setItem(
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
    });
    it("should return api response when proper cache is not available", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_THEN_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));

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
    });
    it("should return error api response when data is not available in network or cache", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_THEN_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });

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
    });
  });

  describe("CACHE_ELSE_NETWORK policy", () => {
    it("should return cache response when proper cache is available", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_ELSE_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({ data: "foo" }));

      const enhancedCacheKey = `${config.contentTypeUid}_${apiKey}`;
      persistenceStore.setItem(
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
    });

    it("should return network response data when cache is not available", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_ELSE_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));

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
    });

    it("should return error data when network response has error", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_ELSE_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn().mockReturnValue({
        foo: "bar",
        baz: "quux",
      });

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
    });
  });

  describe("Enhanced cache key with entryUid", () => {
    it("should extract entryUid from URL pattern", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_THEN_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const configWithUrl = {
        ...config,
        url: '/content_types/test_ct/entries/entry123',
      };

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
    });

    it("should use entryUid from config when available", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_THEN_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const configWithEntryUid = {
        ...config,
        entryUid: 'entry456',
      };

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
    });

    it("should return null when URL does not match entry pattern", async () => {
      const persistenceStore = createMockPersistenceStore();
      const cacheOptions = {
        policy: Policy.CACHE_THEN_NETWORK,
        maxAge: 3600,
        persistenceStore,
      };
      const defaultAdapter = jest.fn((_config) => ({
        data: JSON.stringify("foo"),
      }));
      const configWithInvalidUrl = {
        ...config,
        url: '/assets',
      };

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
    });
  });
});
