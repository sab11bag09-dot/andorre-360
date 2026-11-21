/**
 * Prépare la base du test de mise en page : la supprime, y applique toutes
 * les migrations, puis la remplit avec le jeu de données déterministe.
 *
 * Lancé par Playwright avant chaque serveur (`playwright.config.ts`), avec le
 * nom du jeu de données (`LAYOUT_DATASET`). Refuse de s’exécuter sur une autre
 * base que `.playwright/mise-en-page-<jeu>.db`.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../../lib/generated/prisma/client";
import { layoutDatabaseUrl } from "./database";
import { buildLayoutDataset, type LayoutDatasetName } from "./dataset";

async function main() {
  const name = process.env.LAYOUT_DATASET as LayoutDatasetName | undefined;
  if (name !== "complet" && name !== "clairseme") {
    throw new Error("LAYOUT_DATASET doit valoir « complet » ou « clairseme ».");
  }

  const LAYOUT_DATABASE_URL = layoutDatabaseUrl(name);
  const LAYOUT_DATABASE_PATH = LAYOUT_DATABASE_URL.slice("file:".length);
  if (process.env.DATABASE_URL !== LAYOUT_DATABASE_URL) {
    throw new Error(
      `Base refusée : DATABASE_URL doit valoir ${LAYOUT_DATABASE_URL} pour le test de mise en page.`,
    );
  }

  mkdirSync(path.dirname(LAYOUT_DATABASE_PATH), { recursive: true });
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    rmSync(`${LAYOUT_DATABASE_PATH}${suffix}`, { force: true });
  }

  const migration = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: LAYOUT_DATABASE_URL },
    stdio: "inherit",
  });
  if (migration.status !== 0) {
    throw new Error("Échec des migrations de la base du test de mise en page.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: LAYOUT_DATABASE_URL }),
  });

  try {
    const dataset = buildLayoutDataset(name);

    for (const article of dataset) {
      await prisma.article.create({
        data: {
          ...article,
          content: `<p>${article.title}.</p>`,
          author: "Rédaction ANDORRE 360",
          readingTime: "3 min",
          published: true,
          editorialStatus: "PUBLISHED",
          createdAt: article.publishedAt,
        },
      });
    }

    // L’Édito de la une ne vient que d’un placement éditorial.
    const editorial = await prisma.article.create({
      data: {
        slug: "essai-edito",
        title: "Pourquoi l’Andorre doit préparer dès maintenant l’après-saison",
        category: "ACTUALITÉ",
        description: "La voix de la rédaction sur les choix qui attendent le pays.",
        content: "<p>Édito.</p>",
        image: "/images/global/hero.jpg",
        author: "Rédaction ANDORRE 360",
        readingTime: "4 min",
        filInfoVisible: false,
        published: true,
        editorialStatus: "PUBLISHED",
        publishedAt: new Date(Date.UTC(2026, 9, 1, 8, 0, 0)),
        createdAt: new Date(Date.UTC(2026, 9, 1, 8, 0, 0)),
      },
    });
    await prisma.publication.create({
      data: { articleId: editorial.id, channel: "site", pageKey: "home", zone: "editorial" },
    });

    console.log(`Base du test de mise en page « ${name} » prête : ${dataset.length + 1} articles.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
