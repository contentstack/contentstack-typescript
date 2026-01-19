import { Term } from "../../src/lib/term";
import { stackInstance } from "../utils/stack-instance";
import { TTerm, TTerms } from "./types";

const stack = stackInstance();

describe("Terms API test cases", () => {
  it("should get a term by uid", async () => {
    const result = await makeTerms("vehicles").fetch<TTerm>();
    expect(result).toBeDefined();
    expect(result.taxonomy_uid).toBeDefined();
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });

  it("should get locales for a term", async () => {
    const result = await makeTerms("vehicles").locales<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms[0].name).toBeDefined();
  });

  it("should get ancestors for a term", async () => {
    const result = await makeTerms("sleeper").ancestors<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms[0].name).toBeDefined();
  });

  it("should get descendants for a term", async () => {
    const result = await makeTerms("vrl").descendants<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms[0].name).toBeDefined();
  });
});

function makeTerms(termUid = ""): Term {
  const terms = stack.taxonomy("taxonomy_testing").term(termUid);
  return terms;
}
