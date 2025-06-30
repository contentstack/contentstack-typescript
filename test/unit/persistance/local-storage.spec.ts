import { iGlobal } from "../../../src/persistance/helper/utils";
import { localStorage } from "../../../src/persistance/storages/local-storage";
import { Storage } from "../../../src/persistance/types/storage";

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

describe("local store", () => {
  let store: Storage;

  beforeAll(() => {
    // Mock localStorage on iGlobal
    (iGlobal as any).localStorage = mockLocalStorage;
    (iGlobal as any).document = { cookie: "" };
    store = localStorage;
  });

  it("should create store store", () => {
    expect(store.name).toEqual("localStorage");
    expect(typeof store.clear).toEqual("function");
    expect(typeof store.each).toEqual("function");
    expect(typeof store.getItem).toEqual("function");
    expect(typeof store.setItem).toEqual("function");
    expect(typeof store.removeItem).toEqual("function");
  });

  it("should set item for key with value", () => {
    store.setItem("foo", "bar");
    expect(store.getItem("foo")).toEqual("bar");
  });

  it("should not blank key", () => {
    store.setItem("", "bar");
    expect(store.getItem("")).toEqual(null);
  });

  it("should remove item for key", () => {
    store.removeItem("foo");
    expect(store.getItem("foo")).toEqual(null);
  });

  it("should not throw on blank or not present key", () => {
    store.removeItem("");
    store.removeItem("foo");
    expect(store.getItem("")).toEqual(null);
  });

  it("should update item for key", () => {
    store.setItem("foo", "bar1");
    store.setItem("foo", "bar2");
    expect(store.getItem("foo")).toEqual("bar2");
  });

  it("should contain key value on removed another key", () => {
    store.setItem("foo", "bar");
    store.setItem("bar", "foo");
    store.removeItem("foo");
    expect(store.getItem("foo")).toEqual(null);
    expect(store.getItem("bar")).toEqual("foo");
  });

  it("should not contain key value clear", () => {
    store.setItem("foo", "bar");
    store.setItem("bar", "foo");
    store.clear();
    expect(store.getItem("foo")).toEqual(null);
    expect(store.getItem("bar")).toEqual(null);
  });

  it("should not contain key value clear", () => {
    iGlobal.document.cookie = " = ; path=/";
    store.setItem("foo", "bar");
    store.setItem("bar", "foo");
    store.each((_, key) => {
      expect(["foo", "bar"].includes(key)).toBeTruthy();
    });
    store.clear();
    expect(store.getItem("foo")).toEqual(null);
    expect(store.getItem("bar")).toEqual(null);
  });
});
