import { Region } from "../../src/lib/types";
import { getHost } from "../../src/lib/utils";
import {
  DUMMY_URL,
  HOST_EU_REGION,
  HOST_AU_REGION,
  HOST_GCP_NA_REGION,
  HOST_URL,
  MOCK_CLIENT_OPTIONS,
  HOST_GCP_EU_REGION,
} from "../utils/constant";
import { httpClient, AxiosInstance } from "@contentstack/core";
import MockAdapter from "axios-mock-adapter";
import { assetQueryFindResponseDataMock } from "../utils/mocks";
import { encodeQueryParams } from "../../src/lib/utils";

let client: AxiosInstance;
let mockClient: MockAdapter;

beforeAll(() => {
  client = httpClient(MOCK_CLIENT_OPTIONS);
  mockClient = new MockAdapter(client as any);
});

describe("Utils", () => {
  it("should return EU host when region or host is passed", () => {
    const url = getHost(Region.EU);
    expect(url).toEqual(HOST_EU_REGION);
  });
  it("should return AU host when region or host is passed", () => {
    const url = getHost(Region.AU);
    expect(url).toEqual(HOST_AU_REGION);
  });
  it("should return GCP NA host when region or host is passed", () => {
    const url = getHost(Region.GCP_NA);
    expect(url).toEqual(HOST_GCP_NA_REGION);
  });
  it("should return GCP EU host when region or host is passed", () => {
    const url = getHost(Region.GCP_EU);
    expect(url).toEqual(HOST_GCP_EU_REGION);
  });
  it("should return proper US region when nothing is passed", () => {
    const url = getHost();
    expect(url).toEqual(HOST_URL);
  });

  it("should return the host url if host is passed instead of region", () => {
    const host = DUMMY_URL;
    const url = getHost(Region.US, host);
    expect(url).toEqual(DUMMY_URL);
  });
});

describe("Utils functions", () => {
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
