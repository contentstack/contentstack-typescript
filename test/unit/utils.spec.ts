import { getHostforRegion, encodeQueryParams } from "../../src/lib/utils";
import { Region } from "../../src/lib/types";
import {
  DUMMY_URL,
  HOST_EU_REGION,
  HOST_AU_REGION,
  HOST_GCP_NA_REGION,
  HOST_URL,
  MOCK_CLIENT_OPTIONS,
  HOST_GCP_EU_REGION,
  HOST_AZURE_NA_REGION,
} from "../utils/constant";
import { httpClient, AxiosInstance } from "@contentstack/core";
import MockAdapter from "axios-mock-adapter";

let client: AxiosInstance;
let mockClient: MockAdapter;

beforeAll(() => {
  client = httpClient(MOCK_CLIENT_OPTIONS);
  mockClient = new MockAdapter(client as any);
});

describe("Utils functions", () => {
  describe("getHostforRegion function", () => {
    it("should return custom host when provided", () => {
      const customHost = "custom.example.com";
      const result = getHostforRegion(Region.EU, customHost);
      expect(result).toBe(customHost);
    });

    it("should return default host when no region is provided", () => {
      const result = getHostforRegion();
      expect(result).toBe(HOST_URL);
    });

    it("should return correct host for each region using Region enum", () => {
      // Test using Region enum values
      expect(getHostforRegion(Region.EU)).toBe(HOST_EU_REGION);
      expect(getHostforRegion(Region.AU)).toBe(HOST_AU_REGION);
      expect(getHostforRegion(Region.AZURE_NA)).toBe(HOST_AZURE_NA_REGION);
      expect(getHostforRegion(Region.AZURE_EU)).toBe("azure-eu-cdn.contentstack.com");
      expect(getHostforRegion(Region.GCP_NA)).toBe(HOST_GCP_NA_REGION);
      expect(getHostforRegion(Region.GCP_EU)).toBe(HOST_GCP_EU_REGION);
    });

    it("should return default host for US region", () => {
      expect(getHostforRegion(Region.US)).toBe(HOST_URL);
    });

    it("should prioritize custom host over region", () => {
      const customHost = "priority.example.com";
      const result = getHostforRegion(Region.EU, customHost);
      expect(result).toBe(customHost);
    });
  });

  describe("encodeQueryParams function", () => {
    it("should encode special characters in strings", () => {
      const testParams = {
        simple: "hello world",
        special: "test & encode + me!",
        symbols: "hello@world.com?param=value",
        unicode: "café français",
      };

      const result = encodeQueryParams(testParams);

      expect(result).toEqual({
        simple: "hello%20world",
        special: "test%20%26%20encode%20%2B%20me!",
        symbols: "hello%40world.com%3Fparam%3Dvalue",
        unicode: "caf%C3%A9%20fran%C3%A7ais",
      });
    });

    it("should handle nested objects recursively", () => {
      const testParams = {
        title: "test & title",
        nested: {
          name: "John & Jane",
          deeply: {
            nested: "value + with & symbols",
          },
        },
      };

      const result = encodeQueryParams(testParams);

      expect(result).toEqual({
        title: "test%20%26%20title",
        nested: {
          name: "John%20%26%20Jane",
          deeply: {
            nested: "value%20%2B%20with%20%26%20symbols",
          },
        },
      });
    });

    it("should preserve non-string primitive values", () => {
      const testParams = {
        stringValue: "encode me",
        numberValue: 42,
        booleanTrue: true,
        booleanFalse: false,
        nullValue: null,
        undefinedValue: undefined,
      };

      const result = encodeQueryParams(testParams);

      expect(result).toEqual({
        stringValue: "encode%20me",
        numberValue: 42,
        booleanTrue: true,
        booleanFalse: false,
        nullValue: null,
        undefinedValue: undefined,
      });
    });

    it("should handle arrays correctly", () => {
      const testParams = {
        tags: ["tech & innovation", "development + coding"],
        categories: ["news", "tech"],
      };

      const result = encodeQueryParams(testParams);

      // Arrays are treated as objects and processed recursively
      expect(result.tags).toBeDefined();
      expect(result.categories).toBeDefined();
    });

    it("should handle empty objects and special values", () => {
      const testParams = {
        empty: {},
        nullValue: null,
        emptyString: "",
        whitespace: "   ",
      };

      const result = encodeQueryParams(testParams);

      expect(result).toEqual({
        empty: {},
        nullValue: null,
        emptyString: "",
        whitespace: "%20%20%20",
      });
    });
  });
});
