[![Contentstack](https://www.contentstack.com/docs/static/images/contentstack.png)](https://www.contentstack.com/)
## Typescript Content Delivery SDK for Contentstack

Contentstack is a headless CMS with an API-first approach. It is a CMS that developers can use to build powerful cross-platform applications in their favorite languages. Build your application frontend, and Contentstack will take care of the rest. [Read More](https://www.contentstack.com/).

Contentstack provides Typescript SDK to build application on top of Typescript. Given below is the detailed guide and helpful resources to get started with our Typescript SDK.

The Typescript SDK can also be used to create Node.js and React native applications.

### Prerequisite

You need Node.js version 4.4.7 or later installed to use the Contentstack JavaScript SDK.

### Setup and Installation

Node.js uses the Typescript SDK to create apps. To use the Typescript SDK, install it via npm:

```bash
npm i @contentstack/delivery-sdk
```

To import the SDK in your project, use the following command:

```typescript
import contentstack from '@contentstack/delivery-sdk'
```

To initialize the SDK, you will need to specify the API Key, Delivery Token, and Environment Name of your stack.

```typescript
    import contentstack from '@contentstack/delivery-sdk'
    const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
```

### Key Concepts for using Contentstack

#### Stack

A stack is like a container that holds the content of your app. Learn more about [Stacks](https://www.contentstack.com/docs/guide/stack).

#### Content Type

Content type lets you define the structure or blueprint of a page or a section of your digital property. It is a form-like page that gives Content Managers an interface to input and upload content. [Read more](https://www.contentstack.com/docs/guide/content-types).

#### Entry

An entry is the actual piece of content created using one of the defined content types. Learn more about [Entries](https://www.contentstack.com/docs/guide/content-management#working-with-entries).

#### Asset

Assets refer to all the media files (images, videos, PDFs, audio files, and so on) uploaded to Contentstack. These files can be used in multiple entries. Read more about [Assets](https://www.contentstack.com/docs/guide/content-management#working-with-assets).

#### Environment

A publishing environment corresponds to one or more deployment servers or a content delivery destination where the entries need to be published. Learn how to work with [Environments](https://www.contentstack.com/docs/guide/environments).

### Contentstack Typescript SDK

#### Initializing your SDK

You will need to specify the API key, Delivery Token, and Environment Name of your stack to initialize the SDK:

```typescript
    const stack = contentstack.stack({ apiKey: "apiKey", deliveryToken: "deliveryToken", environment: "environment" });
```

Once you have initialized the SDK, you can start getting content in your app.

#### Querying content from your stack

To get a single entry, you need to specify the content type as well as the ID of the entry.

```typescript
import { BaseEntry } from '@contentstack/delivery-sdk'
interface BlogPostEntry extends BaseEntry {
  // custom entry types
}
const result = await stack
                      .contentType(contentType_uid)
                      .entry(entry_uid)
                      .fetch<BlogPostEntry>();
```

To retrieve multiple entries of a content type, you need to specify the content type uid. You can also specify search parameters to filter results.

```typescript
import { BaseEntry, FindEntry } from '@contentstack/delivery-sdk'
interface BlogPostEntry extends BaseEntry {
  // custom entry types
}
const result = await stack.contentType("contentType1Uid").entry()
                    .query()
                    .find<BlogPostEntry>()
```

### Advanced Queries

You can query for content types, entries, assets and more using our Typescript API Reference.

[Typescript API Reference Doc](https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/typescript/reference#contentstack)

### Working with Images

We have introduced Image Delivery APIs that let you retrieve images and then manipulate and optimize them for your digital properties. It lets you perform a host of other actions such as crop, trim, resize, rotate, overlay, and so on. 

For example, if you want to crop an image (with width as 300 and height as 400), you simply need to append query parameters at the end of the image URL, such as,  https://images.contentstack.io/owl.jpg?crop=300,400. There are several more parameters that you can use for your images.

[Read Image Delivery API documentation](https://www.contentstack.com/docs/developers/apis/image-delivery-api/).

Following are Image Delivery API examples.

```typescript
const url = 'www.example.com';
const transformObj = new imageTransform().bgColor('cccccc');
const transformURL = url.transform(transformObj);
```


### Pagination

If the result of the initial sync (or subsequent sync) contains more than 100 records, the response would be paginated. It provides pagination token in the response. You will need to use this token to get the next batch of data.

```typescript
const query = stack.contentType("contentTypeUid").entry().query();
const pagedResult = await query
                            .paginate()
                            .find<BlogPostEntry>(); 
// OR
const pagedResult = await query
                            .paginate({ skip: 20, limit: 20 })
                            .find<BlogPostEntry>();

```

### Helpful Links

- [Contentstack Website](https://www.contentstack.com)
- [Official Documentation](https://contentstack.com/docs)
- [Content Delivery API Docs](https://contentstack.com/docs/apis/content-delivery-api/)

### The MIT License (MIT)

Copyright © 2012-2024 [Contentstack](https://www.contentstack.com). All Rights Reserved

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
