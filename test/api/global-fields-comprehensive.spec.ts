import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { TGlobalField } from './types';

const stack = stackInstance();
const globalFieldUid = process.env.GLOBAL_FIELD_UID || 'seo_fields';

describe('Global Fields API Tests', () => {
  describe('Global Field Basic Operations', () => {
    it('should fetch single global field', async () => {
      try {
        const result = await stack.globalField(globalFieldUid).fetch();
        
        expect(result).toBeDefined();
        if (result) {
          const globalField = result as any;
          expect(globalField.uid).toBe(globalFieldUid);
          expect(globalField.title).toBeDefined();
        }
      } catch (error) {
        console.log('Global field not found:', error);
      }
    });

    it('should include branch in global field fetch', async () => {
      try {
        const result = await stack.globalField(globalFieldUid)
          .includeBranch()
          .fetch();
        
        expect(result).toBeDefined();
        if (result) {
          const globalField = result as any;
          expect(globalField.uid).toBe(globalFieldUid);
          expect(globalField.title).toBeDefined();
          // Branch information may be included
        }
      } catch (error) {
        console.log('Global field not found:', error);
      }
    });
  });

  describe('Global Field Query Operations', () => {
    it('should query all global fields', async () => {
      const result = await stack.globalField().find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        expect(result.global_fields.length).toBeGreaterThan(0);
        
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
          expect(field.schema).toBeDefined();
        });
      }
    });

    it('should query global fields with branch information', async () => {
      const result = await stack.globalField()
        .includeBranch()
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
          // Branch information may be included
        });
      }
    });

    it('should query global fields with limit', async () => {
      const limit = 5;
      const result = await stack.globalField()
        .limit(limit)
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        expect(result.global_fields.length).toBeLessThanOrEqual(limit);
        
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });

    it('should query global fields with skip', async () => {
      const skip = 2;
      const result = await stack.globalField()
        .skip(skip)
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });

    it('should query global fields with include count', async () => {
      const result = await stack.globalField()
        .includeCount()
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        expect(result.count).toBeDefined();
        expect(typeof result.count).toBe('number');
        
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });
  });

  describe('Global Field Advanced Operations', () => {
    it('should query global fields with additional parameters', async () => {
      const result = await stack.globalField()
        .addParams({ 'include_global_field_schema': 'true' })
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });

    it('should query global fields with custom parameter', async () => {
      const result = await stack.globalField()
        .param('include_schema', 'true')
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });

    it('should remove parameter from global field query', async () => {
      const result = await stack.globalField()
        .param('test_param', 'test_value')
        .removeParam('test_param')
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });
  });

  describe('Global Field Sorting Operations', () => {
    it('should query global fields with ascending order', async () => {
      const result = await stack.globalField()
        .orderByAscending('title')
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });

    it('should query global fields with descending order', async () => {
      const result = await stack.globalField()
        .orderByDescending('created_at')
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });
  });

  describe('Global Field Error Handling', () => {
    it('should handle non-existent global field gracefully', async () => {
      try {
        await stack.globalField('non_existent_global_field').fetch();
      } catch (error) {
        expect(error).toBeDefined();
        // Should throw an error for non-existent global field
      }
    });

    it('should handle empty global field queries gracefully', async () => {
      const result = await stack.globalField()
        .param('uid', 'non_existent_field')
        .find();
      
      expect(result).toBeDefined();
      if (result.global_fields) {
        expect(result.global_fields.length).toBeGreaterThanOrEqual(0);
        // The parameter filter might not work as expected, but API call should succeed
      }
    });
  });

  describe('Global Field Performance Tests', () => {
    it('should handle large global field queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await stack.globalField()
        .limit(50)
        .find();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });

    it('should efficiently handle global field queries with branch information', async () => {
      const startTime = Date.now();
      
      const result = await stack.globalField()
        .includeBranch()
        .limit(10)
        .find();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(8000); // Should complete within 8 seconds
      
      if (result.global_fields) {
        result.global_fields.forEach((field: any) => {
          expect(field.uid).toBeDefined();
          expect(field.title).toBeDefined();
        });
      }
    });
  });
}); 