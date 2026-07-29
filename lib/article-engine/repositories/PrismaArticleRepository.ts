import { prisma } from "@/lib/prisma";

import type {
  ArticleDraftInput,
  ArticleRepository,
} from "./ArticleRepository";

export class PrismaArticleRepository implements ArticleRepository {
  async createDraft(input: ArticleDraftInput): Promise<number> {
    const article = await prisma.article.create({
      data: {
        slug: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        content: input.content,
        category: input.category,
        image: "",
        author: input.author,
        readingTime: "1 min",
        published: false,
      },
      select: {
        id: true,
      },
    });

    return article.id;
  }
}