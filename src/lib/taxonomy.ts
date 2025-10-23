import { AxiosInstance, getData } from '@contentstack/core';
import { TermQuery } from './term-query';
import { Term } from './term';

export class Taxonomy {
  private _client: AxiosInstance;
  private _taxonomyUid: string;
  private _urlPath: string;

  _queryParams: { [key: string]: string | number } = {};

  constructor(client: AxiosInstance, taxonomyUid: string) {
    this._client = client;
    this._taxonomyUid = taxonomyUid;
    this._urlPath = `/taxonomy-manager/${this._taxonomyUid}`; // TODO: change to /taxonomies/${this._taxonomyUid}
  }

  term(uid: string): Term;
  term(): TermQuery;
  term(uid?: string): Term | TermQuery {
    if (uid) return new Term(this._client, this._taxonomyUid, uid);

    return new TermQuery(this._client, this._taxonomyUid);
  }

  async fetch<T>(): Promise<T> {
    const response = await getData(this._client, this._urlPath);

    if (response.taxonomy) return response.taxonomy as T;

    return response;
  }
}
