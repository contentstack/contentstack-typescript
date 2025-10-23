import { AxiosInstance, getData } from "@contentstack/core";

export class Term {
  protected _client: AxiosInstance;
  private _taxonomyUid: string;
  private _termUid: string;
  private _urlPath: string;

  constructor(client: AxiosInstance, taxonomyUid: string, termUid: string) {
    this._client = client;
    this._taxonomyUid = taxonomyUid;
    this._termUid = termUid;
    this._urlPath = `/taxonomy-manager/${this._taxonomyUid}/terms/${this._termUid}`; // TODO: change to /taxonomies
  }
  async fetch<T>(): Promise<T> {
    const response = await getData(this._client, this._urlPath);

    if (response.term) return response.term as T;

    return response;
  }
}
