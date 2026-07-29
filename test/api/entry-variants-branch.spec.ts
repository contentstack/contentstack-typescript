import { describe, it, expect } from '@jest/globals';
import * as contentstack from '../../src/stack';
import { stackInstance } from '../utils/stack-instance';
import { TEntry } from './types';

const stack = stackInstance();

const contentTypeUid = process.env.COMPLEX_CONTENT_TYPE_UID || 'cybersecurity';
const entryUid = process.env.COMPLEX_ENTRY_UID || '';
const variantUid = process.env.VARIANT_UID || '';
const branchUid = process.env.BRANCH_UID || 'main';

const hasEntryUid = !!entryUid;
const hasVariantUid = !!variantUid;

const skipIfNoEntry = !hasEntryUid ? describe.skip : describe;
const skipIfNoVariant = !hasVariantUid ? describe.skip : describe;
const skipIfNoVariantOrEntry = !hasEntryUid || !hasVariantUid ? describe.skip : describe;

describe('Entry Variants with Branch API Tests', () => {
  skipIfNoVariantOrEntry('Single entry fetch with variant and branch', () => {
    it('should fetch entry with single variant UID and branch', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry(entryUid)
        .variants(variantUid, branchUid)
        .fetch<TEntry>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
    });

    it('should fetch entry with multiple variant UIDs and branch', async () => {
      const variantUids = [variantUid, 'variant_2', 'variant_3'];

      const result = await stack
        .contentType(contentTypeUid)
        .entry(entryUid)
        .variants(variantUids, branchUid)
        .fetch<TEntry>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
    });

    it('should fetch entry with variant only when branch is omitted (backward compatible)', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry(entryUid)
        .variants(variantUid)
        .fetch<TEntry>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
    });

    it('should fetch entry with variant, branch, and includeBranch metadata', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry(entryUid)
        .variants(variantUid, branchUid)
        .includeBranch()
        .fetch<TEntry & { _branch?: string }>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
      if (result._branch) {
        expect(typeof result._branch).toBe('string');
      }
    });

    it('should fetch entry with variant, branch, and includeMetadata', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry(entryUid)
        .variants(variantUid, branchUid)
        .includeMetadata()
        .fetch<TEntry>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
    });
  });

  skipIfNoVariant('Entries find with variant and branch', () => {
    it('should find entries with single variant UID and branch', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry()
        .variants(variantUid, branchUid)
        .limit(5)
        .find<TEntry>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);

      if (result.entries!.length > 0) {
        expect(result.entries![0].uid).toBeDefined();
      }
    });

    it('should find entries with multiple variant UIDs and branch', async () => {
      const variantUids = [variantUid, 'variant_2'];

      const result = await stack
        .contentType(contentTypeUid)
        .entry()
        .variants(variantUids, branchUid)
        .limit(5)
        .find<TEntry>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(Array.isArray(result.entries)).toBe(true);
    });

    it('should find entries with variant only when branch is omitted (backward compatible)', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry()
        .variants(variantUid)
        .limit(5)
        .find<TEntry>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
    });

    it('should find entries with variant, branch, and includeCount', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry()
        .variants(variantUid, branchUid)
        .includeCount()
        .limit(5)
        .find<TEntry>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(typeof result.count).toBe('number');
    });
  });

  skipIfNoVariantOrEntry('Query chain with variant and branch', () => {
    it('should query entries with variant and branch via query()', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry()
        .variants(variantUid, branchUid)
        .query()
        .equalTo('uid', entryUid)
        .find<TEntry>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();

      if (result.entries && result.entries.length > 0) {
        result.entries.forEach((entry) => {
          expect(entry.uid).toBe(entryUid);
        });
      }
    });

    it('should query entries with variant, branch, and pagination', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry()
        .variants(variantUid, branchUid)
        .limit(3)
        .skip(0)
        .find<TEntry>();

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.entries!.length).toBeLessThanOrEqual(3);
    });
  });

  skipIfNoEntry('Branch optional behavior', () => {
    it('should fetch entry without variant or branch headers when neither is set', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry(entryUid)
        .fetch<TEntry>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
    });
  });

  skipIfNoVariantOrEntry('Stack-level branch vs variants-level branch', () => {
    it('should fetch entry when stack has default branch and variants() also passes branch', async () => {
      const stackWithBranch = contentstack.stack({
        host: process.env.HOST || '',
        apiKey: process.env.API_KEY || '',
        deliveryToken: process.env.DELIVERY_TOKEN || '',
        environment: process.env.ENVIRONMENT || '',
        branch: branchUid,
        live_preview: {
          enable: false,
          preview_token: process.env.PREVIEW_TOKEN || '',
          host: process.env.LIVE_PREVIEW_HOST || '',
        },
      });

      expect(stackWithBranch.config.branch).toBe(branchUid);

      const result = await stackWithBranch
        .contentType(contentTypeUid)
        .entry(entryUid)
        .variants(variantUid, branchUid)
        .fetch<TEntry>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
    });

    it('should fetch entry with variant+branch on stack without stack-level branch config', async () => {
      const result = await stack
        .contentType(contentTypeUid)
        .entry(entryUid)
        .variants(variantUid, branchUid)
        .fetch<TEntry>();

      expect(result).toBeDefined();
      expect(result.uid).toBe(entryUid);
    });
  });

  skipIfNoVariantOrEntry('Error handling', () => {
    it('should handle invalid variant UID with branch gracefully', async () => {
      try {
        await stack
          .contentType(contentTypeUid)
          .entry(entryUid)
          .variants('invalid_variant_uid', branchUid)
          .fetch<TEntry>();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return consistent results for repeated variant+branch requests', async () => {
      const fetchEntry = () =>
        stack
          .contentType(contentTypeUid)
          .entry(entryUid)
          .variants(variantUid, branchUid)
          .fetch<TEntry>();

      const [result1, result2] = await Promise.all([fetchEntry(), fetchEntry()]);

      expect(result1.uid).toBe(entryUid);
      expect(result2.uid).toBe(entryUid);
      expect(result1.uid).toBe(result2.uid);
    });
  });
});
