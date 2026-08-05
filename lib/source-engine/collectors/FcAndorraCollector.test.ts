/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import type { Source } from "@/lib/generated/prisma/client";
import { FcAndorraCollector } from "./FcAndorraCollector";
import type { HtmlClient } from "../html/HtmlClient";

class FakeHtmlClient implements HtmlClient {
  async get(): Promise<string> {
    const payload: any = { props: { pageProps: { data: { page: {} } } } };
    payload.props.pageProps.data.page.grids = [{
      areas: [{
        modules: [{
          type: "list",
          subtype: "news",
          data: [{ title: "Notícia tricolor", slug: "noticia-tricolor", excerpt: "Contingut oficial del FC Andorra prou llarg per ser una observació útil." }],
        }],
      }],
    }];
    return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script>`;
  }
}

describe("FcAndorraCollector", () => {
  it("extrait les actualités publiques des données Next.js", async () => {
    const source = { url: "https://www.fcandorra.com/es/noticias" } as Source;
    const observations = await new FcAndorraCollector(new FakeHtmlClient()).collect(source);

    expect(observations).toEqual([
      expect.objectContaining({
        title: "Notícia tricolor",
        url: "https://www.fcandorra.com/es/noticias/noticia-tricolor",
      }),
    ]);
  });
});
