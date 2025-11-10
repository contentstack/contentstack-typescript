import { QueryOperation, QueryOperator } from "../../src/lib/types";
import { stackInstance } from "../utils/stack-instance";
import { TEntries, TEntry } from "./types";

const stack = stackInstance();
// Entry UIDs - using new standardized env variable names
const entryUid: string = process.env.MEDIUM_ENTRY_UID || process.env.COMPLEX_ENTRY_UID || '';
const entryAuthorUid: string = process.env.SIMPLE_ENTRY_UID || '';

// Content Type UIDs - using new standardized env variable names
const BLOG_POST_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'article';
const AUTHOR_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'author';

describe("Query API tests", () => {
  it("should add a where filter to the query parameters for equals", async () => {
    // First, get any entry to get a valid title
    const allEntries = await makeQuery(BLOG_POST_CT).find<TEntry>();
    if (!allEntries.entries || allEntries.entries.length === 0) {
      console.log('No entries found - skipping test');
      return;
    }
    
    const testTitle = allEntries.entries[0].title;
    const query = await makeQuery(BLOG_POST_CT).where("title", QueryOperation.EQUALS, testTitle).find<TEntry>();
    
    expect(query.entries).toBeDefined();
    expect(query.entries!.length).toBeGreaterThan(0);
    expect(query.entries![0].title).toBe(testTitle);
  });
  it("should add a where filter to the query parameters for less than", async () => {
    const query = await makeQuery(BLOG_POST_CT).where("_version", QueryOperation.IS_LESS_THAN, 100).find<TEntry>();
    
    expect(query.entries).toBeDefined();
    if (query.entries && query.entries.length > 0) {
      expect(query.entries[0].title).toBeDefined();
      expect(query.entries[0]._version).toBeLessThan(100);
    }
  });
  it("should add a where filter to the query parameters when object is passed to query method", async () => {
    const query = await makeQuery(BLOG_POST_CT, { _version: { $lt: 100 }, }).find<TEntry>();
    
    expect(query.entries).toBeDefined();
    if (query.entries && query.entries.length > 0) {
      expect(query.entries[0].title).toBeDefined();
      expect(query.entries[0]._version).toBeLessThan(100);
    }
  });
  it("should add a where-in filter to the query parameters", async () => {
    if (!entryAuthorUid) {
      console.log('No author UID configured - skipping test');
      return;
    }
    
    // The field name is 'reference' not 'author' based on the article content type
    const query = await makeQuery(BLOG_POST_CT)
      .whereIn("reference", makeQuery(AUTHOR_CT).where("uid", QueryOperation.EQUALS, entryAuthorUid))
      .find<TEntry>();
    
    expect(query.entries).toBeDefined();
    if (query.entries && query.entries.length > 0) {
      expect(query.entries[0].title).toBeDefined();
      expect(query.entries[0]._version).toBeDefined();
      expect(query.entries[0].publish_details).toBeDefined();
      
      // Check if reference field exists and has the correct UID
      if ((query.entries[0] as any).reference) {
        const reference = (query.entries[0] as any).reference;
        const refArray = Array.isArray(reference) ? reference : [reference];
        expect(refArray[0].uid).toEqual(entryAuthorUid);
      }
    }
  });
  it("should add a whereNotIn filter to the query parameters", async () => {
    if (!entryUid) {
      console.log('No entry UID configured - skipping test');
      return;
    }
    
    // The field name is 'reference' not 'author'
    const query = await makeQuery(BLOG_POST_CT)
      .whereNotIn("reference", makeQuery(AUTHOR_CT).where("uid", QueryOperation.EQUALS, entryUid))
      .find<TEntry>();
    
    expect(query.entries).toBeDefined();
    if (query.entries && query.entries.length > 0) {
      expect(query.entries[0].title).toBeDefined();
      expect(query.entries[0]._version).toBeDefined();
      expect(query.entries[0].publish_details).toBeDefined();
      
      // Check if reference field exists
      if ((query.entries[0] as any).reference) {
        const reference = (query.entries[0] as any).reference;
        const refArray = Array.isArray(reference) ? reference : [reference];
        expect(refArray[0].uid).toBeDefined();
        // Should not equal the excluded UID
        expect(refArray[0].uid).not.toEqual(entryUid);
      }
    }
  });
  it("should add a query operator to the query parameters", async () => {
    // First, get any entry to get a valid title
    const allEntries = await makeQuery(BLOG_POST_CT).find<TEntry>();
    if (!allEntries.entries || allEntries.entries.length === 0) {
      console.log('No entries found - skipping test');
      return;
    }
    
    const testTitle = allEntries.entries[0].title;
    const testLocale = allEntries.entries[0].locale || "en-us";
    
    const query1 = makeQuery(BLOG_POST_CT).where("locale", QueryOperation.EQUALS, testLocale);
    const query2 = makeQuery(BLOG_POST_CT).where("title", QueryOperation.EQUALS, testTitle);
    const query = await makeQuery(BLOG_POST_CT).queryOperator(QueryOperator.AND, query1, query2).find<TEntry>();
    
    expect(query.entries).toBeDefined();
    if (query.entries && query.entries.length > 0) {
      expect(query.entries[0].locale).toEqual(testLocale);
      expect(query.entries[0].title).toEqual(testTitle);
      expect(query.entries[0]._version).toBeDefined();
      expect(query.entries[0].publish_details).toBeDefined();
    }
  });
});
function makeQuery(ctUid: string, queryObj?: { [key: string]: any }) {
  const entryInstance = stack.contentType(ctUid).entry();

  if (queryObj) return entryInstance.query(queryObj);
  return entryInstance.query();
}
