export interface TEntry {
  uid: string;
  title: string;
  created_at: string;
  _version: number;
  locale: string;
  created_by: string;
  updated_by: string;
  _branch?: string;
  publish_details: PublishDetails;
  author: Author[];
  url: string;
  reference?:  any;
}


export interface TEntries {
  entries: TEntry[];
}

interface PublishDetails {
  environment: string;
  locale: string;
  time: string;
  user: string;
}

interface Author {
  uid: string;
  _content_type_uid: string;
}

interface Reference {
  uid: string;
  _content_type_uid: string;
}

export interface TAsset {
  _version: number;
  uid: string;
  filename: string;
  content_type: string;
  created_by: string;
  updated_by: string;
  publish_details: PublishDetails;
  url: string;
  _branch?: string;
  _metadata?: { [key: string]: any }
  dimension?: {
    height: string;
    width: string;
  };
}

export interface TGlobalField {
  uid: string;
  title: string;
  schema: any[];
  _version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  _branch?: string;
}

export interface TAssets {
  assets: TAsset[];
}

export interface TContentType {
  title: string;
  uid: string;
  _version: number;
  schema: {
    display_name: string;
    uid: string;
    data_type: string;
    mandatory: string;
  };
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TContentTypes {
  content_types: TContentType[];
}

export interface TTaxonomies {
  taxonomies: TTaxonomy[];
}

export interface TTaxonomy {
  uid: string;
  name: string;
  description?: string;
  terms_count?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  type: string;
  publish_details?: PublishDetails;
}

export interface TTerms {
  terms: TTerm[];
}

export interface TTerm {
  taxonomy_uid: string;
  uid: string;
  ancestors: TTerm[];
  name: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  children_count?: number;
  depth?: number;
  publish_details?: PublishDetails;
}