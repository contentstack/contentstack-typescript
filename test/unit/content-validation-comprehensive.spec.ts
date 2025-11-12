/* eslint-disable @cspell/spellchecker */
/* eslint-disable @typescript-eslint/naming-convention */
import { AxiosInstance, httpClient } from '@contentstack/core';
import MockAdapter from 'axios-mock-adapter';
import { Query } from '../../src/lib/query';
import { ContentType } from '../../src/lib/content-type';
import { ContentTypeQuery } from '../../src/lib/contenttype-query';
import { Entry } from '../../src/lib/entry';
import { Entries } from '../../src/lib/entries';
import { GlobalField } from '../../src/lib/global-field';
import { QueryOperation, QueryOperator, TaxonomyQueryOperation } from '../../src/lib/types';
import { MOCK_CLIENT_OPTIONS } from '../utils/constant';

describe('Content Validation - Comprehensive Test Suite', () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;

  // Mock content type schema with various field types
  const mockContentTypeSchema = {
    content_type: {
      title: "Blog Post",
      uid: "blog_post",
      schema: [
        {
          display_name: "Title",
          uid: "title",
          data_type: "text",
          mandatory: true,
          unique: false,
          field_metadata: {
            _default: true,
            instruction: "Enter blog post title",
            version: 3
          },
          multiple: false,
          non_localizable: false
        },
        {
          display_name: "Content",
          uid: "content",
          data_type: "text",
          mandatory: true,
          field_metadata: {
            allow_rich_text: true,
            rich_text_type: "advanced",
            multiline: true,
            version: 3
          },
          multiple: false,
          unique: false,
          non_localizable: false
        },
        {
          display_name: "Author Email",
          uid: "author_email",
          data_type: "text",
          mandatory: true,
          field_metadata: {
            format: "email",
            version: 3
          },
          multiple: false,
          unique: true,
          non_localizable: false
        },
        {
          display_name: "Published Date",
          uid: "published_date",
          data_type: "isodate",
          mandatory: false,
          field_metadata: {
            description: "Publication date",
            default_value: ""
          },
          multiple: false,
          unique: false,
          non_localizable: false
        },
        {
          display_name: "View Count",
          uid: "view_count",
          data_type: "number",
          mandatory: false,
          field_metadata: {
            description: "Number of views",
            default_value: 0
          },
          multiple: false,
          unique: false,
          non_localizable: false
        },
        {
          display_name: "Is Published",
          uid: "is_published",
          data_type: "boolean",
          mandatory: false,
          field_metadata: {
            description: "Publication status",
            default_value: false
          },
          multiple: false,
          unique: false,
          non_localizable: false
        },
        {
          display_name: "Tags",
          uid: "tags",
          data_type: "text",
          mandatory: false,
          field_metadata: {
            description: "Blog tags",
            version: 3
          },
          multiple: true,
          unique: false,
          non_localizable: false
        },
        {
          display_name: "Featured Image",
          uid: "featured_image",
          data_type: "file",
          mandatory: false,
          field_metadata: {
            description: "Main blog image",
            image: true
          },
          multiple: false,
          unique: false,
          non_localizable: false
        },
        {
          display_name: "Categories",
          uid: "categories",
          data_type: "reference",
          reference_to: ["category"],
          mandatory: false,
          field_metadata: {
            ref_multiple: true,
            ref_multiple_content_types: false
          },
          multiple: false,
          unique: false,
          non_localizable: false
        },
        {
          display_name: "Author",
          uid: "author",
          data_type: "reference",
          reference_to: ["author"],
          mandatory: true,
          field_metadata: {
            ref_multiple: false,
            ref_multiple_content_types: false
          },
          multiple: false,
          unique: false,
          non_localizable: false
        }
      ]
    }
  };

  const mockValidEntry = {
    entry: {
      title: "Test Blog Post",
      content: "<p>This is a <strong>rich text</strong> content.</p>",
      author_email: "author@example.com",
      published_date: "2023-12-01T10:00:00.000Z",
      view_count: 100,
      is_published: true,
      tags: ["technology", "programming"],
      featured_image: {
        uid: "blt123456789",
        url: "https://example.com/image.jpg",
        content_type: "image/jpeg"
      },
      categories: [
        { uid: "blt987654321", _content_type_uid: "category" }
      ],
      author: [
        { uid: "blt111222333", _content_type_uid: "author" }
      ],
      uid: "blt123abc456",
      locale: "en-us",
      _version: 1
    }
  };

  const mockInvalidEntry = {
    entry: {
      // Missing mandatory fields: title, content, author_email, author
      published_date: "invalid-date-format",
      view_count: "not-a-number",
      is_published: "not-a-boolean",
      // author_email is missing (undefined)
      uid: "blt456def789",
      locale: "en-us",
      _version: 1
    }
  };

  beforeAll(() => {
    client = httpClient(MOCK_CLIENT_OPTIONS);
    mockClient = new MockAdapter(client as any);
  });

  afterEach(() => {
    mockClient.reset();
  });

  describe('Schema Validation', () => {
    it('should validate content type schema structure', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      expect(schema.schema).toBeDefined();
      expect(Array.isArray(schema.schema)).toBe(true);
      expect(schema.schema.length).toBeGreaterThan(0);
      
      // Validate each field has required properties
      schema.schema.forEach((field: any) => {
        expect(field).toHaveProperty('uid');
        expect(field).toHaveProperty('data_type');
        expect(field).toHaveProperty('display_name');
        expect(field).toHaveProperty('mandatory');
        expect(field).toHaveProperty('multiple');
        expect(field).toHaveProperty('unique');
        expect(field).toHaveProperty('non_localizable');
      });
    });

    it('should validate field data types are supported', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const supportedDataTypes = [
        'text', 'number', 'isodate', 'boolean', 'file', 'reference', 
        'blocks', 'group', 'json', 'link', 'select'
      ];
      
      schema.schema.forEach((field: any) => {
        expect(supportedDataTypes).toContain(field.data_type);
      });
    });

    it('should validate reference field configuration', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const referenceFields = schema.schema.filter((field: any) => field.data_type === 'reference');
      
      referenceFields.forEach((field: any) => {
        expect(field).toHaveProperty('reference_to');
        expect(Array.isArray(field.reference_to)).toBe(true);
        expect(field.reference_to.length).toBeGreaterThan(0);
        expect(field.field_metadata).toHaveProperty('ref_multiple');
        expect(field.field_metadata).toHaveProperty('ref_multiple_content_types');
      });
    });

    it('should validate file field configuration', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const fileFields = schema.schema.filter((field: any) => field.data_type === 'file');
      
      fileFields.forEach((field: any) => {
        expect(field.field_metadata).toBeDefined();
        // File fields should have image metadata if they're image fields
        if (field.field_metadata.image) {
          expect(field.field_metadata.image).toBe(true);
        }
      });
    });

    it('should validate rich text field configuration', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const richTextFields = schema.schema.filter((field: any) => 
        field.data_type === 'text' && field.field_metadata?.allow_rich_text
      );
      
      richTextFields.forEach((field: any) => {
        expect(field.field_metadata.allow_rich_text).toBe(true);
        expect(field.field_metadata).toHaveProperty('rich_text_type');
        expect(['basic', 'advanced', 'custom']).toContain(field.field_metadata.rich_text_type);
      });
    });
  });

  describe('Required Fields Validation', () => {
    it('should identify mandatory fields in schema', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const mandatoryFields = schema.schema.filter((field: any) => field.mandatory === true);
      
      expect(mandatoryFields.length).toBeGreaterThan(0);
      
      const mandatoryFieldUids = mandatoryFields.map((field: any) => field.uid);
      expect(mandatoryFieldUids).toContain('title');
      expect(mandatoryFieldUids).toContain('content');
      expect(mandatoryFieldUids).toContain('author_email');
      expect(mandatoryFieldUids).toContain('author');
    });

    it('should validate entry against mandatory field requirements', async () => {
      mockClient.onGet('/content_types/blog_post/entries/blt123abc456').reply(200, mockValidEntry);
      
      const entry = new Entry(client, 'blog_post', 'blt123abc456');
      const entryData = await entry.fetch() as any;
      
      // Check that all mandatory fields are present
      expect(entryData.title).toBeDefined();
      expect(entryData.content).toBeDefined();
      expect(entryData.author_email).toBeDefined();
      expect(entryData.author).toBeDefined();
      
      // Check field values are not empty
      expect(entryData.title).not.toBe('');
      expect(entryData.content).not.toBe('');
      expect(entryData.author_email).not.toBe('');
      expect(entryData.author).not.toEqual([]);
    });

    it('should handle entries with missing mandatory fields', async () => {
      mockClient.onGet('/content_types/blog_post/entries/blt456def789').reply(200, mockInvalidEntry);
      
      const entry = new Entry(client, 'blog_post', 'blt456def789');
      const entryData = await entry.fetch() as any;
      
      // Verify missing mandatory fields
      expect(entryData.title).toBeUndefined();
      expect(entryData.content).toBeUndefined();
      expect(entryData.author_email).toBeUndefined();
      expect(entryData.author).toBeUndefined();
    });

    it('should validate unique field constraints', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const uniqueFields = schema.schema.filter((field: any) => field.unique === true);
      
      expect(uniqueFields.length).toBeGreaterThan(0);
      
      const uniqueFieldUids = uniqueFields.map((field: any) => field.uid);
      expect(uniqueFieldUids).toContain('author_email');
    });

    it('should validate multiple field constraints', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const multipleFields = schema.schema.filter((field: any) => field.multiple === true);
      
      expect(multipleFields.length).toBeGreaterThan(0);
      
      const multipleFieldUids = multipleFields.map((field: any) => field.uid);
      expect(multipleFieldUids).toContain('tags');
    });
  });

  describe('Content Type Constraints', () => {
    it('should validate content type UID format', () => {
      const validUIDs = ['blog_post', 'user_profile', 'product123', 'content_type_1'];
      const invalidUIDs = ['Blog Post', 'user-profile', '123product', 'content type'];
      
      const uidRegex = /^[a-z][a-z0-9_]*$/;
      
      validUIDs.forEach(uid => {
        expect(uidRegex.test(uid)).toBe(true);
      });
      
      invalidUIDs.forEach(uid => {
        expect(uidRegex.test(uid)).toBe(false);
      });
    });

    it('should validate field UID format', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const fieldUidRegex = /^[a-z][a-z0-9_]*$/;
      
      schema.schema.forEach((field: any) => {
        expect(fieldUidRegex.test(field.uid)).toBe(true);
      });
    });

    it('should validate content type title requirements', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      expect(schema.title).toBeDefined();
      expect(typeof schema.title).toBe('string');
      expect(schema.title.length).toBeGreaterThan(0);
      expect(schema.title.length).toBeLessThanOrEqual(100);
    });

    it('should validate content type options', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      if (schema.options) {
        expect(schema.options).toHaveProperty('is_page');
        expect(schema.options).toHaveProperty('singleton');
        expect(typeof schema.options.is_page).toBe('boolean');
        expect(typeof schema.options.singleton).toBe('boolean');
      }
    });

    it('should validate content type abilities', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      if (schema.abilities) {
        const requiredAbilities = [
          'get_one_object', 'get_all_objects', 'create_object', 
          'update_object', 'delete_object', 'delete_all_objects'
        ];
        
        requiredAbilities.forEach(ability => {
          expect(schema.abilities).toHaveProperty(ability);
          expect(typeof schema.abilities[ability]).toBe('boolean');
        });
      }
    });
  });

  describe('Rich Text Validation', () => {
    it('should validate rich text content structure', async () => {
      mockClient.onGet('/content_types/blog_post/entries/blt123abc456').reply(200, mockValidEntry);
      
      const entry = new Entry(client, 'blog_post', 'blt123abc456');
      const entryData = await entry.fetch() as any;
      
      expect(entryData.content).toBeDefined();
      expect(typeof entryData.content).toBe('string');
      
      // Validate HTML structure
      const htmlRegex = /<[^>]*>/;
      expect(htmlRegex.test(entryData.content)).toBe(true);
    });

    it('should validate rich text field metadata', async () => {
      mockClient.onGet('/content_types/blog_post').reply(200, mockContentTypeSchema);
      
      const contentType = new ContentType(client, 'blog_post');
      const schema = await contentType.fetch() as any;
      
      const contentField = schema.schema.find((field: any) => field.uid === 'content');
      
      expect(contentField.field_metadata.allow_rich_text).toBe(true);
      expect(contentField.field_metadata.rich_text_type).toBeDefined();
      expect(['basic', 'advanced', 'custom']).toContain(contentField.field_metadata.rich_text_type);
    });

    it('should validate rich text HTML sanitization requirements', () => {
      const dangerousHTML = '<script>alert("xss")</script><p>Safe content</p>';
      const safeHTML = '<p>Safe content</p>';
      
      // Test that dangerous tags should be identified
      expect(dangerousHTML).toMatch(/<script.*?>/);
      expect(safeHTML).not.toMatch(/<script.*?>/);
      
      // Validate allowed HTML tags
      const allowedTags = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img'];
      const allowedTagsRegex = new RegExp(`^<(${allowedTags.join('|')})[^>]*>.*?<\/(${allowedTags.join('|')})>$`);
      
      expect('<p>Valid content</p>').toMatch(/<p.*?>.*?<\/p>/);
      expect('<strong>Bold text</strong>').toMatch(/<strong.*?>.*?<\/strong>/);
    });

    it('should validate rich text character limits', async () => {
      const longContent = 'a'.repeat(100000); // Very long content
      const normalContent = 'Normal length content';
      
      // Validate content length constraints
      expect(normalContent.length).toBeLessThan(50000); // Reasonable limit
      expect(longContent.length).toBeGreaterThan(50000); // Exceeds limit
    });
  });

  describe('Field Data Type Validation', () => {
    it('should validate text field constraints', () => {
      const validTextValues = ['Hello World', 'Short text', 'Text with numbers 123'];
      const invalidTextValues = [null, undefined, 123, true, [], {}];
      
      validTextValues.forEach(value => {
        expect(typeof value).toBe('string');
      });
      
      invalidTextValues.forEach(value => {
        expect(typeof value).not.toBe('string');
      });
    });

    it('should validate number field constraints', () => {
      const validNumberValues = [0, 1, -1, 3.14, 100, 0.5];
      const invalidNumberValues = ['123', 'not a number', null, undefined, true, [], {}];
      
      validNumberValues.forEach(value => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
      });
      
      invalidNumberValues.forEach(value => {
        expect(typeof value).not.toBe('number');
      });
    });

    it('should validate boolean field constraints', () => {
      const validBooleanValues = [true, false];
      const invalidBooleanValues = ['true', 'false', 1, 0, null, undefined, [], {}];
      
      validBooleanValues.forEach(value => {
        expect(typeof value).toBe('boolean');
      });
      
      invalidBooleanValues.forEach(value => {
        expect(typeof value).not.toBe('boolean');
      });
    });

    it('should validate date field format', () => {
      const validDateFormats = [
        '2023-12-01T10:00:00.000Z',
        '2023-12-01T10:00:00Z',
        '2023-12-01'
      ];
      const invalidDateFormats = [
        'invalid-date',
        'not-a-date-at-all',
        ''
        // Note: JavaScript Date constructor is lenient with many formats
        // Some seemingly invalid dates like '2023/12/01' are actually parsed successfully
      ];
      
      validDateFormats.forEach(dateStr => {
        const date = new Date(dateStr);
        expect(isNaN(date.getTime())).toBe(false);
      });
      
      invalidDateFormats.forEach(dateStr => {
        const date = new Date(dateStr);
        expect(isNaN(date.getTime())).toBe(true);
      });
    });

    it('should validate email field format', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org'
      ];
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user space@example.com',
        'user@example'
      ];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate reference field structure', async () => {
      mockClient.onGet('/content_types/blog_post/entries/blt123abc456').reply(200, mockValidEntry);
      
      const entry = new Entry(client, 'blog_post', 'blt123abc456');
      const entryData = await entry.fetch() as any;
      
      // Single reference field
      expect(Array.isArray(entryData.author)).toBe(true);
      expect(entryData.author.length).toBeGreaterThan(0);
      entryData.author.forEach((ref: any) => {
        expect(ref).toHaveProperty('uid');
        expect(ref).toHaveProperty('_content_type_uid');
      });
      
      // Multiple reference field
      expect(Array.isArray(entryData.categories)).toBe(true);
      entryData.categories.forEach((ref: any) => {
        expect(ref).toHaveProperty('uid');
        expect(ref).toHaveProperty('_content_type_uid');
      });
    });

    it('should validate file field structure', async () => {
      mockClient.onGet('/content_types/blog_post/entries/blt123abc456').reply(200, mockValidEntry);
      
      const entry = new Entry(client, 'blog_post', 'blt123abc456');
      const entryData = await entry.fetch() as any;
      
      if (entryData.featured_image) {
        expect(entryData.featured_image).toHaveProperty('uid');
        expect(entryData.featured_image).toHaveProperty('url');
        expect(entryData.featured_image).toHaveProperty('content_type');
        
        // Validate URL format
        const urlRegex = /^https?:\/\/.+/;
        expect(urlRegex.test(entryData.featured_image.url)).toBe(true);
        
        // Validate content type format
        expect(entryData.featured_image.content_type).toMatch(/^[a-z]+\/[a-z0-9+-]+$/);
      }
    });
  });

  describe('Query Validation', () => {
    it('should validate field UID in query operations', () => {
      const query = new Query(client, {}, {}, '', 'blog_post');
      
      // Mock console.error to capture validation messages
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Valid field UIDs
      query.where('title', QueryOperation.EQUALS, 'test');
      query.where('view_count', QueryOperation.IS_GREATER_THAN, 100);
      query.where('is_published', QueryOperation.EQUALS, true);
      
      // Invalid field UIDs
      query.where('invalid field', QueryOperation.EQUALS, 'test');
      query.where('field-with-dashes', QueryOperation.EQUALS, 'test');
      query.where('123invalid', QueryOperation.EQUALS, 'test');
      
      // Check that console.error was called for invalid field UIDs
      // Note: The validation function only logs for the first invalid field encountered
      expect(consoleSpy).toHaveBeenCalledWith('Invalid fieldUid:', 'invalid field');
      
      consoleSpy.mockRestore();
    });

    it('should validate query operation types', () => {
      const query = new Query(client, {}, {}, '', 'blog_post');
      
      // Test all query operations
      query.where('title', QueryOperation.EQUALS, 'test');
      query.where('title', QueryOperation.NOT_EQUALS, 'test');
      query.where('tags', QueryOperation.INCLUDES, ['tag1', 'tag2']);
      query.where('tags', QueryOperation.EXCLUDES, ['tag1', 'tag2']);
      query.where('view_count', QueryOperation.IS_LESS_THAN, 100);
      query.where('view_count', QueryOperation.IS_LESS_THAN_OR_EQUAL, 100);
      query.where('view_count', QueryOperation.IS_GREATER_THAN, 100);
      query.where('view_count', QueryOperation.IS_GREATER_THAN_OR_EQUAL, 100);
      query.where('title', QueryOperation.EXISTS, true);
      query.where('title', QueryOperation.MATCHES, '^Test');
      
      expect(query._parameters).toHaveProperty('title');
      expect(query._parameters).toHaveProperty('tags');
      expect(query._parameters).toHaveProperty('view_count');
    });

    it('should validate regex patterns in queries', () => {
      const query = new Query(client, {}, {}, '', 'blog_post');
      
      // Valid regex patterns
      expect(() => query.regex('title', '^Test')).not.toThrow();
      expect(() => query.regex('title', '.*blog.*')).not.toThrow();
      expect(() => query.regex('title', '[A-Z]+')).not.toThrow();
      
      // Invalid regex patterns
      expect(() => query.regex('title', '[a-z')).toThrow('Invalid regexPattern: Must be a valid regular expression');
      expect(() => query.regex('title', '*invalid')).toThrow('Invalid regexPattern: Must be a valid regular expression');
    });

    it('should validate query value types', () => {
      const query = new Query(client, {}, {}, '', 'blog_post');
      
      // Mock console.error to capture validation messages
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Valid value types
      query.equalTo('title', 'string value');
      query.equalTo('view_count', 123);
      query.equalTo('is_published', true);
      
      // Invalid value types for equalTo (expects string, number, or boolean)
      query.equalTo('title', [] as any);
      query.equalTo('title', {} as any);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid value (expected string or number):', []);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid value (expected string or number):', {});
      
      consoleSpy.mockRestore();
    });

    it('should validate reference query operations', () => {
      const query = new Query(client, {}, {}, '', 'blog_post');
      const subQuery = new Query(client, {}, {}, '', 'author');
      
      subQuery.where('name', QueryOperation.EQUALS, 'John Doe');
      
      // Valid reference queries
      query.whereIn('author', subQuery);
      
      expect(query._parameters).toHaveProperty('author');
      expect(query._parameters.author).toHaveProperty('$in_query');
      
      // Test whereNotIn separately
      const query2 = new Query(client, {}, {}, '', 'blog_post');
      query2.whereNotIn('author', subQuery);
      expect(query2._parameters).toHaveProperty('author');
      expect(query2._parameters.author).toHaveProperty('$nin_query');
    });

    it('should validate query operator combinations', () => {
      const query = new Query(client, {}, {}, '', 'blog_post');
      const subQuery1 = new Query(client, {}, {}, '', 'blog_post');
      const subQuery2 = new Query(client, {}, {}, '', 'blog_post');
      
      subQuery1.where('title', QueryOperation.EQUALS, 'Test 1');
      subQuery2.where('title', QueryOperation.EQUALS, 'Test 2');
      
      // OR operation
      query.queryOperator(QueryOperator.OR, subQuery1, subQuery2);
      expect(query._parameters).toHaveProperty('$or');
      expect(Array.isArray(query._parameters.$or)).toBe(true);
      expect(query._parameters.$or.length).toBe(2);
      
      // AND operation
      const andQuery = new Query(client, {}, {}, '', 'blog_post');
      andQuery.queryOperator(QueryOperator.AND, subQuery1, subQuery2);
      expect(andQuery._parameters).toHaveProperty('$and');
      expect(Array.isArray(andQuery._parameters.$and)).toBe(true);
      expect(andQuery._parameters.$and.length).toBe(2);
    });
  });

  describe('Global Field Validation', () => {
    it('should validate global field schema inclusion', async () => {
      const mockGlobalFieldResponse = {
        content_types: [
          {
            title: "Blog Post",
            uid: "blog_post",
            schema: [
              {
                display_name: "SEO",
                uid: "seo",
                data_type: "global_field",
                reference_to: "seo_metadata"
              }
            ]
          }
        ]
      };
      
      mockClient.onGet('/content_types').reply(200, mockGlobalFieldResponse);
      
      const contentTypeQuery = new ContentTypeQuery(client);
      contentTypeQuery.includeGlobalFieldSchema();
      
      expect(contentTypeQuery._queryParams.include_global_field_schema).toBe('true');
      
      const result = await contentTypeQuery.find();
      expect(result).toEqual(mockGlobalFieldResponse);
    });

    it('should validate global field reference structure', async () => {
      const mockGlobalField = {
        global_field: {
          uid: "seo_metadata",
          title: "SEO Metadata",
          schema: [
            {
              display_name: "Meta Title",
              uid: "meta_title",
              data_type: "text",
              mandatory: true
            },
            {
              display_name: "Meta Description",
              uid: "meta_description",
              data_type: "text",
              mandatory: false
            }
          ]
        }
      };
      
      mockClient.onGet('/global_fields/seo_metadata').reply(200, mockGlobalField);
      
      const globalField = new GlobalField(client, 'seo_metadata');
      const result = await globalField.fetch() as any;
      
      expect(result).toHaveProperty('uid');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('schema');
      expect(Array.isArray(result.schema)).toBe(true);
    });
  });

  describe('Entry Field Selection Validation', () => {
    it('should validate only() field selection', () => {
      const entry = new Entry(client, 'blog_post', 'entry_uid');
      
      // Single field selection
      entry.only('title');
      expect(entry._queryParams['only[BASE][]']).toBe('title');
      
      // Multiple field selection
      const entry2 = new Entry(client, 'blog_post', 'entry_uid2');
      entry2.only(['title', 'content', 'author']);
      expect(entry2._queryParams['only[BASE][0]']).toBe('title');
      expect(entry2._queryParams['only[BASE][1]']).toBe('content');
      expect(entry2._queryParams['only[BASE][2]']).toBe('author');
    });

    it('should validate except() field exclusion', () => {
      const entry = new Entry(client, 'blog_post', 'entry_uid');
      
      // Single field exclusion
      entry.except('internal_notes');
      expect(entry._queryParams['except[BASE][]']).toBe('internal_notes');
      
      // Multiple field exclusion
      const entry2 = new Entry(client, 'blog_post', 'entry_uid2');
      entry2.except(['internal_notes', 'draft_content']);
      expect(entry2._queryParams['except[BASE][0]']).toBe('internal_notes');
      expect(entry2._queryParams['except[BASE][1]']).toBe('draft_content');
    });

    it('should validate reference inclusion', () => {
      const entry = new Entry(client, 'blog_post', 'entry_uid');
      
      // Single reference inclusion
      entry.includeReference('author');
      expect(Array.isArray(entry._queryParams['include[]'])).toBe(true);
      expect(entry._queryParams['include[]']).toContain('author');
      
      // Multiple reference inclusion
      entry.includeReference('categories', 'featured_image');
      expect(entry._queryParams['include[]']).toContain('categories');
      expect(entry._queryParams['include[]']).toContain('featured_image');
    });
  });

  describe('Content Validation Edge Cases', () => {
    it('should handle null and undefined values gracefully', () => {
      // Mock console.error to suppress validation messages
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const query = new Query(client, {}, {}, '', 'blog_post');
      
      // Test with null values
      expect(() => query.equalTo('title', null as any)).not.toThrow();
      expect(() => query.equalTo('title', undefined as any)).not.toThrow();
      
      // Test with empty strings
      expect(() => query.equalTo('title', '')).not.toThrow();
      expect(() => query.equalTo('view_count', 0)).not.toThrow();
      
      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should validate content type without schema', async () => {
      const mockEmptySchema = {
        content_type: {
          title: "Empty Content Type",
          uid: "empty_type",
          schema: []
        }
      };
      
      mockClient.onGet('/content_types/empty_type').reply(200, mockEmptySchema);
      
      const contentType = new ContentType(client, 'empty_type');
      const schema = await contentType.fetch() as any;
      
      expect(schema.schema).toBeDefined();
      expect(Array.isArray(schema.schema)).toBe(true);
      expect(schema.schema.length).toBe(0);
    });

    it('should handle malformed field metadata', async () => {
      const mockMalformedSchema = {
        content_type: {
          title: "Malformed Content Type",
          uid: "malformed_type",
          schema: [
            {
              display_name: "Malformed Field",
              uid: "malformed_field",
              data_type: "text",
              mandatory: true,
              field_metadata: null // Malformed metadata
            }
          ]
        }
      };
      
      mockClient.onGet('/content_types/malformed_type').reply(200, mockMalformedSchema);
      
      const contentType = new ContentType(client, 'malformed_type');
      const schema = await contentType.fetch() as any;
      
      expect(schema.schema[0].field_metadata).toBeNull();
      expect(schema.schema[0]).toHaveProperty('uid');
      expect(schema.schema[0]).toHaveProperty('data_type');
    });

    it('should validate deeply nested reference structures', () => {
      const mockNestedEntry = {
        entry: {
          title: "Nested Entry",
          author: [
            {
              uid: "author_123",
              _content_type_uid: "author",
              profile: [
                {
                  uid: "profile_456",
                  _content_type_uid: "profile"
                }
              ]
            }
          ]
        }
      };
      
      expect(mockNestedEntry.entry.author[0]).toHaveProperty('profile');
      expect(Array.isArray(mockNestedEntry.entry.author[0].profile)).toBe(true);
      expect(mockNestedEntry.entry.author[0].profile[0]).toHaveProperty('uid');
      expect(mockNestedEntry.entry.author[0].profile[0]).toHaveProperty('_content_type_uid');
    });
  });
}); 