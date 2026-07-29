import {
  type HttpClient,
  type HttpRequest,
  type HttpResponse,
} from "./HttpClient";

export class FetchHttpClient implements HttpClient {
  async get(
    request: HttpRequest,
  ): Promise<HttpResponse> {
    const response = await fetch(request.url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: request.signal,
      headers: {
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8",
        "User-Agent": "ANDORRE-360-Source-Engine/1.0",
      },
    });

    return {
      ok: response.ok,
      status: response.status,
    };
  }
}