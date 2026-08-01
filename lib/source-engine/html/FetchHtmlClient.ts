import { HtmlClient } from "./HtmlClient";

export class FetchHtmlClient implements HtmlClient {
  async get(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Impossible de récupérer ${url} (${response.status}).`,
      );
    }

    return response.text();
  }
}