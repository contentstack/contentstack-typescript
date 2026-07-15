import { TermQuery } from "../../src/query/term-query";
import { stackInstance } from "../utils/stack-instance";
import { TTerm } from "./types";
import dotenv from 'dotenv';

dotenv.config()
const stack = stackInstance();
const countryUsa = process.env.TAX_COUNTRY_USA || 'usa'
const locale = process.env.TAX_LOCALE || 'en-us'

describe("Terms Query API test cases", () => {
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

  it("should return terms for given locale when locale() is chained", async () => {
    const result = await makeTerms("taxonomy_testing").locale("hi-in").find<TTerm>();
    expect(result).toBeDefined();
  });

  it("should return terms with fallback when includeFallback() is chained", async () => {
    const result = await makeTerms("taxonomy_testing").includeFallback().find<TTerm>();
    expect(result).toBeDefined();
  });

  it("should return localized terms with fallback when locale() and includeFallback() are chained", async () => {
    const result = await makeTerms("taxonomy_testing").locale("hi-in").includeFallback().find<TTerm>();
    expect(result).toBeDefined();
  });
});

function makeTerms(taxonomyUid = ""): TermQuery {
  const terms = stack.taxonomy(taxonomyUid).term();
  return terms;
}

describe("Term Query API test cases - gadgets taxonomy", () => {
  // Case 1: locale=en-us, include_fallback=false
  // Returns 5 terms: tablet, laptop, smartwatch, smartphone, headphone — all en-us
  it("should return all 5 en-us terms when locale is en-us and includeFallback is not set", async () => {
    const result = await stack.taxonomy("gadgets").term().locale("en-us").find<TTerm>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms.length).toBe(5);
    const byUid = Object.fromEntries(result.terms.map((t: any) => [t.uid, t]));
    expect(byUid["tablet"].name).toBe("Tablet");
    expect(byUid["laptop"].name).toBe("Laptop");
    expect(byUid["smartwatch"].name).toBe("Smartwatch");
    expect(byUid["smartphone"].name).toBe("Smartphone");
    expect(byUid["headphone"].name).toBe("Headphone");
    result.terms.forEach((t: any) => expect(t.locale).toBe("en-us"));
  });

  // Case 2: locale=en-us, include_fallback=true
  // Returns same 5 terms — all en-us (no change since en-us is master)
  it("should return all 5 en-us terms when locale is en-us and includeFallback is true", async () => {
    const result = await stack.taxonomy("gadgets").term().locale("en-us").includeFallback().find<TTerm>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms.length).toBe(5);
    const byUid = Object.fromEntries(result.terms.map((t: any) => [t.uid, t]));
    expect(byUid["tablet"].name).toBe("Tablet");
    expect(byUid["laptop"].name).toBe("Laptop");
    expect(byUid["smartwatch"].name).toBe("Smartwatch");
    expect(byUid["smartphone"].name).toBe("Smartphone");
    expect(byUid["headphone"].name).toBe("Headphone");
    result.terms.forEach((t: any) => expect(t.locale).toBe("en-us"));
  });

  // Case 3: locale=fr-fr, include_fallback=false
  // Returns 3 fr-fr terms only — tablet and laptop have no fr-fr translation so they are excluded
  it("should return only 3 fr-fr localized terms when locale is fr-fr and includeFallback is false", async () => {
    const result = await stack.taxonomy("gadgets").term().locale("fr-fr").find<TTerm>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms.length).toBe(3);
    const byUid = Object.fromEntries(result.terms.map((t: any) => [t.uid, t]));
    expect(byUid["headphone"].name).toBe("Headphone-fr");
    expect(byUid["smartphone"].name).toBe("Smartphone-fr");
    expect(byUid["smartwatch"].name).toBe("Smartwatch-fr");
    expect(byUid["tablet"]).toBeUndefined();
    expect(byUid["laptop"]).toBeUndefined();
    result.terms.forEach((t: any) => expect(t.locale).toBe("fr-fr"));
  });

  // Case 4: locale=fr-fr, include_fallback=true
  // Returns 5 terms: 3 in fr-fr + 2 fallback to en-us (tablet, laptop)
  it("should return 5 terms with fr-fr terms and en-us fallback when locale is fr-fr and includeFallback is true", async () => {
    const result = await stack.taxonomy("gadgets").term().locale("fr-fr").includeFallback().find<TTerm>();
    expect(result).toBeDefined();
    expect(result.terms).toBeDefined();
    expect(result.terms.length).toBe(5);
    const byUid = Object.fromEntries(result.terms.map((t: any) => [t.uid, t]));
    expect(byUid["headphone"].name).toBe("Headphone-fr");
    expect(byUid["headphone"].locale).toBe("fr-fr");
    expect(byUid["smartphone"].name).toBe("Smartphone-fr");
    expect(byUid["smartphone"].locale).toBe("fr-fr");
    expect(byUid["smartwatch"].name).toBe("Smartwatch-fr");
    expect(byUid["smartwatch"].locale).toBe("fr-fr");
    expect(byUid["tablet"].name).toBe("Tablet");
    expect(byUid["tablet"].locale).toBe("en-us");
    expect(byUid["laptop"].name).toBe("Laptop");
    expect(byUid["laptop"].locale).toBe("en-us");
  });
});
