import { Term } from "../../src/taxonomy/term";
import { stackInstance } from "../utils/stack-instance";
import { TTerm, TTerms } from "./types";
import dotenv from 'dotenv';

dotenv.config()
const countryUsa = process.env.TAX_COUNTRY_USA || 'usa'
const locale = process.env.TAX_LOCALE || 'en-us'
const stack = stackInstance();

describe("Terms API test cases", () => {
  it("should get a term by uid", async () => {
    const result = await makeTerms("texas").fetch<TTerm>();
    expect(result).toBeDefined();
    expect(result.taxonomy_uid).toBeDefined();
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });

  it("should get a localized term when a locale is passed to fetch", async () => {
    const result = await makeTerms("texas").fetch<TTerm>(locale);
    expect(result).toBeDefined();
    if (result.publish_details) {
      expect(result.publish_details.locale).toBeDefined();
    }
  });

  it("should get a term with locale fallback when includeFallback is chained", async () => {
    const result = await makeTerms("texas").includeFallback().fetch<TTerm>(locale);
    expect(result).toBeDefined();
  });

  it("should get a localized term when fetch is called with locale", async () => {
    const result = await stack.taxonomy("taxonomy_testing").term("vehicles").fetch<TTerm>("fr-fr");
    expect(result).toBeDefined();
  });

  it("should get locales for a term", async () => {
    const result = await makeTerms("texas").locales<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms[0].name).toBeDefined();
  });

  it("should get ancestors for a term", async () => {
    const result = await makeTerms("houston").ancestors<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms[0].name).toBeDefined();
  });

  it("should get descendants for a term", async () => {
    const result = await makeTerms("texas").descendants<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms[0].name).toBeDefined();
  });
});

function makeTerms(termUid = ""): Term {
  const terms = stack.taxonomy(countryUsa).term(termUid);
  return terms;
}

describe("Terms API test cases - gadgets taxonomy", () => {
  it("should fetch a term from gadgets taxonomy", async () => {
    const result = await stack.taxonomy("gadgets").term("smartphone").fetch<TTerm>();
    expect(result).toBeDefined();
    expect(result.uid).toBe("smartphone");
    expect(result.taxonomy_uid).toBe("gadgets");
  });

  it("should fetch smartphone term from gadgets in fr-fr locale", async () => {
    const result = await stack.taxonomy("gadgets").term("smartphone").fetch<TTerm>("fr-fr");
    expect(result).toBeDefined();
    expect(result.uid).toBe("smartphone");
    expect(result.locale).toBe("fr-fr");
    expect((result as any).name).toBe("Smartphone-fr");
  });

  it("should fetch all locales for a gadgets term", async () => {
    const result = await stack.taxonomy("gadgets").term("smartphone").locales<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms.length).toBeGreaterThan(0);
    const locales = result.terms.map((t: any) => t.locale);
    expect(locales).toContain("en-us");
    expect(locales).toContain("hi-in");
  });

  it("should return empty ancestors for a root-level term in gadgets", async () => {
    const result = await stack.taxonomy("gadgets").term("smartphone").ancestors<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms.length).toBe(0);
  });

  it("should return empty descendants for a leaf term in gadgets", async () => {
    const result = await stack.taxonomy("gadgets").term("smartphone").descendants<TTerms>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms.length).toBe(0);
  });
});
