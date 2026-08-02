import { NextRequest, NextResponse } from "next/server";

import { getArticlesByCategory } from "@/lib/articles";
import {
  createFilInfoCursor,
  parseFilInfoCursor,
} from "@/lib/fil-info-pagination";
import { FIL_INFO_PAGE_SIZE, getArticlePublicationDate } from "@/lib/fil-info";
import { normalizeFilInfoFormat } from "@/lib/fil-info-format";

export async function GET(request: NextRequest) {
  const rawCursor = request.nextUrl.searchParams.get("cursor");
  const cursor = parseFilInfoCursor(rawCursor);

  if (!cursor) {
    return NextResponse.json({ message: "Curseur invalide." }, { status: 400 });
  }

  const articles = await getArticlesByCategory("ACTUALITÉ", {
    limit: FIL_INFO_PAGE_SIZE + 1,
    before: cursor,
    prioritizePinned: false,
    excludePinned: true,
  });
  const hasMore = articles.length > FIL_INFO_PAGE_SIZE;
  const page = articles.slice(0, FIL_INFO_PAGE_SIZE);
  const lastArticle = page.at(-1);

  return NextResponse.json({
    entries: page.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      description: article.description,
      filInfoFormat: normalizeFilInfoFormat(article.filInfoFormat),
      publicationDate: getArticlePublicationDate(article).toISOString(),
    })),
    hasMore,
    nextCursor: lastArticle ? createFilInfoCursor(lastArticle) : null,
  });
}
