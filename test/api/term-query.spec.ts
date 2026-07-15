import { TermQuery } from "../../src/query/term-query";
import { stackInstance } from "../utils/stack-instance";
import { TTerm } from "./types";
import dotenv from 'dotenv';

dotenv.config()
const stack = stackInstance();
const countryUsa = process.env.TAX_COUNTRY_USA || 'usa'

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
});
function makeTerms(taxonomyUid = ""): TermQuery {
  const terms = stack.taxonomy(taxonomyUid).term();

  return terms;
}
