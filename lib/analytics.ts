import { prisma } from "@/lib/prisma";

function getTodayUtc(): Date {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );
}

export async function recordArticleView(
  articleId: number
): Promise<void> {
  const date = getTodayUtc();

  await prisma.articleAnalytics.upsert({
    where: {
      articleId_date: {
        articleId,
        date,
      },
    },

    update: {
      views: {
        increment: 1,
      },
    },

    create: {
      articleId,
      date,
      views: 1,
      uniqueVisitors: 0,
      totalReadingTime: 0,
      completedReads: 0,
    },
  });
}