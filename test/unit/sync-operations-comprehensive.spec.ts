import { synchronization } from '../../src/lib/synchronization';
import * as core from '@contentstack/core';
import { SyncStack, SyncType } from '../../src/lib/types';
import { axiosGetMock } from '../utils/mocks';
import { httpClient } from '@contentstack/core';

jest.mock('@contentstack/core');
const getDataMock = <jest.Mock<typeof core.getData>>(<unknown>core.getData);

describe('Comprehensive Sync Operations Tests', () => {
  const SYNC_URL = '/stacks/sync';
  
  beforeEach(() => {
    getDataMock.mockImplementation((_client, _url, params) => {
      const resp: any = { ...axiosGetMock };
      if ('pagination_token' in params.params) {
        delete resp.data.pagination_token;
        resp.data.sync_token = '<sync_token>';
      } else {
        resp.data.pagination_token = '<pagination_token>';
      }
      return resp;
    });
  });

  afterEach(() => {
    getDataMock.mockReset();
  });

  const syncCall = async (params?: SyncStack | SyncType, recursive = false) => {
    return await synchronization(httpClient({}), params, recursive);
  };

  describe('Basic Sync Operations', () => {
    it('should initialize sync successfully', async () => {
      await syncCall();
      expect(getDataMock.mock.calls[0][1]).toBe(SYNC_URL);
      expect(getDataMock.mock.calls[0][2].params).toHaveProperty('init');
    });

    it('should handle sync with content type filter', async () => {
      await syncCall({ contentTypeUid: 'blog' });
      expect(getDataMock.mock.calls[0][2].params).toHaveProperty('content_type_uid');
      expect(getDataMock.mock.calls[0][2].params.content_type_uid).toBe('blog');
    });

    it('should handle sync with start date', async () => {
      await syncCall({ startDate: '2024-01-01' });
      expect(getDataMock.mock.calls[0][2].params).toHaveProperty('start_date');
      expect(getDataMock.mock.calls[0][2].params.start_date).toBe('2024-01-01');
    });

    it('should handle pagination continuation', async () => {
      await syncCall({ paginationToken: 'test_token' });
      expect(getDataMock.mock.calls[0][2].params).toHaveProperty('pagination_token');
      expect(getDataMock.mock.calls[0][2].params.pagination_token).toBe('test_token');
    });
  });

  describe('Delta Sync Operations', () => {
    it('should perform delta sync with sync token', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        const resp: any = { ...axiosGetMock };
        resp.data.items = [
          {
            type: 'entry_published',
            event_at: new Date().toISOString(),
            content_type_uid: 'blog',
            data: { uid: 'entry_1', title: 'Updated Entry' }
          }
        ];
        resp.data.sync_token = 'delta_sync_token';
        return resp;
      });

      const result = await syncCall({ syncToken: 'previous_token' });
      expect(getDataMock.mock.calls[0][2].params).toHaveProperty('sync_token');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].type).toBe('entry_published');
    });

    it('should handle empty delta sync response', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        const resp: any = { ...axiosGetMock };
        resp.data.items = [];
        resp.data.sync_token = 'empty_sync_token';
        return resp;
      });

      const result = await syncCall({ syncToken: 'previous_token' });
      expect(result.items).toHaveLength(0);
      expect(result.sync_token).toBe('empty_sync_token');
    });

    it('should handle mixed entry types in delta sync', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        const resp: any = { ...axiosGetMock };
        resp.data.items = [
          {
            type: 'entry_published',
            content_type_uid: 'blog',
            data: { uid: 'entry_1', title: 'Published Entry' }
          },
          {
            type: 'entry_deleted',
            content_type_uid: 'blog',
            data: { uid: 'entry_2' }
          },
          {
            type: 'asset_published',
            content_type_uid: 'assets',
            data: { uid: 'asset_1', filename: 'image.jpg' }
          }
        ];
        resp.data.sync_token = 'mixed_sync_token';
        return resp;
      });

      const result = await syncCall({ syncToken: 'previous_token' });
      expect(result.items).toHaveLength(3);
      
      const entryTypes = result.items.map((item: any) => item.type);
      expect(entryTypes).toContain('entry_published');
      expect(entryTypes).toContain('entry_deleted');
      expect(entryTypes).toContain('asset_published');
    });
  });

  describe('Sync Error Handling', () => {
    it('should handle sync token expiration', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        throw new Error('Invalid sync token');
      });

      try {
        await syncCall({ syncToken: 'expired_token' });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Invalid sync token');
      }
    });

    it('should handle network errors', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        throw new Error('Network error');
      });

      try {
        await syncCall();
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Network error');
      }
    });

    it('should handle invalid parameters', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        throw new Error('Invalid parameters');
      });

      try {
        await syncCall({ contentTypeUid: 'invalid' });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Invalid parameters');
      }
    });

    it('should handle server errors', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        throw new Error('Server error');
      });

      try {
        await syncCall({ syncToken: 'valid_token' });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Server error');
      }
    });
  });

  describe('Sync Performance and Optimization', () => {
    it('should handle large dataset efficiently', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        const resp: any = { ...axiosGetMock };
        resp.data.items = Array(1000).fill(null).map((_, i) => ({
          type: 'entry_published',
          event_at: new Date().toISOString(),
          content_type_uid: 'blog',
          data: { uid: `entry_${i}`, title: `Entry ${i}` }
        }));
        resp.data.sync_token = 'large_dataset_token';
        return resp;
      });

      const startTime = performance.now();
      const result = await syncCall();
      const endTime = performance.now();

      expect(result.items).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should optimize for specific content types', async () => {
      await syncCall({ contentTypeUid: 'blog' });
      expect(getDataMock.mock.calls[0][2].params).toHaveProperty('content_type_uid');
      expect(getDataMock.mock.calls[0][2].params.content_type_uid).toBe('blog');
    });
  });

  describe('Sync Data Consistency', () => {
    it('should maintain data consistency', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        const resp: any = { ...axiosGetMock };
        resp.data.items = [
          {
            type: 'entry_published',
            event_at: new Date().toISOString(),
            content_type_uid: 'blog',
            data: {
              uid: 'entry_1',
              title: 'Consistent Entry',
              version: 1,
              published_at: new Date().toISOString()
            }
          }
        ];
        resp.data.sync_token = 'consistent_token';
        return resp;
      });

      const result = await syncCall({ syncToken: 'previous_token' });
      expect(result.items[0].data).toHaveProperty('version');
      expect(result.items[0].data).toHaveProperty('published_at');
    });

    it('should handle sync token validation', async () => {
      await syncCall({ syncToken: 'valid_token' });
      expect(getDataMock.mock.calls[0][2].params).toHaveProperty('sync_token');
      expect(getDataMock.mock.calls[0][2].params.sync_token).toBe('valid_token');
    });

    it('should handle malformed responses gracefully', async () => {
      getDataMock.mockImplementation((_client, _url, params) => {
        const resp: any = { ...axiosGetMock };
        resp.data = { malformed: true };
        return resp;
      });

      const result = await syncCall();
      expect(result).toHaveProperty('malformed');
    });
  });
}); 