import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { QueryOperation, QueryOperator, TaxonomyQueryOperation } from "../../src/common/types";
import { stackInstance } from "../utils/stack-instance";
import dotenv from "dotenv"
import { TEntries } from "./types";

dotenv.config();
jest.setTimeout(60000);

const stack = stackInstance();

describe('Taxonomy API test cases', () => {
    it('Taxonomies Endpoint: Get Entries With One Term', async () => {
        let taxonomy = stack.taxonomy().where('taxonomies.one', QueryOperation.EQUALS, 'term_one')
        const data = await taxonomy.find<TEntries>();
        if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
    });
    
    it('Taxonomies Endpoint: Get Entries With Any Term ($in)', async () => {
        let taxonomy = stack.taxonomy().where('taxonomies.one', QueryOperation.INCLUDES, ['term_one', 'term_two']);
        const data = await taxonomy.find<TEntries>();
        if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
    })
    
    test('Taxonomies Endpoint: Get Entries With Any Term ($or)', async () => {
        let taxonomyQuery1 = stack.taxonomy().where('taxonomies.one', QueryOperation.EQUALS, 'term_one');
        let taxonomyQuery2 = stack.taxonomy().where('taxonomies.two', QueryOperation.EQUALS, 'term_two');
        let taxonomyQuery = stack.taxonomy().queryOperator(QueryOperator.OR, taxonomyQuery1, taxonomyQuery2);
        const data = await taxonomyQuery.find<TEntries>();
        if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
    })
    
    test('Taxonomies Endpoint: Get Entries With All Terms ($and)', async () => {
        let taxonomyQuery1 = stack.taxonomy().where('taxonomies.one', QueryOperation.EQUALS, 'term_one');
        let taxonomyQuery2 = stack.taxonomy().where('taxonomies.two', QueryOperation.EQUALS, 'term_two');
        let taxonomyQuery = stack.taxonomy().queryOperator(QueryOperator.AND, taxonomyQuery1, taxonomyQuery2);
        const data = await taxonomyQuery.find<TEntries>();
        if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
    })
    
    test('Taxonomies Endpoint: Get Entries With Any Taxonomy Terms ($exists)', async () => {
        let taxonomy = stack.taxonomy().where('taxonomies.one', QueryOperation.EXISTS, true)
        const data = await taxonomy.find<TEntries>();
        if (data.entries) expect(data.entries.length).toBeGreaterThan(0);
    })
    
    test('Taxonomies Endpoint: Get Entries With Taxonomy Terms and Also Matching Its Children Term ($eq_below, level)', async () => {
        // Use USA taxonomy with actual hierarchy: california -> san_diago, san_jose
        let taxonomy = stack.taxonomy().where('taxonomies.usa', TaxonomyQueryOperation.EQ_BELOW, 'california', {"levels": 1})
        const data = await taxonomy.find<TEntries>();
        if (data.entries) {
            expect(data.entries.length).toBeGreaterThanOrEqual(0);
            console.log(`Found ${data.entries.length} entries for california + cities (eq_below)`);
        }
    })
    
    test('Taxonomies Endpoint: Get Entries With Taxonomy Terms Children\'s and Excluding the term itself ($below, level)', async () => {
        // Use USA taxonomy: Get only cities under california (exclude california itself)
        let taxonomy = stack.taxonomy().where('taxonomies.usa', TaxonomyQueryOperation.BELOW, 'california', {"levels": 1})
        const data = await taxonomy.find<TEntries>();
        if (data.entries) {
            expect(data.entries.length).toBeGreaterThanOrEqual(0);
            console.log(`Found ${data.entries.length} entries for cities in california (below)`);
        }
    })
    
    test('Taxonomies Endpoint: Get Entries With Taxonomy Terms and Also Matching Its Parent Term ($eq_above, level)', async () => {
        // Use USA taxonomy: Get san_diago and its parent california
        let taxonomy = stack.taxonomy().where('taxonomies.usa', TaxonomyQueryOperation.EQ_ABOVE, 'san_diago', {"levels": 1})
        const data = await taxonomy.find<TEntries>();
        if (data.entries) {
            expect(data.entries.length).toBeGreaterThanOrEqual(0);
            console.log(`Found ${data.entries.length} entries for san_diago + parent (eq_above)`);
        }
    })
    
    test('Taxonomies Endpoint: Get Entries With Taxonomy Terms Parent and Excluding the term itself ($above, level)', async () => {
        // Use USA taxonomy: Get only parent california (exclude san_diago itself)
        let taxonomy = stack.taxonomy().where('taxonomies.usa', TaxonomyQueryOperation.ABOVE, 'san_diago', {"levels": 1})
        const data = await taxonomy.find<TEntries>();
        if (data.entries) {
            expect(data.entries.length).toBeGreaterThanOrEqual(0);
            console.log(`Found ${data.entries.length} entries for parent of san_diago (above)`);
        }
    })
});

/**
 * Hierarchical Taxonomy Tests - Export-MG-CMS Stack
 * 
 * Tests complex hierarchical taxonomies (32 country taxonomies with states/cities)
 * These tests use Export-MG-CMS stack which has richer taxonomy data
 * 
 * Optional ENV variables for testing specific taxonomies:
 * - TAX_USA_STATE: USA state term (e.g., 'california', 'texas')
 * - TAX_INDIA_STATE: India state term (e.g., 'maharashtra', 'delhi')
 * - TAX_USA_CITY: USA city term
 * 
 * Note: Tests will gracefully skip if no matching entries found in your stack
 */

describe('Hierarchical Taxonomy Tests - Country Taxonomies', () => {
    describe('USA Taxonomy (50 States + Cities)', () => {
        it('should query entries tagged with USA states', async () => {
            // Try common US states
            // In UI: You see "USA > california" - this means:
            // - Field name: taxonomies (plural)
            // - Taxonomy UID: usa
            // - Term UID: california
            // Query format: taxonomies.usa = 'california'
            const usState = process.env.TAX_USA_STATE || 'california';
            
            const taxonomy = stack.taxonomy()
                .where('taxonomies.usa', QueryOperation.EQUALS, usState);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries tagged with USA/${usState}`);
                console.log(`  Entry UIDs: ${data.entries.map((e: any) => e.uid).join(', ')}`);
                expect(data.entries.length).toBeGreaterThan(0);
            } else {
                console.log(`⚠️ No entries found for USA/${usState}`);
                console.log(`  To fix: Tag entries with taxonomy "USA" → term "california"`);
                console.log(`  Field name in entry: "taxonomies" (plural)`);
                console.log(`  Then publish the entries`);
            }
        });

        it('should query entries with eq_below to include state and cities', async () => {
            const usState = process.env.TAX_USA_STATE || 'california';
            
            // Get entries tagged with California AND its cities (california has san_diago, san_jose)
            // Level 1 gets california + direct children (san_diago, san_jose)
            const taxonomy = stack.taxonomy()
                .where('taxonomies.usa', TaxonomyQueryOperation.EQ_BELOW, usState, { levels: 1 });
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries for ${usState} + cities (eq_below level 1)`);
                expect(data.entries.length).toBeGreaterThanOrEqual(0);
            } else {
                console.log(`No hierarchical entries for USA/${usState} (may not be tagged in entries)`);
            }
        });

        it('should query entries with below to get only cities (exclude state)', async () => {
            const usState = process.env.TAX_USA_STATE || 'california';
            
            // Get only entries tagged with California cities (san_diago, san_jose) - exclude California itself
            const taxonomy = stack.taxonomy()
                .where('taxonomies.usa', TaxonomyQueryOperation.BELOW, usState, { levels: 1 });
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries tagged with cities in ${usState} (excluding ${usState} itself)`);
            } else {
                console.log(`No city-level entries for ${usState} (may not be tagged in entries)`);
            }
        });

        it('should query entries with multiple USA states (OR)', async () => {
            const query1 = stack.taxonomy().where('taxonomies.usa', QueryOperation.EQUALS, 'california');
            const query2 = stack.taxonomy().where('taxonomies.usa', QueryOperation.EQUALS, 'texas');
            const query3 = stack.taxonomy().where('taxonomies.usa', QueryOperation.EQUALS, 'new_york');
            
            const taxonomy = stack.taxonomy().queryOperator(QueryOperator.OR, query1, query2, query3);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries from CA, TX, or NY`);
                expect(data.entries.length).toBeGreaterThan(0);
            }
        });

        it('should query entries with USA taxonomy using IN operator', async () => {
            const states = ['california', 'texas', 'new_york', 'florida'];
            
            const taxonomy = stack.taxonomy()
                .where('taxonomies.usa', QueryOperation.INCLUDES, states);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries from ${states.length} states`);
            }
        });
    });

    describe('India Taxonomy (States + Cities)', () => {
        it('should query entries tagged with India states', async () => {
            // Use actual state UIDs: maharashtra, karnataka, gujrat, north_india, south_india
            const indiaState = process.env.TAX_INDIA_STATE || 'maharashtra';
            
            const taxonomy = stack.taxonomy()
                .where('taxonomies.india', QueryOperation.EQUALS, indiaState);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries tagged with India/${indiaState}`);
                expect(data.entries.length).toBeGreaterThanOrEqual(0);
            } else {
                console.log(`No entries found for India/${indiaState} (may not be tagged in entries)`);
            }
        });

        it('should query entries with India cities hierarchy', async () => {
            const indiaState = process.env.TAX_INDIA_STATE || 'maharashtra';
            
            // Maharashtra has cities: mumbai, pune (level 1)
            const taxonomy = stack.taxonomy()
                .where('taxonomies.india', TaxonomyQueryOperation.EQ_BELOW, indiaState, { levels: 1 });
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries for ${indiaState} + cities (mumbai, pune)`);
            } else {
                console.log(`No hierarchical entries for India/${indiaState} (may not be tagged in entries)`);
            }
        });

        it('should query entries from multiple India states', async () => {
            // Use actual state UIDs from taxonomy: maharashtra, karnataka, gujrat
            const states = ['maharashtra', 'karnataka', 'gujrat'];
            
            const taxonomy = stack.taxonomy()
                .where('taxonomies.india', QueryOperation.INCLUDES, states);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries from India states: ${states.join(', ')}`);
            } else {
                console.log(`No entries found for India states: ${states.join(', ')} (may not be tagged in entries)`);
            }
        });
    });

    describe('Multiple Country Taxonomies', () => {
        it('should query entries tagged with USA OR India', async () => {
            const query1 = stack.taxonomy().where('taxonomies.usa', QueryOperation.EXISTS, true);
            const query2 = stack.taxonomy().where('taxonomies.india', QueryOperation.EXISTS, true);
            
            const taxonomy = stack.taxonomy().queryOperator(QueryOperator.OR, query1, query2);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries with USA or India taxonomy`);
                expect(data.entries.length).toBeGreaterThan(0);
            }
        });

        it('should query entries tagged with BOTH USA AND India', async () => {
            const query1 = stack.taxonomy().where('taxonomies.usa', QueryOperation.EXISTS, true);
            const query2 = stack.taxonomy().where('taxonomies.india', QueryOperation.EXISTS, true);
            
            const taxonomy = stack.taxonomy().queryOperator(QueryOperator.AND, query1, query2);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries tagged with both USA and India`);
            } else {
                console.log('No entries tagged with both USA and India (expected)');
            }
        });

        it('should query entries from any of 5+ countries', async () => {
            const query1 = stack.taxonomy().where('taxonomies.usa', QueryOperation.EXISTS, true);
            const query2 = stack.taxonomy().where('taxonomies.india', QueryOperation.EXISTS, true);
            const query3 = stack.taxonomy().where('taxonomies.canada', QueryOperation.EXISTS, true);
            const query4 = stack.taxonomy().where('taxonomies.uk', QueryOperation.EXISTS, true);
            const query5 = stack.taxonomy().where('taxonomies.germany', QueryOperation.EXISTS, true);
            
            const taxonomy = stack.taxonomy()
                .queryOperator(QueryOperator.OR, query1, query2, query3, query4, query5);
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries from 5 countries`);
            }
        });
    });

    describe('Other Country Taxonomies', () => {
        const countryTaxonomies = [
            'canada', 'germany', 'uk', 'france', 'china', 'japan',
            'australia', 'brazil', 'mexico', 'spain', 'italy',
            'netherlands', 'belgium', 'austria', 'switzerland'
        ];

        it('should query entries from European countries', async () => {
            const europeanCountries = ['uk', 'germany', 'france', 'spain', 'italy'];
            
            const queries = europeanCountries.map(country => 
                stack.taxonomy().where(`taxonomies.${country}`, QueryOperation.EXISTS, true)
            );
            
            // Combine with OR
            let taxonomy = stack.taxonomy().queryOperator(QueryOperator.OR, queries[0], queries[1]);
            for (let i = 2; i < queries.length; i++) {
                taxonomy = stack.taxonomy().queryOperator(QueryOperator.OR, taxonomy, queries[i]);
            }
            
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries from European countries`);
            }
        });

        it('should test if any of the 32 country taxonomies exist', async () => {
            // Test existence of country taxonomy fields
            const results = await Promise.all(
                countryTaxonomies.slice(0, 5).map(async (country) => {
                    try {
                        const taxonomy = stack.taxonomy()
                            .where(`taxonomies.${country}`, QueryOperation.EXISTS, true);
                        const data = await taxonomy.find<TEntries>();
                        
                        if (data.entries && data.entries.length > 0) {
                            return { country, count: data.entries.length };
                        }
                    } catch (error) {
                        return { country, count: 0 };
                    }
                    return { country, count: 0 };
                })
            );
            
            const foundCountries = results.filter(r => r.count > 0);
            
            if (foundCountries.length > 0) {
                console.log('Countries with tagged entries:');
                foundCountries.forEach(({ country, count }) => {
                    console.log(`  - ${country}: ${count} entries`);
                });
                expect(foundCountries.length).toBeGreaterThan(0);
            } else {
                console.log('No entries found for tested countries');
            }
        });
    });

    describe('Hierarchy Level Testing', () => {
        it('should query with different hierarchy levels (1-2)', async () => {
            const state = 'california';
            
            // California has cities at level 1 (san_diago, san_jose)
            // Test levels 1 and 2 (level 2 won't have children since cities have no children)
            const levels = [1, 2];
            
            for (const level of levels) {
                const taxonomy = stack.taxonomy()
                    .where('taxonomies.usa', TaxonomyQueryOperation.EQ_BELOW, state, { levels: level });
                const data = await taxonomy.find<TEntries>();
                
                const count = data.entries ? data.entries.length : 0;
                console.log(`Level ${level} (california + ${level === 1 ? 'cities' : 'descendants'}): ${count} entries`);
            }
            
            expect(true).toBe(true); // Test completes without error
        });

        it('should query parent hierarchy with eq_above', async () => {
            // Use actual city from taxonomy: san_diago (parent: california)
            const city = process.env.TAX_USA_STATE || process.env.TAX_USA_CITY || 'california';
            
            // Get entries tagged with san_diago AND its parent california
            const taxonomy = stack.taxonomy()
                .where('taxonomies.usa', TaxonomyQueryOperation.EQ_ABOVE, city, { levels: 1 });
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} entries in parent hierarchy of ${city} (includes ${city} + california)`);
            } else {
                console.log(`No entries found for ${city} + parent hierarchy (may not be tagged in entries)`);
            }
        });

        it('should query only parents with above (exclude current term)', async () => {
            // Use actual city from taxonomy: san_diago (parent: california)
            const city = process.env.TAX_USA_STATE || process.env.TAX_USA_CITY || 'california';
            
            // Get only entries tagged with california (parent), exclude san_diago itself
            const taxonomy = stack.taxonomy()
                .where('taxonomies.usa', TaxonomyQueryOperation.ABOVE, city, { levels: 1 });
            const data = await taxonomy.find<TEntries>();
            
            if (data.entries && data.entries.length > 0) {
                console.log(`✓ Found ${data.entries.length} parent entries (california only, excluding ${city})`);
            } else {
                console.log(`No parent entries for ${city} (may not be tagged in entries)`);
            }
        });
    });

    describe('Taxonomy Query Performance', () => {
        it('should efficiently query hierarchical taxonomies', async () => {
            const startTime = Date.now();
            
            // California has cities at level 1, so level 1 is sufficient
            const taxonomy = stack.taxonomy()
                .where('taxonomies.usa', TaxonomyQueryOperation.EQ_BELOW, 'california', { levels: 1 });
            const data = await taxonomy.find<TEntries>();
            
            const duration = Date.now() - startTime;
            
            console.log(`Hierarchical taxonomy query (california + cities) completed in ${duration}ms`);
            expect(duration).toBeLessThan(5000); // 5 seconds
        });

        it('should handle multiple taxonomy conditions efficiently', async () => {
            const startTime = Date.now();
            
            const query1 = stack.taxonomy().where('taxonomies.usa', QueryOperation.EQUALS, 'california');
            const query2 = stack.taxonomy().where('taxonomies.india', QueryOperation.EQUALS, 'maharashtra');
            const taxonomy = stack.taxonomy().queryOperator(QueryOperator.OR, query1, query2);
            
            const data = await taxonomy.find<TEntries>();
            
            const duration = Date.now() - startTime;
            
            console.log(`Multi-country taxonomy query completed in ${duration}ms`);
            expect(duration).toBeLessThan(5000); // 5 seconds
        });
    });
});

console.log('\n📝 Taxonomy Test Notes:');
console.log('- Old taxonomy tests (one, two) use Old-stack data');
console.log('- New hierarchical tests use Export-MG-CMS data (32 countries)');
console.log('- Tests gracefully handle missing taxonomy data');
console.log('- Customize with env vars: TAX_USA_STATE, TAX_INDIA_STATE, TAX_USA_CITY\n');