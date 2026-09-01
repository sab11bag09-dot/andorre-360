import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { ObservationWithSource } from "../source-engine/repositories/ObservationRepository";

const {
  generateArticleTranslations,
  translationFindMany,
  translationUpdate,
} = vi.hoisted(() => ({
  generateArticleTranslations: vi.fn(),
  translationFindMany: vi.fn(),
  translationUpdate: vi.fn(),
}));

vi.mock("./generateArticleTranslations", () => ({
  generateArticleTranslations,
}));

vi.mock("../prisma", () => ({
  prisma: {
    article: {
      update: vi.fn(),
    },
    articleTranslation: {
      findMany: translationFindMany,
      update: translationUpdate,
    },
  },
}));

import {
  createArticleFromObservation,
  type CreateArticleFromObservationDependencies,
} from "./createArticleFromObservation";

const originalEnvironment = {
  enabled:
    process.env.AI_AUTO_PUBLICATION_ENABLED,
  emergencyStop:
    process.env.AI_AUTO_PUBLICATION_EMERGENCY_STOP,
  sourceIds:
    process.env.AI_AUTO_PUBLICATION_SOURCE_IDS,
  multilingual:
    process.env.MULTILINGUAL_PUBLICATION_ENABLED,
};

function restoreEnvironment(
  key: keyof NodeJS.ProcessEnv,
  value: string | undefined,
): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function makeObservation(): ObservationWithSource {
  return {
    id: 9,
    sourceId: 5,
    articleId: null,
    title:
      "Une actualité suffisamment descriptive",
    url:
      "https://source.example/article",
    publishedAt: null,
    content: "x".repeat(300),
    processed: false,
    processedAt: null,
    collectedAt:
      new Date("2026-09-01T00:00:00Z"),
    createdAt:
      new Date("2026-09-01T00:00:00Z"),
    updatedAt:
      new Date("2026-09-01T00:00:00Z"),
    source: {
      id: 5,
      name: "Source officielle",
      category: "SOCIÉTÉ",
      url: "https://source.example",
      publicationMode: "AUTO",
      trustLevel: "OFFICIAL",
    },
  } as unknown as ObservationWithSource;
}

function makeDependencies() {
  const observation = makeObservation();
  const markProcessed =
    vi.fn(async () => undefined);
  const publishDraft =
    vi.fn(async () => undefined);

  const dependencies: CreateArticleFromObservationDependencies = {
    observationRepository: {
      findById: vi.fn(
        async () => observation,
      ),
      markProcessed,
    },
    articleRepository: {
      createDraft: vi.fn(
        async () => 42,
      ),
      updateDraft: vi.fn(
        async () => undefined,
      ),
      publishDraft,
    },
    editorialGenerator: {
      prepareArticle: vi.fn(
        async () => ({
          title:
            "Une actualité suffisamment descriptive",
          description:
            "Description suffisamment descriptive.",
          content: "x".repeat(300),
          category: "SOCIÉTÉ",
          author: "Source officielle",
        }),
      ),
    },
  };

  return {
    dependencies,
    markProcessed,
    publishDraft,
  };
}

describe("publication automatique multilingue", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.AI_AUTO_PUBLICATION_ENABLED =
      "true";
    process.env.AI_AUTO_PUBLICATION_EMERGENCY_STOP =
      "false";
    process.env.AI_AUTO_PUBLICATION_SOURCE_IDS =
      "5";
    process.env.MULTILINGUAL_PUBLICATION_ENABLED =
      "true";

    generateArticleTranslations.mockResolvedValue({
      articleId: 42,
      translations: [
        {
          locale: "CA",
          translationId: 101,
          action: "created",
        },
        {
          locale: "ES",
          translationId: 102,
          action: "created",
        },
      ],
    });

    translationUpdate.mockResolvedValue({});
    translationFindMany.mockResolvedValue([
      {
        locale: "CA",
        status: "PUBLISHED",
      },
      {
        locale: "ES",
        status: "PUBLISHED",
      },
    ]);
  });

  afterEach(() => {
    restoreEnvironment(
      "AI_AUTO_PUBLICATION_ENABLED",
      originalEnvironment.enabled,
    );
    restoreEnvironment(
      "AI_AUTO_PUBLICATION_EMERGENCY_STOP",
      originalEnvironment.emergencyStop,
    );
    restoreEnvironment(
      "AI_AUTO_PUBLICATION_SOURCE_IDS",
      originalEnvironment.sourceIds,
    );
    restoreEnvironment(
      "MULTILINGUAL_PUBLICATION_ENABLED",
      originalEnvironment.multilingual,
    );
  });

  it("publie le français après les traductions CA et ES", async () => {
    const {
      dependencies,
      markProcessed,
      publishDraft,
    } = makeDependencies();

    await createArticleFromObservation(
      9,
      dependencies,
    );

    expect(
      generateArticleTranslations,
    ).toHaveBeenCalledWith(
      42,
      expect.any(Object),
    );

    expect(translationUpdate).toHaveBeenCalledTimes(
      2,
    );

    expect(
      translationFindMany.mock.invocationCallOrder[0],
    ).toBeLessThan(
      publishDraft.mock.invocationCallOrder[0],
    );

    expect(publishDraft).toHaveBeenCalledWith(
      42,
    );
    expect(markProcessed).toHaveBeenCalledWith(
      9,
      42,
    );
  });

  it("ne publie pas le français si la traduction échoue", async () => {
    const {
      dependencies,
      markProcessed,
      publishDraft,
    } = makeDependencies();

    generateArticleTranslations.mockRejectedValue(
      new Error("Traduction indisponible"),
    );

    await expect(
      createArticleFromObservation(
        9,
        dependencies,
      ),
    ).rejects.toThrow(
      "Traduction indisponible",
    );

    expect(publishDraft).not.toHaveBeenCalled();
    expect(markProcessed).not.toHaveBeenCalled();
  });

  it("ne publie pas le français si une langue reste absente", async () => {
    const {
      dependencies,
      markProcessed,
      publishDraft,
    } = makeDependencies();

    translationFindMany.mockResolvedValue([
      {
        locale: "CA",
        status: "PUBLISHED",
      },
    ]);

    await expect(
      createArticleFromObservation(
        9,
        dependencies,
      ),
    ).rejects.toThrow(
      "Les traductions suivantes doivent être publiées avant l’article : ES.",
    );

    expect(publishDraft).not.toHaveBeenCalled();
    expect(markProcessed).not.toHaveBeenCalled();
  });
});
