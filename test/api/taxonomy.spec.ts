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
describe('ContentType API test cases', () => {
  it('should give taxonomies when taxonomies method is called', async () => {
    const result = await makeTaxonomies().find<TTaxonomies>();
    expect(result).toBeDefined();
  });

  it('should give a single taxonomy when taxonomy method is called with taxonomyUid', async () => {
    const result = await makeTaxonomy(countryUsa).fetch<TTaxonomy>();
    expect(result).toBeDefined();
  });

  it('should give a localized taxonomy when a locale is passed to fetch', async () => {
    const result = await makeTaxonomy(countryUsa).fetch<TTaxonomy>(locale);
    expect(result).toBeDefined();
    if (result.publish_details) {
      expect(result.publish_details.locale).toBeDefined();
    }
  });

  it('should give a taxonomy with locale fallback when includeFallback is chained', async () => {
    const result = await makeTaxonomy(countryUsa).includeFallback().fetch<TTaxonomy>(locale);
    expect(result).toBeDefined();
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