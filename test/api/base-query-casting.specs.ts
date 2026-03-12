import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { QueryOperation } from "../../src/common/types";
import { stackInstance } from "../utils/stack-instance";
import { TEntries, TEntry, TAssets } from "./types";

const stack = stackInstance();

function makeQuery(contentType: string, queryObj?: { [key: string]: any }) {
  return stack.contentType(contentType).entry().query(queryObj);
}

function makeAssetQuery() {
  return stack.asset().query();
}

describe("BaseQuery Casting API Tests", () => {
  describe("Query Type Return Enhancement", () => {
    it("should support method chaining with Query type for entries", async () => {
      const result = await stack
        .contentType("blog_post")
        .entry()
        .query()
        .limit(5)
        .skip(0)
        .includeCount()
        .orderByAscending("title")
        .find<TEntries>();
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      if (result.count !== undefined) {
        expect(typeof result.count).toBe("number");
      }
    });

    it("should support method chaining with Query type for assets", async () => {
      const result = await stack
        .asset()
        .query()
        .limit(5)
        .skip(0)
        .includeCount()
        .orderByDescending("created_at")
        .find<TAssets>();
      
      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
    });

    it("should chain multiple BaseQuery methods and maintain Query type", async () => {
      const query = makeQuery("blog_post");
      
      // Chain all BaseQuery methods
      const chainedQuery = query
        .limit(10)
        .skip(5)
        .includeCount()
        .orderByAscending("title")
        .orderByDescending("created_at")
        .param("locale", "en-us")
        .addParams({ include_count: "true" })
        .removeParam("locale");
      
      // Verify the query is still functional
      const result = await chainedQuery.find<TEntries>();
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should support method chaining with where clauses and BaseQuery methods", async () => {
      const result = await makeQuery("blog_post")
        .where("title", QueryOperation.EQUALS, "The future of business with AI")
        .limit(5)
        .skip(0)
        .includeCount()
        .orderByAscending("title")
        .find<TEntry>();
      
      expect(result).toBeDefined();
      if (result.entries && result.entries.length > 0) {
        expect(result.entries[0].title).toBeDefined();
      }
    });

    it("should support method chaining with asset queries", async () => {
      const result = await makeAssetQuery()
        .limit(3)
        .skip(1)
        .includeCount()
        .orderByAscending("filename")
        .find<TAssets>();
      
      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
    });

    it("should handle complex method chaining with multiple query operations", async () => {
      const result = await makeQuery("blog_post")
        .where("_version", QueryOperation.IS_GREATER_THAN, 1)
        .limit(5)
        .skip(0)
        .includeCount()
        .orderByDescending("created_at")
        .param("locale", "en-us")
        .find<TEntries>();
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should support method chaining across different query types", async () => {
      // Test entry query
      const entryResult = await makeQuery("blog_post")
        .limit(2)
        .includeCount()
        .find<TEntries>();
      expect(entryResult).toBeDefined();

      // Test asset query
      const assetResult = await makeAssetQuery()
        .limit(2)
        .includeCount()
        .find<TAssets>();
      expect(assetResult).toBeDefined();
    });
  });

  describe("Encoding Enhancement - API Integration Tests", () => {
    it("should handle special characters in query parameters with encoding", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & Encode",
        description: "URL with ?param=value&other=test"
      };
      
      const result = await query.find<TEntries>(true);
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle unicode characters with encoding in API calls", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Café français",
        description: "Testing unicode: ñáéíóú 中文"
      };
      
      const result = await query.find<TEntries>(true);
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should encode nested objects in real API calls", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        author: {
          name: "John & Jane",
          email: "user@example.com?ref=test"
        }
      };
      
      const result = await query.find<TEntries>(true);
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with method chaining", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & Special Characters"
      };
      
      const result = await query
        .limit(5)
        .skip(0)
        .includeCount()
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with where clauses", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        category: "news & tech"
      };
      
      const result = await query
        .where("title", QueryOperation.EQUALS, "The future of business with AI")
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with asset queries", async () => {
      const query = makeAssetQuery();
      query._parameters = { 
        filename: "test & file.jpg",
        description: "Image with ?special=chars"
      };
      
      const result = await query
        .limit(5)
        .find<TAssets>(true);
      
      expect(result).toBeDefined();
      expect(result.assets).toBeDefined();
    });

    it("should handle mixed encoding scenarios with complex queries", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        $and: [
          { title: { $regex: "test & pattern" } },
          { category: "news+tech" },
          { author: { name: "John & Jane" } }
        ]
      };
      
      const result = await query
        .limit(10)
        .includeCount()
        .orderByAscending("title")
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should maintain backward compatibility - no encoding by default", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Simple Title"
      };
      
      // Default behavior (no encoding)
      const result1 = await query.find<TEntries>();
      expect(result1).toBeDefined();
      expect(result1.entries).toBeDefined();
      
      // Explicitly no encoding
      const result2 = await query.find<TEntries>(false);
      expect(result2).toBeDefined();
      expect(result2.entries).toBeDefined();
    });

    it("should handle encoding with pagination", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & Pagination"
      };
      
      const result = await query
        .limit(5)
        .skip(0)
        .includeCount()
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      if (result.count !== undefined) {
        expect(typeof result.count).toBe("number");
      }
    });

    it("should handle encoding with sorting", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        category: "news & updates"
      };
      
      const result = await query
        .orderByAscending("title")
        .orderByDescending("created_at")
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with param() method", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & Param"
      };
      
      const result = await query
        .param("locale", "en-us")
        .param("include_count", "true")
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with addParams() method", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & AddParams"
      };
      
      const result = await query
        .addParams({ 
          locale: "en-us",
          include_count: "true"
        })
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with deeply nested objects", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        metadata: {
          author: {
            name: "John & Jane",
            contact: {
              email: "user@example.com?ref=test"
            }
          }
        }
      };
      
      const result = await query.find<TEntries>(true);
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with empty parameters", async () => {
      const query = makeQuery("blog_post");
      query._parameters = {};
      
      const result = await query
        .limit(5)
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with array values in parameters", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        tags: ["tech & news", "development + coding"]
      };
      
      const result = await query.find<TEntries>(true);
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with number and boolean values", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        count: 42,
        active: true,
        title: "Test & Title"
      };
      
      const result = await query.find<TEntries>(true);
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });
  });

  describe("Combined Enhancement Tests", () => {
    it("should combine Query type return and encoding in single query", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & Combined"
      };
      
      const result = await query
        .limit(5)
        .skip(0)
        .includeCount()
        .orderByAscending("title")
        .param("locale", "en-us")
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle complex query with both enhancements", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        $and: [
          { title: { $regex: "test & pattern" } },
          { author: { name: "John & Jane", email: "user@example.com" } }
        ]
      };
      
      const result = await query
        .where("_version", QueryOperation.IS_GREATER_THAN, 1)
        .limit(10)
        .skip(0)
        .includeCount()
        .orderByDescending("created_at")
        .addParams({ locale: "en-us" })
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle method chaining with encoding across different content types", async () => {
      // Test with blog_post
      const blogQuery = makeQuery("blog_post");
      blogQuery._parameters = { category: "news & tech" };
      const blogResult = await blogQuery
        .limit(3)
        .includeCount()
        .find<TEntries>(true);
      expect(blogResult).toBeDefined();

      // Test with assets
      const assetQuery = makeAssetQuery();
      assetQuery._parameters = { filename: "test & file.jpg" };
      const assetResult = await assetQuery
        .limit(3)
        .includeCount()
        .find<TAssets>(true);
      expect(assetResult).toBeDefined();
    });

    it("should handle encoding with removeParam() in method chain", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & RemoveParam"
      };
      
      const result = await query
        .param("locale", "en-us")
        .param("include_count", "true")
        .removeParam("include_count")
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it("should handle encoding with multiple addParams() calls", async () => {
      const query = makeQuery("blog_post");
      query._parameters = { 
        title: "Test & MultipleParams"
      };
      
      const result = await query
        .addParams({ locale: "en-us" })
        .addParams({ include_count: "true" })
        .find<TEntries>(true);
      
      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });
  });
});


