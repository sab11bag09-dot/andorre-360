import { prisma } from "@/lib/prisma";

import type {
  ArticleDraftInput,
  ArticleRepository,
} from "./ArticleRepository";

export class PrismaArticleRepository
  implements ArticleRepository
{
  async createDraft(
    input: ArticleDraftInput,
  ): Promise<number> {
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

  async updateDraft(
    articleId: number,
    input: ArticleDraftInput,
  ): Promise<void> {
    const result = await prisma.article.updateMany({
      where: {
        id: articleId,
        published: false,
      },
      data: {
        title: input.title,
        description: input.description,
        content: input.content,
        category: input.category,
        author: input.author,
        readingTime: "1 min",
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "Le brouillon associé est introuvable ou déjà publié.",
      );
    }
  }
}
