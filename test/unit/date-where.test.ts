import { httpClient, AxiosInstance } from '@contentstack/core';
import { HOST_URL } from '../utils/constant';
import { Query } from '../../src/query';
import { QueryOperation, QueryOperator } from '../../src/common/types';

/**
 * Verifies how `where()` maps date-related values into the CDA `query` object.
 * The API expects ISO-8601 strings for Date fields; `$in` matches exact values only.
 *
 * Note: each `where()` on the same field UID replaces that field’s condition object;
 * use `greaterThanOrEqualTo` / `lessThanOrEqualTo` similarly, or seed `Query` with a
 * merged object for a combined `$gte` + `$lte` on one field.
 */
describe('Query where() with date field', () => {
  let client: AxiosInstance;

  beforeAll(() => {
    client = httpClient({ defaultHostname: HOST_URL });
  });

  it('uses EQUALS with a full ISO timestamp string', () => {
    const iso = '2026-04-09T07:45:23.000Z';
    const query = newQuery(client, 'ct1');
    query.where('date', QueryOperation.EQUALS, iso);
    expect(query._parameters.date).toBe(iso);
    expect(query.getQuery()).toEqual({ date: iso });
  });

  it('uses $in (INCLUDES) with an array of full ISO strings', () => {
    const stamps = ['2025-12-02T07:34:42.963Z', '2026-04-09T07:45:23.000Z'];
    const query = newQuery(client, 'ct1');
    query.where('date', QueryOperation.INCLUDES, stamps);
    expect(query._parameters.date).toEqual({ $in: stamps });
  });

  it('combines $gte and $lte on date when provided via initial query object', () => {
    const range = {
      $gte: '2026-01-01T00:00:00.000Z',
      $lte: '2026-12-31T23:59:59.999Z',
    };
    const query = new Query(client, {}, {}, '', 'ct1', { date: range });
    expect(query._parameters.date).toEqual(range);
  });

  it('overwrites prior where() on the same field (last operator wins)', () => {
    const query = newQuery(client, 'ct1');
    query
      .where('date', QueryOperation.IS_GREATER_THAN_OR_EQUAL, '2026-01-01T00:00:00.000Z')
      .where('date', QueryOperation.IS_LESS_THAN_OR_EQUAL, '2026-12-31T23:59:59.999Z');

    expect(query._parameters.date).toEqual({
      $lte: '2026-12-31T23:59:59.999Z',
    });
  });

  it('builds $or of per-year range clauses using subqueries with merged date conditions', () => {
    const main = newQuery(client, 'ct1');
    const y2025 = new Query(client, {}, {}, '', 'ct1', {
      date: {
        $gte: '2025-01-01T00:00:00.000Z',
        $lte: '2025-12-31T23:59:59.999Z',
      },
    });
    const y2026 = new Query(client, {}, {}, '', 'ct1', {
      date: {
        $gte: '2026-01-01T00:00:00.000Z',
        $lte: '2026-12-31T23:59:59.999Z',
      },
    });

    main.queryOperator(QueryOperator.OR, y2025, y2026);

    expect(main.getQuery()).toEqual({
      $or: [y2025.getQuery(), y2026.getQuery()],
    });
  });

  it('maps $in with bare year strings (exact API match only; not calendar-year semantics)', () => {
    const query = newQuery(client, 'ct1');
    query.where('date', QueryOperation.INCLUDES, ['2025', '2026']);
    expect(query._parameters.date).toEqual({ $in: ['2025', '2026'] });
  });

  it('maps single comparison operators for dates via where()', () => {
    const gte = newQuery(client, 'ct1').where(
      'date',
      QueryOperation.IS_GREATER_THAN_OR_EQUAL,
      '2026-01-01T00:00:00.000Z',
    );
    expect(gte._parameters.date).toEqual({ $gte: '2026-01-01T00:00:00.000Z' });

    const lt = newQuery(client, 'ct1').where('date', QueryOperation.IS_LESS_THAN, '2027-01-01T00:00:00.000Z');
    expect(lt._parameters.date).toEqual({ $lt: '2027-01-01T00:00:00.000Z' });
  });
});

function newQuery(client: AxiosInstance, contentTypeUid: string): Query {
  return new Query(client, {}, {}, '', contentTypeUid);
}
