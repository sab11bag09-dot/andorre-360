export type HttpRequest = {
  url: string;
  signal: AbortSignal;
};

export type HttpResponse = {
  ok: boolean;
  status: number;
};

export interface HttpClient {
  get(request: HttpRequest): Promise<HttpResponse>;
}