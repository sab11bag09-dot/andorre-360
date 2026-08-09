import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/lib/generated/prisma/client";

import type {
  ArticleDraftInput,
  ArticleForTranslation,
  ArticleRepository,
} from "./ArticleRepository";

export class PrismaArticleRepository
  implements ArticleRepository
{
  constructor(
    private readonly client: Pick<PrismaClient, "article"> = prisma,
  ) {}

  async findById(
    articleId: number,
  ): Promise<ArticleForTranslation | null> {
    return this.client.article.findUnique({
      where: {
        id: articleId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
      },
    });
  }

  async createDraft(
    input: ArticleDraftInput,
  ): Promise<number> {
    const article = await this.client.article.create({
      data: {
        slug: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        content: input.content,
        category: input.category,
        image: input.image ?? "",
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
    const result = await this.client.article.updateMany({
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
        ...(input.image !== undefined ? { image: input.image } : {}),
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
  async publishDraft(
    articleId: number,
  ): Promise<void> {
    const result = await this.client.article.updateMany({
      where: {
        id: articleId,
        published: false,
        editorialStatus: "AI_DRAFT",
      },
      data: {
        published: true,
        publishedAt: new Date(),
        editorialStatus: "PUBLISHED",
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "Le brouillon ne peut pas être publié automatiquement.",
      );
    }
  }
}
