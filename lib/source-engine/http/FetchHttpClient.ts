import { robotsPolicy, type RobotsPolicy } from "../robots/robotsPolicy";
import {
  type HttpClient,
  type HttpRequest,
  type HttpResponse,
} from "./HttpClient";

export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly robots: Pick<RobotsPolicy, "assertAllowed"> = robotsPolicy,
  ) {}

  async get(
    request: HttpRequest,
  ): Promise<HttpResponse> {
    await this.robots.assertAllowed(request.url);

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