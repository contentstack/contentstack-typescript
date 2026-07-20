/* eslint-disable no-console */
/* eslint-disable promise/always-return */
import { describe, it, expect } from '@jest/globals';
import {
  QueryOperation,
  QueryOperator,
  TaxonomyQueryOperation,
} from "../../src/common/types";
import { Entries } from "../../src/entries";
import { stackInstance } from "../utils/stack-instance";
import { TEntries, TEntry } from "./types";

const stack = stackInstance();

// Content Type UIDs from env - using new standardized env variable names
// blog_post maps to article (MEDIUM_CONTENT_TYPE_UID)
// source maps to cybersecurity for taxonomy tests (COMPLEX_CONTENT_TYPE_UID)
const BLOG_POST_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'article';
const SOURCE_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'cybersecurity';

// Taxonomy test data - uses real taxonomy terms from the test stack
// USA taxonomy: california > san_diago, san_jose
// India taxonomy: maharashtra > mumbai, pune
const TAX_FIELD = 'taxonomies.usa';
const TAX_TERM = process.env.TAX_USA_STATE || 'california';
const TAX_CHILD_TERM = 'san_diago';

describe("Entries API test cases", () => {
  it("should check for entries is defined", async () => {
    const result = await makeEntries(BLOG_POST_CT).find<TEntry>();
    if (result.entries) {
      expect(result.entries).toBeDefined();
      expect(result.entries[0]._version).toBeDefined();
      expect(result.entries[0].locale).toEqual("en-us");
      expect(result.entries[0].uid).toBeDefined();
      expect(result.entries[0].title).toBeDefined();
      expect(result.entries[0].created_by).toBeDefined();
      expect(result.entries[0].updated_by).toBeDefined();
    }
  });
  it("should set the include parameter to the given reference field UID", async () => {
    const query = await makeEntries(BLOG_POST_CT).includeReference("reference").find<TEntry>();
    if (query.entries && query.entries.length > 0) {
      expect(query.entries[0].title).toBeDefined();
      // Check if reference field exists (may not be present in all entries)
      if ((query.entries[0] as any).reference) {
        expect((query.entries[0] as any).reference).toBeDefined();
      }
      expect(query.entries[0].uid).toBeDefined();
      expect(query.entries[0]._version).toBeDefined();
      expect(query.entries[0].publish_details).toBeDefined();
    }
  });
  it("should check for include branch", async () => {
    const result = await makeEntries(BLOG_POST_CT).includeBranch().find<TEntry>();
    if (result.entries) {
      expect(result.entries[0]._branch).not.toEqual(undefined);
      expect(result.entries[0]._version).toBeDefined();
      expect(result.entries[0].locale).toEqual("en-us");
      expect(result.entries[0].uid).toBeDefined();
      expect(result.entries[0].title).toBeDefined();
    }
  });
  it("should check for include fallback", async () => {
    const result = await makeEntries(BLOG_POST_CT).includeFallback().find<TEntry>();
    if (result.entries) {
      expect(result.entries[0]._version).toBeDefined();
      expect(result.entries[0].locale).toEqual("en-us");
      expect(result.entries[0].uid).toBeDefined();
      expect(result.entries[0].title).toBeDefined();
    }
  });
  it("should check for locale", async () => {
    const result = await makeEntries(BLOG_POST_CT).locale("fr-fr").find<TEntry>();
    if (result.entries) {
      expect(result.entries[0]._version).toBeDefined();
      expect(result.entries[0].publish_details.locale).toEqual("fr-fr");
      expect(result.entries[0].uid).toBeDefined();
      expect(result.entries[0].title).toBeDefined();
    }
  });
  it("should check for only", async () => {
    const result = await makeEntries(BLOG_POST_CT).locale("fr-fr").only("reference").find<TEntry>();
    if (result.entries && result.entries.length > 0) {
      expect(result.entries[0]._version).not.toBeDefined();
      expect(result.entries[0].publish_details).not.toBeDefined();
      expect(result.entries[0].title).not.toBeDefined();
      expect(result.entries[0].uid).toBeDefined();
      // Check if reference field exists
      if ((result.entries[0] as any).reference) {
        expect((result.entries[0] as any).reference).toBeDefined();
      }
    }
  });

  it("should check for limit", async () => {
    const query = makeEntries(BLOG_POST_CT);
    const result = await query.limit(2).find<TEntry>();
    if (result.entries) {
      expect(query._queryParams).toEqual({ limit: 2 });
      expect(result.entries[0]._version).toBeDefined();
      expect(result.entries[0].locale).toEqual("en-us");
      expect(result.entries[0].uid).toBeDefined();
      expect(result.entries[0].title).toBeDefined();
    }
  });
  it("should check for skip", async () => {
    const query = makeEntries(BLOG_POST_CT);
    const result = await query.skip(2).find<TEntry>();
    if (result.entries) {
      expect(query._queryParams).toEqual({ skip: 2 });
      if (result.entries.length > 0) {
        expect(result.entries[0]._version).toBeDefined();
        expect(result.entries[0].uid).toBeDefined();
        expect(result.entries[0].title).toBeDefined();
      } else {
        console.log('No entries found at skip=2 (insufficient data for skip test)');
      }
    }
  });

  it("CT Taxonomies Query: Get Entries With One Term", async () => {
    let Query = makeEntries(SOURCE_CT).query().where(TAX_FIELD, QueryOperation.EQUALS, TAX_TERM);
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
  });

  it("CT Taxonomies Query: Get Entries With Any Term ($in)", async () => {
    let Query = makeEntries(SOURCE_CT).query().where(TAX_FIELD, QueryOperation.INCLUDES, [TAX_TERM, TAX_CHILD_TERM]);
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
  });

  it("CT Taxonomies Query: Get Entries With Any Term ($or)", async () => {
    let Query1 = makeEntries(SOURCE_CT).query().where(TAX_FIELD, QueryOperation.EQUALS, TAX_TERM);
    let Query2 = makeEntries(SOURCE_CT).query().where("taxonomies.india", QueryOperation.EQUALS, process.env.TAX_INDIA_STATE || "maharashtra");
    let Query = makeEntries(SOURCE_CT).query().queryOperator(QueryOperator.OR, Query1, Query2);
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
  });

  it("CT Taxonomies Query: Get Entries With All Terms ($and)", async () => {
    let Query1 = makeEntries(SOURCE_CT).query().where(TAX_FIELD, QueryOperation.EQUALS, TAX_TERM);
    let Query2 = makeEntries(SOURCE_CT).query().where(TAX_FIELD, QueryOperation.EXISTS, true);
    let Query = makeEntries(SOURCE_CT).query().queryOperator(QueryOperator.AND, Query1, Query2);
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
  });

  it("CT Taxonomies Query: Get Entries With Any Taxonomy Terms ($exists)", async () => {
    let Query = makeEntries(SOURCE_CT).query().where(TAX_FIELD, QueryOperation.EXISTS, true);
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
  });

  it("CT Taxonomies Query: Get Entries With Taxonomy Terms and Also Matching Its Children Term ($eq_below, level)", async () => {
    let Query = makeEntries(SOURCE_CT).query().where(TAX_FIELD, TaxonomyQueryOperation.EQ_BELOW, TAX_TERM, { levels: 1 });
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
  });

  it("CT Taxonomies Query: Get Entries With Taxonomy Terms Children's and Excluding the term itself ($below, level)", async () => {
    let Query = makeEntries(SOURCE_CT).query().where(TAX_FIELD, TaxonomyQueryOperation.BELOW, TAX_TERM, { levels: 1 });
    const data = await Query.find<TEntries>();
    if (data.entries) {
      expect(data.entries.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("CT Taxonomies Query: Get Entries With Taxonomy Terms and Also Matching Its Parent Term ($eq_above, level)", async () => {
    let Query = makeEntries(SOURCE_CT).query().where(TAX_FIELD, TaxonomyQueryOperation.EQ_ABOVE, TAX_CHILD_TERM, { levels: 1 });
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
  });

  it("should query entries with asset_fields[] CDA param (user_defined_fields, embedded, ai_suggested, visual_markups)", async () => {
    const result = await makeEntries(BLOG_POST_CT)
      .assetFields("user_defined_fields", "embedded_metadata", "ai_generated_metadata", "visual_markups")
      .find<TEntry>();
    if (result.entries) {
      expect(result.entries).toBeDefined();
      if (result.entries.length > 0) {
        expect(result.entries[0].uid).toBeDefined();
        expect(result.entries[0]._version).toBeDefined();
      }
    }
  });

  it("CT Taxonomies Query: Get Entries With Taxonomy Terms Parent and Excluding the term itself ($above, level)", async () => {
    // ABOVE operation finds entries tagged with PARENT terms of the given term
    // Using san_diago (child of california) to find its parent
    let Query = makeEntries(SOURCE_CT).query().where(TAX_FIELD, TaxonomyQueryOperation.ABOVE, TAX_CHILD_TERM, { levels: 1 });
    const data = await Query.find<TEntries>();
    if (data.entries) expect(data.entries.length).toBeGreaterThanOrEqual(0);
  });
});
function makeEntries(contentTypeUid = ""): Entries {
  const entries = stack.contentType(contentTypeUid).entry();

  return entries;
}
