import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { stackInstance } from '../utils/stack-instance';
import { BaseContentType } from '../../src';

const stack = stackInstance();

// Content Type UIDs (use env vars with fallback defaults)
const COMPLEX_CT = process.env.COMPLEX_CONTENT_TYPE_UID || 'complex_content_type';
const MEDIUM_CT = process.env.MEDIUM_CONTENT_TYPE_UID || 'medium_content_type';
const SIMPLE_CT = process.env.SIMPLE_CONTENT_TYPE_UID || 'simple_content_type';

// Entry UIDs from your test stack (reused across all tests)
const COMPLEX_ENTRY_UID = process.env.COMPLEX_ENTRY_UID;
const MEDIUM_ENTRY_UID = process.env.MEDIUM_ENTRY_UID;
const SIMPLE_ENTRY_UID = process.env.SIMPLE_ENTRY_UID;

describe('Content Type Schema Validation Tests', () => {
  const skipIfNoUID = !COMPLEX_ENTRY_UID ? describe.skip : describe;

  skipIfNoUID('Content Type Schema Fetching', () => {
    it('should fetch content type schema', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();
      expect(contentType.uid).toBe(COMPLEX_CT);
      expect(contentType.title).toBeDefined();
      expect(contentType.schema).toBeDefined();

      console.log('Content type schema:', {
        uid: contentType.uid,
        title: contentType.title,
        description: contentType.description,
        schemaFieldCount: contentType.schema?.length || 0
      });
    });

    it('should validate content type basic structure', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();
      expect(contentType.uid).toBeDefined();
      expect(typeof contentType.uid).toBe('string');
      expect(contentType.title).toBeDefined();
      expect(typeof contentType.title).toBe('string');
      expect(contentType.schema).toBeDefined();
      expect(Array.isArray(contentType.schema)).toBe(true);

      console.log('Content type structure validation passed');
    });

    it('should fetch multiple content type schemas', async () => {
      const contentTypes = await Promise.all([
        stack.contentType(COMPLEX_CT).fetch<BaseContentType>(),
        stack.contentType(MEDIUM_CT).fetch<BaseContentType>()
      ]);

      expect(contentTypes[0]).toBeDefined();
      expect(contentTypes[1]).toBeDefined();

      console.log('Multiple content type schemas:', {
        complex: {
          uid: contentTypes[0].uid,
          title: contentTypes[0].title,
          fieldCount: contentTypes[0].schema?.length || 0
        },
        medium: {
          uid: contentTypes[1].uid,
          title: contentTypes[1].title,
          fieldCount: contentTypes[1].schema?.length || 0
        }
      });
    });
  });

  skipIfNoUID('Field Type Validation', () => {
    it('should validate text field schemas', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();
      expect(contentType.schema).toBeDefined();

      const textFields = contentType.schema?.filter((field: any) => 
        field.data_type === 'text' || field.data_type === 'text'
      ) || [];

      console.log(`Found ${textFields.length} text fields`);

      textFields.forEach((field: any, index: number) => {
        console.log(`Text field ${index + 1}:`, {
          uid: field.uid,
          display_name: field.display_name,
          data_type: field.data_type,
          mandatory: field.mandatory,
          multiple: field.multiple
        });

        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
        expect(field.data_type).toBe('text');
      });
    });

    it('should validate number field schemas', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const numberFields = contentType.schema?.filter((field: any) =>
        field.data_type === 'number'
      ) || [];

      console.log(`Found ${numberFields.length} number fields`);

      numberFields.forEach((field: any, index: number) => {
        console.log(`Number field ${index + 1}:`, {
          uid: field.uid,
          display_name: field.display_name,
          data_type: field.data_type,
          mandatory: field.mandatory,
          multiple: field.multiple
        });

        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
        expect(field.data_type).toBe('number');
      });
    });

    it('should validate date field schemas', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const dateFields = contentType.schema?.filter((field: any) =>
        field.data_type === 'date'
      ) || [];

      console.log(`Found ${dateFields.length} date fields`);

      dateFields.forEach((field: any, index: number) => {
        console.log(`Date field ${index + 1}:`, {
          uid: field.uid,
          display_name: field.display_name,
          data_type: field.data_type,
          mandatory: field.mandatory,
          multiple: field.multiple
        });

        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
        expect(field.data_type).toBe('date');
      });
    });

    it('should validate boolean field schemas', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const booleanFields = contentType.schema?.filter((field: any) =>
        field.data_type === 'boolean'
      ) || [];

      console.log(`Found ${booleanFields.length} boolean fields`);

      booleanFields.forEach((field: any, index: number) => {
        console.log(`Boolean field ${index + 1}:`, {
          uid: field.uid,
          display_name: field.display_name,
          data_type: field.data_type,
          mandatory: field.mandatory,
          multiple: field.multiple
        });

        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
        expect(field.data_type).toBe('boolean');
      });
    });

    it('should validate reference field schemas', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const referenceFields = contentType.schema?.filter((field: any) => 
        field.data_type === 'reference'
      ) || [];

      console.log(`Found ${referenceFields.length} reference fields`);

      referenceFields.forEach((field: any, index: number) => {
        console.log(`Reference field ${index + 1}:`, {
          uid: field.uid,
          display_name: field.display_name,
          data_type: field.data_type,
          mandatory: field.mandatory,
          multiple: field.multiple,
          reference_to: field.reference_to
        });

        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
        expect(field.data_type).toBe('reference');
        expect(field.reference_to).toBeDefined();
      });
    });
  });

  skipIfNoUID('Global Field Schema Validation', () => {
    it('should validate global field schemas', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const globalFields = contentType.schema?.filter((field: any) =>
        field.data_type === 'global_field'
      ) || [];

      console.log(`Found ${globalFields.length} global fields`);

      globalFields.forEach((field: any, index: number) => {
        console.log(`Global field ${index + 1}:`, {
          uid: field.uid,
          display_name: field.display_name,
          data_type: field.data_type,
          mandatory: field.mandatory,
          multiple: field.multiple,
          reference_to: field.reference_to
        });

        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
        expect(field.data_type).toBe('global_field');
        expect(field.reference_to).toBeDefined();
      });
    });

    it('should validate global field references', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const globalFields = contentType.schema?.filter((field: any) => 
        field.data_type === 'global_field'
      ) || [];

      // Fetch global field schemas
      const globalFieldSchemas = await Promise.all(
        globalFields.map((field: any) => 
          stack.globalField(field.reference_to).fetch().catch(() => null)
        )
      );

      const validGlobalFields = globalFieldSchemas.filter(schema => schema !== null);

      console.log('Global field reference validation:', {
        totalGlobalFields: globalFields.length,
        validReferences: validGlobalFields.length,
        invalidReferences: globalFields.length - validGlobalFields.length
      });

      validGlobalFields.forEach((schema, index) => {
        console.log(`Valid global field ${index + 1}:`, {
          uid: schema?.uid,
          title: schema?.title,
          fieldCount: schema?.schema?.length || 0
        });
      });
    });
  });

  skipIfNoUID('Modular Block Schema Validation', () => {
    it('should validate modular block schemas', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const modularBlockFields = contentType.schema?.filter((field: any) => 
        field.data_type === 'blocks'
      ) || [];

      console.log(`Found ${modularBlockFields.length} modular block fields`);

      modularBlockFields.forEach((field: any, index: number) => {
        console.log(`Modular block field ${index + 1}:`, {
          uid: field.uid,
          display_name: field.display_name,
          data_type: field.data_type,
          mandatory: field.mandatory,
          multiple: field.multiple,
          blocks: field.blocks?.length || 0
        });

        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
        expect(field.data_type).toBe('blocks');
        expect(field.blocks).toBeDefined();
        expect(Array.isArray(field.blocks)).toBe(true);
      });
    });

    it('should validate modular block structure', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const modularBlockFields = contentType.schema?.filter((field: any) => 
        field.data_type === 'blocks'
      ) || [];

      modularBlockFields.forEach((field: any, index: number) => {
        if (field.blocks && field.blocks.length > 0) {
          console.log(`Modular block ${index + 1} structure:`, {
            fieldUid: field.uid,
            blockCount: field.blocks.length,
            blockTypes: field.blocks.map((block: any) => ({
              uid: block.uid,
              title: block.title,
              fieldCount: block.schema?.length || 0
            }))
          });

          field.blocks.forEach((block: any, blockIndex: number) => {
            expect(block.uid).toBeDefined();
            expect(block.title).toBeDefined();
            expect(block.schema).toBeDefined();
            expect(Array.isArray(block.schema)).toBe(true);
          });
        }
      });
    });
  });

  skipIfNoUID('Schema Consistency Checks', () => {
    it('should validate schema field consistency', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();
      expect(contentType.schema).toBeDefined();

      const schema = contentType.schema!;
      const fieldUids = new Set<string>();
      const duplicateUids: string[] = [];

      schema.forEach((field: any) => {
        if (fieldUids.has(field.uid)) {
          duplicateUids.push(field.uid);
        } else {
          fieldUids.add(field.uid);
        }
      });

      console.log('Schema consistency check:', {
        totalFields: schema.length,
        uniqueFieldUids: fieldUids.size,
        duplicateUids: duplicateUids.length,
        hasDuplicates: duplicateUids.length > 0
      });

      expect(duplicateUids.length).toBe(0);
    });

    it('should validate mandatory field requirements', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const mandatoryFields = contentType.schema?.filter((field: any) => 
        field.mandatory === true
      ) || [];

      const optionalFields = contentType.schema?.filter((field: any) => 
        field.mandatory === false
      ) || [];

      console.log('Mandatory field validation:', {
        totalFields: contentType.schema?.length || 0,
        mandatoryFields: mandatoryFields.length,
        optionalFields: optionalFields.length,
        mandatoryFieldTypes: mandatoryFields.map((f: any) => f.data_type),
        optionalFieldTypes: optionalFields.map((f: any) => f.data_type)
      });

      mandatoryFields.forEach((field: any) => {
        expect(field.mandatory).toBe(true);
        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
      });
    });

    it('should validate multiple field configurations', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const multipleFields = contentType.schema?.filter((field: any) => 
        field.multiple === true
      ) || [];

      const singleFields = contentType.schema?.filter((field: any) => 
        field.multiple === false
      ) || [];

      console.log('Multiple field validation:', {
        totalFields: contentType.schema?.length || 0,
        multipleFields: multipleFields.length,
        singleFields: singleFields.length,
        multipleFieldTypes: multipleFields.map((f: any) => f.data_type),
        singleFieldTypes: singleFields.map((f: any) => f.data_type)
      });

      multipleFields.forEach((field: any) => {
        expect(field.multiple).toBe(true);
        expect(field.uid).toBeDefined();
        expect(field.display_name).toBeDefined();
      });
    });
  });

  skipIfNoUID('Schema Field Analysis', () => {
    it('should analyze field type distribution', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const fieldTypes = contentType.schema?.reduce((acc: Record<string, number>, field: any) => {
        const type = field.data_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      console.log('Field type distribution:', fieldTypes);

      const totalFields = contentType.schema?.length || 0;
      const typePercentages = Object.entries(fieldTypes).map(([type, count]) => ({
        type,
        count: count as number,
        percentage: (((count as number) / totalFields) * 100).toFixed(1) + '%'
      }));

      console.log('Field type percentages:', typePercentages);
    });

    it('should analyze field complexity', async () => {
      const contentType = await stack.contentType(COMPLEX_CT).fetch<BaseContentType>();

      expect(contentType).toBeDefined();

      const complexityAnalysis = {
        simpleFields: 0, // text, number, boolean, date
        complexFields: 0, // reference, global_field, blocks, file, group
        arrayFields: 0, // fields with multiple: true
        requiredFields: 0, // fields with mandatory: true
        optionalFields: 0 // fields with mandatory: false
      };

      contentType.schema?.forEach((field: any) => {
        const simpleTypes = ['text', 'number', 'boolean', 'date'];
        const complexTypes = ['reference', 'global_field', 'blocks', 'file', 'group'];

        if (simpleTypes.includes(field.data_type)) {
          complexityAnalysis.simpleFields++;
        } else if (complexTypes.includes(field.data_type)) {
          complexityAnalysis.complexFields++;
        }

        if (field.multiple) {
          complexityAnalysis.arrayFields++;
        }

        if (field.mandatory) {
          complexityAnalysis.requiredFields++;
        } else {
          complexityAnalysis.optionalFields++;
        }
      });

      console.log('Field complexity analysis:', complexityAnalysis);
    });
  });

  skipIfNoUID('Cross-Content Type Schema Comparison', () => {
    const skipIfNoMediumUID = !MEDIUM_ENTRY_UID ? describe.skip : describe;

    skipIfNoMediumUID('should compare schemas across different content types', () => {
      it('should compare schemas across different content types', async () => {
      const contentTypes = await Promise.all([
        stack.contentType(COMPLEX_CT).fetch<BaseContentType>(),
        stack.contentType(MEDIUM_CT).fetch<BaseContentType>()
      ]);

      expect(contentTypes[0]).toBeDefined();
      expect(contentTypes[1]).toBeDefined();

      const comparison = {
        complex: {
          uid: contentTypes[0].uid,
          title: contentTypes[0].title,
          fieldCount: contentTypes[0].schema?.length || 0,
          fieldTypes: contentTypes[0].schema?.map((f: any) => f.data_type) || [],
          mandatoryFields: contentTypes[0].schema?.filter((f: any) => f.mandatory).length || 0,
          multipleFields: contentTypes[0].schema?.filter((f: any) => f.multiple).length || 0
        },
        medium: {
          uid: contentTypes[1].uid,
          title: contentTypes[1].title,
          fieldCount: contentTypes[1].schema?.length || 0,
          fieldTypes: contentTypes[1].schema?.map((f: any) => f.data_type) || [],
          mandatoryFields: contentTypes[1].schema?.filter((f: any) => f.mandatory).length || 0,
          multipleFields: contentTypes[1].schema?.filter((f: any) => f.multiple).length || 0
        }
      };

      console.log('Cross-content type schema comparison:', comparison);

      // Compare field counts
      expect(comparison.complex.fieldCount).toBeGreaterThan(0);
      expect(comparison.medium.fieldCount).toBeGreaterThan(0);
      });
    });
  });
});
