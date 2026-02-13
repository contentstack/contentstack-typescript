import { getHostforRegion, encodeQueryParams } from "../../src/common/utils";
import { Region } from "../../src/common/types";
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
import * as Utils from "@contentstack/utils";

// Mock getContentstackEndpoint from @contentstack/utils
jest.mock("@contentstack/utils", () => ({
  getContentstackEndpoint: jest.fn(),
}));

const mockGetContentstackEndpoint = Utils.getContentstackEndpoint as jest.MockedFunction<
  typeof Utils.getContentstackEndpoint
>;

let client: AxiosInstance;
let mockClient: MockAdapter;

beforeAll(() => {
  client = httpClient(MOCK_CLIENT_OPTIONS);
  mockClient = new MockAdapter(client as any);
});

describe("Utils functions", () => {
  describe("getHostforRegion function", () => {
    beforeEach(() => {
      // Reset mock before each test
      mockGetContentstackEndpoint.mockReset();
    });

    it("should return custom host when provided and not call getContentstackEndpoint", () => {
      const customHost = "custom.example.com";
      const result = getHostforRegion(Region.EU, customHost);
      
      expect(result).toBe(customHost);
      expect(mockGetContentstackEndpoint).not.toHaveBeenCalled();
    });

    it("should call getContentstackEndpoint with correct parameters when no host is provided", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_URL);
      
      const result = getHostforRegion(Region.US);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.US,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_URL);
    });


    it("should return correct host for EU region using getContentstackEndpoint", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_EU_REGION);
      
      const result = getHostforRegion(Region.EU);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.EU,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_EU_REGION);
    });

    it("should return correct host for AU region using getContentstackEndpoint", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_AU_REGION);
      
      const result = getHostforRegion(Region.AU);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.AU,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_AU_REGION);
    });

    it("should return correct host for AZURE_NA region using getContentstackEndpoint", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_AZURE_NA_REGION);
      
      const result = getHostforRegion(Region.AZURE_NA);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.AZURE_NA,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_AZURE_NA_REGION);
    });

    it("should return correct host for AZURE_EU region using getContentstackEndpoint", () => {
      const azureEuHost = "azure-eu-cdn.contentstack.com";
      mockGetContentstackEndpoint.mockReturnValue(azureEuHost);
      
      const result = getHostforRegion(Region.AZURE_EU);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.AZURE_EU,
        "contentDelivery",
        true
      );
      expect(result).toBe(azureEuHost);
    });

    it("should return correct host for GCP_NA region using getContentstackEndpoint", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_GCP_NA_REGION);
      
      const result = getHostforRegion(Region.GCP_NA);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.GCP_NA,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_GCP_NA_REGION);
    });

    it("should return correct host for GCP_EU region using getContentstackEndpoint", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_GCP_EU_REGION);
      
      const result = getHostforRegion(Region.GCP_EU);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.GCP_EU,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_GCP_EU_REGION);
    });

    it("should return correct host for US region using getContentstackEndpoint", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_URL);
      
      const result = getHostforRegion(Region.US);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.US,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_URL);
    });

    it("should prioritize custom host over region and not call getContentstackEndpoint", () => {
      const customHost = "priority.example.com";
      
      const result = getHostforRegion(Region.EU, customHost);
      
      expect(result).toBe(customHost);
      expect(mockGetContentstackEndpoint).not.toHaveBeenCalled();
    });

    it("should handle string region values and call getContentstackEndpoint", () => {
      const stringRegion = "eu";
      mockGetContentstackEndpoint.mockReturnValue(HOST_EU_REGION);
      
      const result = getHostforRegion(stringRegion);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        stringRegion,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_EU_REGION);
    });

    it("should handle empty string host and call getContentstackEndpoint", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_URL);
      
      const result = getHostforRegion(Region.US, "");
      
      // Empty string is falsy, so it should call getContentstackEndpoint
      expect(mockGetContentstackEndpoint).toHaveBeenCalledWith(
        Region.US,
        "contentDelivery",
        true
      );
      expect(result).toBe(HOST_URL);
    });

    it("should always pass 'contentDelivery' as service parameter", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_URL);
      
      getHostforRegion(Region.US);
      getHostforRegion(Region.EU);
      getHostforRegion(Region.AU);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledTimes(3);
      mockGetContentstackEndpoint.mock.calls.forEach((call) => {
        expect(call[1]).toBe("contentDelivery");
      });
    });

    it("should always pass true as omitHttps parameter", () => {
      mockGetContentstackEndpoint.mockReturnValue(HOST_URL);
      
      getHostforRegion(Region.US);
      getHostforRegion(Region.EU);
      
      expect(mockGetContentstackEndpoint).toHaveBeenCalledTimes(2);
      mockGetContentstackEndpoint.mock.calls.forEach((call) => {
        expect(call[2]).toBe(true);
      });
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
