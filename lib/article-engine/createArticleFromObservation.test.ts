import { describe, expect, it, vi } from "vitest";

import type { ObservationWithSource } from "../source-engine/repositories/ObservationRepository";
import {
  createArticleFromObservation,
  type CreateArticleFromObservationDependencies,
} from "./createArticleFromObservation";

function makeObservation(
  overrides: Partial<ObservationWithSource> = {},
): ObservationWithSource {
  return {
    id: 1,
    sourceId: 2,
    articleId: null,
    title: " Titre test ",
    url: "https://example.com/article",
    publishedAt: null,
    content: "  Premier paragraphe.  ",
    processed: false,
    processedAt: null,
    collectedAt: new Date("2026-07-31"),
    createdAt: new Date("2026-07-31"),
    updatedAt: new Date("2026-07-31"),
    source: {
      id: 2,
      name: "Source test",
      category: "SOCIÉTÉ",
    },
    ...overrides,
  } as unknown as ObservationWithSource;
}

function makeDependencies(
  observation: ObservationWithSource | null,
) {
  const findById = vi.fn(
    async () => observation,
  );

  const markProcessed = vi.fn(
    async () => undefined,
  );

  const createDraft = vi.fn(
    async () => 42,
  );

  const updateDraft = vi.fn(
    async () => undefined,
  );

  const prepareArticle = vi.fn(
    async () => ({
      title: "Titre test",
      description: "Premier paragraphe.",
      content: "Premier paragraphe.",
      category: "SOCIÉTÉ",
      author: "Source test",
    }),
  );

  const dependencies: CreateArticleFromObservationDependencies = {
    observationRepository: {
      findById,
      markProcessed,
    },
    articleRepository: {
      createDraft,
      updateDraft,
    },
    editorialGenerator: {
      prepareArticle,
    },
  };

  return {
    dependencies,
    findById,
    markProcessed,
    createDraft,
    updateDraft,
    prepareArticle,
  };
}

describe("createArticleFromObservation", () => {
  it("refuse un identifiant invalide", async () => {
    const { dependencies, findById } =
      makeDependencies(null);

    await expect(
      createArticleFromObservation(
        0,
        dependencies,
      ),
    ).rejects.toThrow(
      "Identifiant d’observation invalide.",
    );

    expect(findById).not.toHaveBeenCalled();
  });

  it("refuse une observation vide", async () => {
    const observation = makeObservation({
      content: "   ",
    });

    const {
      dependencies,
      createDraft,
      updateDraft,
    } = makeDependencies(observation);

    await expect(
      createArticleFromObservation(
        observation.id,
        dependencies,
      ),
    ).rejects.toThrow(
      "Le contenu collecté est insuffisant",
    );

    expect(createDraft).not.toHaveBeenCalled();
    expect(updateDraft).not.toHaveBeenCalled();
  });

  it("retourne l’article déjà traité sans doublon", async () => {
    const observation = makeObservation({
      articleId: 12,
      processed: true,
    });

    const {
      dependencies,
      createDraft,
      updateDraft,
      markProcessed,
    } = makeDependencies(observation);

    const result =
      await createArticleFromObservation(
        observation.id,
        dependencies,
      );

    expect(result).toEqual({
      articleId: 12,
    });

    expect(createDraft).not.toHaveBeenCalled();
    expect(updateDraft).not.toHaveBeenCalled();
    expect(markProcessed).not.toHaveBeenCalled();
  });

  it("met à jour le brouillon déjà associé", async () => {
    const observation = makeObservation({
      articleId: 12,
      processed: false,
    });

    const {
      dependencies,
      createDraft,
      updateDraft,
      markProcessed,
    } = makeDependencies(observation);

    const result =
      await createArticleFromObservation(
        observation.id,
        dependencies,
      );

    expect(result.articleId).toBe(12);
    expect(createDraft).not.toHaveBeenCalled();

    expect(updateDraft).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        title: "Titre test",
        content: "Premier paragraphe.",
      }),
    );

    expect(markProcessed).toHaveBeenCalledWith(
      1,
      12,
    );
  });

  it("crée un brouillon puis rattache l’observation", async () => {
    const observation = makeObservation();

    const {
      dependencies,
      createDraft,
      updateDraft,
      markProcessed,
    } = makeDependencies(observation);

    const result =
      await createArticleFromObservation(
        observation.id,
        dependencies,
      );

    expect(result.articleId).toBe(42);
    expect(updateDraft).not.toHaveBeenCalled();

    expect(createDraft).toHaveBeenCalledWith({
      title: "Titre test",
      description: "Premier paragraphe.",
      content: "Premier paragraphe.",
      category: "SOCIÉTÉ",
      author: "Source test",
    });

    expect(markProcessed).toHaveBeenCalledWith(
      1,
      42,
    );
  });
});