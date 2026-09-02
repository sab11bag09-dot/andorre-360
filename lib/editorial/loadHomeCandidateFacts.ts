import { prisma } from "@/lib/prisma";
import { PUBLIC_ARTICLE_FILTER } from "@/lib/public-article";

const DEFAULT_HOME_CANDIDATE_LIMIT = 200;

export type HomeCandidateFacts = {
  articleId: number;
  title: string;
  description: string;
  content: string;
  category: string;
  image: string;
  videoUrl: string | null;
  publishedAt: Date;
  translations: {
    catalanPublished: boolean;
    spanishPublished: boolean;
  };
  observation: {
    id: number;
    url: string;
    publishedAt: Date | null;
    collectedAt: Date;
  };
  source: {
    id: number;
    name: string;
    url: string;
    trustLevel: "HIGH" | "OFFICIAL";
    organizationType: string;
    publicationMode: string;
  };
};

export async function loadHomeCandidateFacts(
  limit = DEFAULT_HOME_CANDIDATE_LIMIT,
): Promise<HomeCandidateFacts[]> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("La limite des candidats doit être un entier positif.");
  }

  const articles = await prisma.article.findMany({
    where: {
      ...PUBLIC_ARTICLE_FILTER,
      category: {
        not: "ILS_EN_PARLENT",
      },
      image: {
        not: "",
      },
      translations: {
        some: {
          locale: "CA",
          status: "PUBLISHED",
        },
      },
      AND: [
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
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      category: true,
      image: true,
      videoUrl: true,
      publishedAt: true,
      createdAt: true,
      translations: {
        where: {
          locale: {
            in: ["CA", "ES"],
          },
          status: "PUBLISHED",
        },
        select: {
          locale: true,
          status: true,
        },
      },
      observations: {
        where: {
          source: {
            active: true,
            trustLevel: {
              in: ["HIGH", "OFFICIAL"],
            },
          },
        },
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            collectedAt: "desc",
          },
          {
            id: "desc",
          },
        ],
        take: 1,
        select: {
          id: true,
          url: true,
          publishedAt: true,
          collectedAt: true,
          source: {
            select: {
              id: true,
              name: true,
              url: true,
              trustLevel: true,
              organizationType: true,
              publicationMode: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: limit,
  });

  return articles.flatMap((article) => {
    const image = article.image?.trim();
    const observation = article.observations[0];

    if (
      !image ||
      !observation ||
      (observation.source.trustLevel !== "HIGH" &&
        observation.source.trustLevel !== "OFFICIAL")
    ) {
      return [];
    }

    const catalanPublished = article.translations.some(
      ({ locale, status }) => locale === "CA" && status === "PUBLISHED",
    );

    const spanishPublished = article.translations.some(
      ({ locale, status }) => locale === "ES" && status === "PUBLISHED",
    );

    if (!catalanPublished || !spanishPublished) {
      return [];
    }

    return [
      {
        articleId: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        category: article.category,
        image,
        videoUrl: article.videoUrl,
        publishedAt: article.publishedAt ?? article.createdAt,
        translations: {
          catalanPublished,
          spanishPublished,
        },
        observation: {
          id: observation.id,
          url: observation.url,
          publishedAt: observation.publishedAt,
          collectedAt: observation.collectedAt,
        },
        source: {
          id: observation.source.id,
          name: observation.source.name,
          url: observation.source.url,
          trustLevel: observation.source.trustLevel,
          organizationType: observation.source.organizationType,
          publicationMode: observation.source.publicationMode,
        },
      },
    ];
  });
}
