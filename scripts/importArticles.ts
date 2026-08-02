import "dotenv/config";

import { articles } from "../data/articles";
import { prisma } from "../lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const validArticles = articles.filter(
    (article) => article && article.title
  );

  let imported = 0;
  let skipped = 0;

  for (const article of validArticles) {
    const slug =
      article.slug?.trim() || slugify(article.title);

    if (!slug) {
      skipped++;
      continue;
    }

    const isPublished = article.status !== "draft";
    const importedArticle = await prisma.article.upsert({
      where: {
        slug,
      },

      update: {
        title: article.title,
        category: article.category ?? "ACTUALITÉ",
        description: article.description,
        content: article.content,
        image: article.image,
        author: article.author,
        readingTime: article.readingTime,
        featured: article.format === "une",
        published: isPublished,
      },

      create: {
        slug,
        title: article.title,
        category: article.category ?? "ACTUALITÉ",
        description: article.description,
        content: article.content,
        image: article.image,
        author: article.author,
        readingTime: article.readingTime,
        featured: article.format === "une",
        published: isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    if (isPublished && importedArticle.publishedAt === null) {
      await prisma.article.update({
        where: {
          id: importedArticle.id,
        },
        data: {
          publishedAt: new Date(),
        },
      });
    }

    imported++;
  }

  console.log("");
  console.log(`✅ ${imported} articles importés ou mis à jour`);
  console.log(`⏭️ ${skipped} articles ignorés`);
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Échec de l’import :");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
