import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { QueryOperation } from "../../src/common/types";
import { stackInstance } from "../utils/stack-instance";
import { TEntries } from "./types";

const stack = stackInstance();

// Using new standardized env variable names
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'article';

describe("Query Encoding API tests", () => {
  
  it("should handle regular query parameters without encoding", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = { title: "Simple Title" };
    
    const result = await query.find<TEntries>();
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should handle special characters in query parameters with encoding enabled", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = { 
      title: "Title with & special + characters!",
      category: "news+tech"
    };
    
    const result = await query.find<TEntries>(true);
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should handle URL-sensitive characters with encoding", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = { 
      url: "https://example.com?param=value&other=test",
      email: "user@domain.com"
    };
    
    const result = await query.find<TEntries>(true);
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should handle unicode characters with encoding", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = { 
      title: "Café français",
      description: "Testing unicode characters: ñáéíóú"
    };
    
    const result = await query.find<TEntries>(true);
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should handle nested objects with special characters when encoding", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = { 
      title: "Test & Title",
      author: {
        name: "John & Jane Doe",
        bio: "Writer + Developer"
      }
    };
    
    const result = await query.find<TEntries>(true);
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should preserve behavior with mixed data types when encoding", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = { 
      title: "Test & Title",
      count: 5,
      active: true,
      tags: ["tech+news", "development & coding"]
    };
    
    const result = await query.find<TEntries>(true);
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should work with query chaining and encoding", async () => {
    const result = await stack
      .contentType(MEDIUM_CT)
      .entry()
      .query()
      .limit(5)
      .skip(0)
      .find<TEntries>(true);
      
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should handle empty parameters with encoding enabled", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = {};
    
    const result = await query.find<TEntries>(true);
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });

  it("should maintain backward compatibility - encoding disabled by default", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query.where("title", QueryOperation.EQUALS, "Test  Title");
    
    // Default behavior (no encoding)
    const result1 = await query.find<TEntries>();
    expect(result1).toBeDefined();
    
    // Explicitly disabled
    const result2 = await query.find<TEntries>(false);
    expect(result2).toBeDefined();
  });

  it("should handle complex query scenarios with encoding", async () => {
    const query = stack.contentType(MEDIUM_CT).entry().query();
    query._parameters = { 
      $and: [
        { title: { $regex: "test & pattern" } },
        { category: "news+tech" }
      ]
    };
    
    const result = await query.find<TEntries>(true);
    expect(result).toBeDefined();
    expect(result.entries).toBeDefined();
  });
}); 