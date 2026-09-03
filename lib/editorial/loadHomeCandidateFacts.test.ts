import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findMany,
    },
  },
}));

import { loadHomeCandidateFacts } from "./loadHomeCandidateFacts";

function makeDatabaseArticle(overrides: Record<string, unknown> = {}) {
  const publishedAt = new Date("2026-09-02T10:00:00.000Z");

  return {
    id: 42,
    title: "Une information importante en Andorre",
    description: "Description",
    content: "Contenu complet",
    category: "ACTUALITÉ",
    image: " /images/article.jpg ",
    videoUrl: null,
    publishedAt,
    createdAt: publishedAt,
    translations: [
      {
        locale: "CA",
        status: "PUBLISHED",
      },
      {
        locale: "ES",
        status: "PUBLISHED",
      },
    ],
    observations: [
      {
        id: 7,
        url: "https://source.example/article",
        publishedAt,
        collectedAt: publishedAt,
        source: {
          id: 3,
          name: "Source officielle",
          url: "https://source.example",
          trustLevel: "OFFICIAL",
          organizationType: "GOVERNMENT",
          publicationMode: "AUTO",
        },
      },
    ],
    ...overrides,
  };
}

describe("loadHomeCandidateFacts", () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it("refuse une limite invalide avant la requête", async () => {
    await expect(loadHomeCandidateFacts(0)).rejects.toThrow(
      "La limite des candidats doit être un entier positif.",
    );

    expect(findMany).not.toHaveBeenCalled();
  });

  it("demande uniquement des articles trilingues et issus de sources fiables", async () => {
    await loadHomeCandidateFacts();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          editorialStatus: "PUBLISHED",
          category: {
            not: "ILS_EN_PARLENT",
          },
          translations: {
            some: {
              locale: "CA",
              status: "PUBLISHED",
            },
          },
          AND: expect.arrayContaining([
            {
              translations: {
                some: {
                  locale: "ES",
                  status: "PUBLISHED",
                },
              },
            },
            {
              observations: {
                some: {
                  source: {
                    active: true,
                    trustLevel: {
                      in: ["HIGH", "OFFICIAL"],
                    },
                  },
                },
              },
            },
          ]),
        }),
        take: 200,
      }),
    );
  });

  it("normalise et expose les faits nécessaires à l’évaluation", async () => {
    findMany.mockResolvedValue([makeDatabaseArticle()]);

    await expect(loadHomeCandidateFacts()).resolves.toEqual([
      {
        articleId: 42,
        title: "Une information importante en Andorre",
        description: "Description",
        content: "Contenu complet",
        category: "ACTUALITÉ",
        image: "/images/article.jpg",
        videoUrl: null,
        publishedAt: new Date("2026-09-02T10:00:00.000Z"),
        translations: {
          catalanPublished: true,
          spanishPublished: true,
        },
        observation: {
          id: 7,
          url: "https://source.example/article",
          publishedAt: new Date("2026-09-02T10:00:00.000Z"),
          collectedAt: new Date("2026-09-02T10:00:00.000Z"),
        },
        source: {
          id: 3,
          name: "Source officielle",
          url: "https://source.example",
          trustLevel: "OFFICIAL",
          organizationType: "GOVERNMENT",
          publicationMode: "AUTO",
        },
      },
    ]);
  });

  it("écarte par sécurité un résultat incomplet renvoyé par la base", async () => {
    findMany.mockResolvedValue([
      makeDatabaseArticle({
        image: " ",
      }),
      makeDatabaseArticle({
        id: 43,
        observations: [],
      }),
      makeDatabaseArticle({
        id: 44,
        translations: [
          {
            locale: "CA",
            status: "PUBLISHED",
          },
        ],
      }),
    ]);

    await expect(loadHomeCandidateFacts()).resolves.toEqual([]);
  });
});
