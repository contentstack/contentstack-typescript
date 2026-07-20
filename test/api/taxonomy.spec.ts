/* eslint-disable no-console */
/* eslint-disable promise/always-return */
import { stackInstance } from '../utils/stack-instance';
import { TTaxonomies, TTaxonomy } from './types';
import dotenv from 'dotenv';
import { TaxonomyQuery } from '../../src/query/taxonomy-query';
import { Taxonomy } from '../../src/taxonomy';

dotenv.config()
const countryUsa = process.env.TAX_COUNTRY_USA || 'usa'
const locale = process.env.TAX_LOCALE || 'en-us'
const stack = stackInstance();
describe('Taxonomy API test cases', () => {
  it('should give taxonomies when taxonomies method is called', async () => {
    const result = await makeTaxonomies().find<TTaxonomies>();
    expect(result).toBeDefined();
  });

  it('should give a single taxonomy when taxonomy method is called with taxonomyUid', async () => {
    const result = await makeTaxonomy(countryUsa).fetch<TTaxonomy>();
    expect(result).toBeDefined();
  });

  it('should give a localized taxonomy when locale is set via param()', async () => {
    const result = await makeTaxonomy(countryUsa).param('locale', locale).fetch<TTaxonomy>();
    expect(result).toBeDefined();
    if (result.publish_details) {
      expect(result.publish_details.locale).toBeDefined();
    }
  });

  it('should give a taxonomy with locale fallback when includeFallback is chained', async () => {
    const result = await makeTaxonomy(countryUsa).param('locale', locale).includeFallback().fetch<TTaxonomy>();
    expect(result).toBeDefined();
  });

  it('should give a localized taxonomy when locale is set via param()', async () => {
    const result = await makeTaxonomy('gadgets').param('locale', 'fr-fr').fetch<TTaxonomy>();
    expect(result).toBeDefined();
  });
});

describe('Taxonomy API test cases - gadgets', () => {
  it('should fetch gadgets taxonomy in en-us (master locale)', async () => {
    const result = await makeTaxonomy('gadgets').fetch<TTaxonomy>();
    expect(result).toBeDefined();
    expect(result.uid).toBe('gadgets');
  });

  it('should fetch gadgets taxonomy in fr-fr locale via param()', async () => {
    const result = await makeTaxonomy('gadgets').param('locale', 'fr-fr').fetch<TTaxonomy>();
    expect(result).toBeDefined();
    expect(result.uid).toBe('gadgets');
    expect(result.locale).toBe('fr-fr');
  });

  it('should return gadgets in the taxonomies list', async () => {
    const result = await makeTaxonomies().find<TTaxonomies>();
    expect(result).toBeDefined();
    expect(result.taxonomies).toBeDefined();
    const gadgets = result.taxonomies!.find((t: any) => t.uid === 'gadgets');
    expect(gadgets).toBeDefined();
  });
});

function makeTaxonomies(): TaxonomyQuery {
  const taxonomies = stack.taxonomy();

  return taxonomies;
}

function makeTaxonomy(taxonomyUid: string): Taxonomy {
    const taxonomy = stack.taxonomy(taxonomyUid);
    return taxonomy;
}