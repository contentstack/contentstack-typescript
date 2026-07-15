import { TermQuery } from "../../src/query/term-query";
import { stackInstance } from "../utils/stack-instance";
import { TTerm } from "./types";
import dotenv from 'dotenv';

dotenv.config()
const stack = stackInstance();
const countryUsa = process.env.TAX_COUNTRY_USA || 'usa'
const locale = process.env.TAX_LOCALE || 'en-us'

describe("Terms API test cases", () => {
  it("should check for terms is defined", async () => {
    const result = await makeTerms(countryUsa).find<TTerm>();
    if (result.terms) {
      expect(result.terms).toBeDefined();
      expect(result.terms[0].taxonomy_uid).toBeDefined();
      expect(result.terms[0].uid).toBeDefined();
      expect(result.terms[0].created_by).toBeDefined();
      expect(result.terms[0].updated_by).toBeDefined();
    }
  });

  it("should return terms for the requested locale when locale() is chained", async () => {
    const result = await makeTerms(countryUsa).locale(locale).find<TTerm>();
    if (result.terms && result.terms.length) {
      expect(result.terms).toBeDefined();
      result.terms.forEach((term) => {
        if (term.publish_details) {
          expect(term.publish_details.locale).toEqual(locale);
        }
      });
    }
  });

  it("should return terms with locale fallback when includeFallback() is chained", async () => {
    const result = await makeTerms(countryUsa).locale(locale).includeFallback().find<TTerm>();
    if (result.terms) {
      expect(result.terms).toBeDefined();
    }
  });
});
function makeTerms(taxonomyUid = ""): TermQuery {
  const terms = stack.taxonomy(taxonomyUid).term();

  return terms;
}
