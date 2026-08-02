import { NextRequest, NextResponse } from "next/server";

import { getArticlesByCategory } from "@/lib/articles";
import { parseFilInfoCursor } from "@/lib/fil-info-pagination";

export async function GET(request: NextRequest) {
  const cursor = parseFilInfoCursor(request.nextUrl.searchParams.get("after"));

  if (!cursor) {
    return NextResponse.json({ message: "Curseur invalide." }, { status: 400 });
  }

  const newerArticles = await getArticlesByCategory("ACTUALITÉ", {
    limit: 1,
    after: cursor,
    prioritizePinned: false,
    excludePinned: true,
  });

  return NextResponse.json({ available: newerArticles.length > 0 });
}
