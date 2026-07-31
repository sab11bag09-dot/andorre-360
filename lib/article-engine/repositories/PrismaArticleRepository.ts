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
        editorialStatus: "AI_DRAFT",
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
        editorialStatus: {
          in: ["DRAFT", "AI_DRAFT"],
        },
      },
      data: {
        title: input.title,
        description: input.description,
        content: input.content,
        category: input.category,
        author: input.author,
        readingTime: "1 min",
        editorialStatus: "AI_DRAFT",
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "Le brouillon associé est introuvable ou déjà publié.",
      );
    }
  }
}
