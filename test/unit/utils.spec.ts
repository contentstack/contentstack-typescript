import { Region } from "../../src/lib/types";
import { getHostforRegion, encodeQueryParams } from "../../src/lib/utils";
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
import { assetQueryFindResponseDataMock } from "../utils/mocks";

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
      const result = getHostforRegion("aws_na", customHost);
      expect(result).toBe(customHost);
    });

    it("should return default host for aws_na region", () => {
      const result = getHostforRegion("aws_na");
      expect(result).toBe(HOST_URL);
    });

    it("should return default host when no region is provided", () => {
      const result = getHostforRegion();
      expect(result).toBe(HOST_URL);
    });

    it("should return correct host for eu region", () => {
      const result = getHostforRegion("eu");
      expect(result).toBe(HOST_EU_REGION);
    });

    it("should return correct host for aws_eu region", () => {
      const result = getHostforRegion("aws_eu");
      expect(result).toBe(HOST_EU_REGION);
    });

    it("should return correct host for aws-eu region", () => {
      const result = getHostforRegion("aws-eu");
      expect(result).toBe(HOST_EU_REGION);
    });

    it("should return correct host for au region", () => {
      const result = getHostforRegion("au");
      expect(result).toBe(HOST_AU_REGION);
    });

    it("should return correct host for aws_au region", () => {
      const result = getHostforRegion("aws_au");
      expect(result).toBe(HOST_AU_REGION);
    });

    it("should return correct host for aws-au region", () => {
      const result = getHostforRegion("aws-au");
      expect(result).toBe(HOST_AU_REGION);
    });

    it("should return correct host for azure-na region", () => {
      const result = getHostforRegion("azure-na");
      expect(result).toBe(HOST_AZURE_NA_REGION);
    });

    it("should return correct host for azure_na region", () => {
      const result = getHostforRegion("azure_na");
      expect(result).toBe(HOST_AZURE_NA_REGION);
    });

    it("should return correct host for gcp-na region", () => {
      const result = getHostforRegion("gcp-na");
      expect(result).toBe(HOST_GCP_NA_REGION);
    });

    it("should return correct host for gcp_na region", () => {
      const result = getHostforRegion("gcp_na");
      expect(result).toBe(HOST_GCP_NA_REGION);
    });

    it("should return correct host for gcp-eu region", () => {
      const result = getHostforRegion("gcp-eu");
      expect(result).toBe(HOST_GCP_EU_REGION);
    });

    it("should return correct host for gcp_eu region", () => {
      const result = getHostforRegion("gcp_eu");
      expect(result).toBe(HOST_GCP_EU_REGION);
    });

    it("should handle case insensitive region names", () => {
      expect(getHostforRegion("AWS_NA")).toBe(HOST_URL);
      expect(getHostforRegion("EU")).toBe(HOST_EU_REGION);
      expect(getHostforRegion("AU")).toBe(HOST_AU_REGION);
      expect(getHostforRegion("AZURE-NA")).toBe(HOST_AZURE_NA_REGION);
      expect(getHostforRegion("GCP-NA")).toBe(HOST_GCP_NA_REGION);
    });

    it("should handle mixed case region names", () => {
      expect(getHostforRegion("Aws_Na")).toBe(HOST_URL);
      expect(getHostforRegion("Eu")).toBe(HOST_EU_REGION);
      expect(getHostforRegion("Au")).toBe(HOST_AU_REGION);
      expect(getHostforRegion("Azure-Na")).toBe(HOST_AZURE_NA_REGION);
      expect(getHostforRegion("Gcp-Na")).toBe(HOST_GCP_NA_REGION);
    });

    it("should throw error for invalid region", () => {
      expect(() => getHostforRegion("invalid_region")).toThrow(
        "Invalid region: invalid_region"
      );
    });

    it("should throw error for empty string region", () => {
      expect(() => getHostforRegion("")).toThrow(
        "Empty region provided. Please put valid region."
      );
    });

    it("should throw error for null region", () => {
      expect(() => getHostforRegion(null as any)).toThrow(
        "Cannot read properties of null (reading 'toLowerCase')"
      );
    });

    it("should return default host when undefined region is explicitly passed", () => {
      // When undefined is passed explicitly, JavaScript uses the default parameter value "aws_na"
      const result = getHostforRegion(undefined as any);
      expect(result).toBe(HOST_URL);
    });

    it("should throw error for non-string region types", () => {
      expect(() => getHostforRegion(123 as any)).toThrow(
        "region.toLowerCase is not a function"
      );
      
      expect(() => getHostforRegion({} as any)).toThrow(
        "region.toLowerCase is not a function"
      );
      
      expect(() => getHostforRegion([] as any)).toThrow(
        "region.toLowerCase is not a function"
      );
    });

    it("should prioritize custom host over region", () => {
      const customHost = "priority.example.com";
      const result = getHostforRegion("invalid_region", customHost);
      expect(result).toBe(customHost);
    });

    it("should handle region aliases correctly", () => {
      // Test all aliases for aws_na
      expect(getHostforRegion("na")).toBe(HOST_URL);
      expect(getHostforRegion("us")).toBe(HOST_URL);
      expect(getHostforRegion("aws-na")).toBe(HOST_URL);
      expect(getHostforRegion("aws_na")).toBe(HOST_URL);
    });

    it("should strip protocol from content delivery endpoint", () => {
      // The function should remove https:// from the endpoint
      const result = getHostforRegion("aws_na");
      expect(result).not.toContain("https://");
      expect(result).not.toContain("http://");
      expect(result).toBe(HOST_URL);
    });

    it("should handle azure-eu region", () => {
      const result = getHostforRegion("azure-eu");
      expect(result).toBe("azure-eu-cdn.contentstack.com");
    });

    it("should handle azure_eu region", () => {
      const result = getHostforRegion("azure_eu");
      expect(result).toBe("azure-eu-cdn.contentstack.com");
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
