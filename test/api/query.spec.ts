import { QueryOperation, QueryOperator } from "../../src/lib/types";
import { stackInstance } from "../utils/stack-instance";
import { TEntries, TEntry } from "./types";

const stack = stackInstance();
const entryUid: string = process.env.ENTRY_UID || '';
const entryAuthorUid: string = process.env.ENTRY_AUTHOR_UID || '';
describe("Query API tests", () => {
  it("should add a where filter to the query parameters for equals", async () => {
    const query = await makeQuery("blog_post").where("title", QueryOperation.EQUALS, "The future of business with AI").find<TEntry>();
    if (query.entries)
      expect(query.entries[0].title).toEqual("The future of business with AI");
  });
  it("should add a where filter to the query parameters for less than", async () => {
    const query = await makeQuery("blog_post").where("_version", QueryOperation.IS_LESS_THAN, 3).find<TEntry>();
    if (query.entries)
      expect(query.entries[0].title).toBeDefined();
  });
  it("should add a where filter to the query parameters when object is passed to query method", async () => {
    const query = await makeQuery("blog_post", { _version: { $lt: 3 }, }).find<TEntry>();
    if (query.entries)
      expect(query.entries[0].title).toBeDefined();
  });
  it("should add a where-in filter to the query parameters", async () => {
    const query = await makeQuery("blog_post").whereIn("author",makeQuery("author").where("uid", QueryOperation.EQUALS, entryAuthorUid)).find<TEntry>();
    if (query.entries) {
      expect(query.entries[0].author[0].uid).toEqual(entryAuthorUid);
      expect(query.entries[0].title).toBeDefined();
      expect(query.entries[0]._version).toBeDefined();
      expect(query.entries[0].publish_details).toBeDefined();
    }
  });
  it("should add a whereNotIn filter to the query parameters", async () => {
    const query = await makeQuery("blog_post").whereNotIn( "author", makeQuery("author").where("uid", QueryOperation.EQUALS, entryUid)).find<TEntry>();
      if (query.entries) {
        expect(query.entries[0].author[0].uid).toBeDefined();
        expect(query.entries[0].title).toBeDefined();
        expect(query.entries[0]._version).toBeDefined();
        expect(query.entries[0].publish_details).toBeDefined();
      }
  });
  it("should add a query operator to the query parameters", async () => {
    const query1 = makeQuery("blog_post").where( "locale", QueryOperation.EQUALS, "en-us");
    const query2 = makeQuery("blog_post").where( "title", QueryOperation.EQUALS, "The future of business with AI");
    const query = await makeQuery("blog_post").queryOperator(QueryOperator.AND, query1, query2).find<TEntry>();
    if (query.entries) {
      expect(query.entries[0].locale).toEqual("en-us");
      expect(query.entries[0].author[0].uid).toEqual(entryAuthorUid);
      expect(query.entries[0].title).toBeDefined();
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
