import { NextRequest, NextResponse } from "next/server";

import { getArticlesByCategory } from "@/lib/articles";
import { parseFilInfoCursor } from "@/lib/fil-info-pagination";
import { getTranslatedFilInfoArticles } from "@/lib/fil-info-localized";
import { isTranslatedFilInfoLocale } from "@/lib/fil-info-locale";

export async function GET(request: NextRequest) {
  const cursor = parseFilInfoCursor(request.nextUrl.searchParams.get("after"));
  const locale = request.nextUrl.searchParams.get("locale") ?? "fr";

  if (!cursor) {
    return NextResponse.json({ message: "Curseur invalide." }, { status: 400 });
  }

  const options = {
    limit: 1,
    after: cursor,
    prioritizePinned: false,
    excludePinned: true,
  };
  const newerArticles = isTranslatedFilInfoLocale(locale)
    ? await getTranslatedFilInfoArticles(locale, options)
    : locale === "fr"
      ? await getArticlesByCategory("ACTUALITÉ", options)
      : null;
  if (!newerArticles) return NextResponse.json({ message: "Langue invalide." }, { status: 400 });

  return NextResponse.json({ available: newerArticles.length > 0 });
}
