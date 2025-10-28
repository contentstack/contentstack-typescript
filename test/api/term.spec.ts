import { Term } from "../../src/lib/term";
import { stackInstance } from "../utils/stack-instance";
import { TTerm } from "./types";

const stack = stackInstance();

describe("Terms API test cases", () => {
  it("should get a term by uid", async () => {
    const result = await makeTerms("term1").fetch<TTerm>();
    expect(result).toBeDefined();
    expect(result.taxonomy_uid).toBeDefined();
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });

  it("should get locales for a term", async () => {
    // const result = await makeTerms("term1").locales().fetch();
    // API under building phase, so it should throw error
    expect(async () => await makeTerms("term1").locales().fetch()).rejects.toThrow();
    // TODO: add assertions
  });
});

function makeTerms(termUid = ""): Term {
  const terms = stack.taxonomy("taxonomy_testing").term(termUid);
  return terms;
}
