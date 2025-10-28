/* eslint-disable no-console */
/* eslint-disable promise/always-return */
import { stackInstance } from '../utils/stack-instance';
import { TTaxonomies, TTaxonomy } from './types';
import dotenv from 'dotenv';
import { TaxonomyQuery } from '../../src/lib/taxonomy-query';
import { Taxonomy } from '../../src/lib/taxonomy';

dotenv.config()

const stack = stackInstance();
describe('ContentType API test cases', () => {
  it('should give taxonomies when taxonomies method is called', async () => {
    const result = await makeTaxonomies().find<TTaxonomies>();
    expect(result).toBeDefined();
  });

  it('should give a single taxonomy when taxonomy method is called with taxonomyUid', async () => {
    const result = await makeTaxonomy('taxonomy_testing_3').fetch<TTaxonomy>();
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