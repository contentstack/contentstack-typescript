/* eslint-disable no-console */
/* eslint-disable promise/always-return */
import { QueryOperation } from "../../src/lib/types";
import { AssetQuery } from "../../src/lib/asset-query";
import { stackInstance } from "../utils/stack-instance";
import { TAsset } from "./types";

const stack = stackInstance();

describe("AssetQuery API tests", () => {
  it("should check for assets is defined", async () => {
    const result = await makeAssetQuery().find<TAsset>();
    if (result.assets) {
      expect(result.assets).toBeDefined();
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for include dimensions", async () => {
    const result = await makeAssetQuery().includeDimension().find<TAsset>();
    if (result.assets) {
      expect(result.assets[0].dimension).toBeDefined();
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for include fallback", async () => {
    const result = await makeAssetQuery().includeFallback().find<TAsset>();
    if (result.assets) {
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for relative urls", async () => {
    const result = await makeAssetQuery().relativeUrls().find<TAsset>();
    if (result.assets) {
      expect(result.assets[0].url).not.toEqual(undefined);
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for include branch", async () => {
    const result = await makeAssetQuery().includeBranch().find<TAsset>();
    if (result.assets) {
      expect(result.assets[0]._branch).not.toEqual(undefined);
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for include metadata", async () => {
    const result = await makeAssetQuery().includeMetadata().find<TAsset>();
    if (result.assets) {
      expect(result.assets[0]._metadata).not.toEqual(undefined);
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for version", async () => {
    const result = await makeAssetQuery().version(1).find<TAsset>();
    if (result.assets) {
      expect(result.assets[0]._version).toEqual(1);
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for locale", async () => {
    const result = await makeAssetQuery().locale("en-us").find<TAsset>();
    if (result.assets) {
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for limit", async () => {
    const query = makeAssetQuery();
    const result = await query.limit(2).find<TAsset>();
    if (result.assets) {
      expect(query._queryParams).toEqual({ limit: 2 });
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check for skip", async () => {
    const query = makeAssetQuery();
    const result = await query.skip(2).find<TAsset>();
    if (result.assets) {
      expect(query._queryParams).toEqual({ skip: 2 });
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
  it("should check assets for which title matches", async () => {
    const result = await makeAssetQuery().query().where("title", QueryOperation.EQUALS, "AlbertEinstein.jpeg").find<TAsset>();
    if (result.assets) {
      expect(result.assets[0]._version).toBeDefined();
      expect(result.assets[0].uid).toBeDefined();
      expect(result.assets[0].content_type).toBeDefined();
      expect(result.assets[0].created_by).toBeDefined();
      expect(result.assets[0].updated_by).toBeDefined();
    }
  });
});
function makeAssetQuery(): AssetQuery {
  const asset = stack.asset();

  return asset;
}
