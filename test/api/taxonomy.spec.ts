/* eslint-disable no-console */
/* eslint-disable promise/always-return */
import { stackInstance } from '../utils/stack-instance';
import { TTaxonomies } from './types';
import dotenv from 'dotenv';
import { TaxonomyQuery } from '../../src/lib/taxonomy-query';

dotenv.config()

const stack = stackInstance();
describe('ContentType API test cases', () => {
  it('should give taxonomies when taxonomies method is called', async () => {
    const result = await makeTaxonomy().find<TTaxonomies>();
    expect(result).toBeDefined();
  });
});

function makeTaxonomy(): TaxonomyQuery {
  const taxonomy = stack.taxonomy();

  return taxonomy;
}
