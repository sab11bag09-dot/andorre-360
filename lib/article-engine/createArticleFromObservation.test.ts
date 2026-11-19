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

function makeDependencies(observation: ObservationWithSource | null) {
  const findById = vi.fn(async () => observation);
  const markProcessed = vi.fn(async () => undefined);
  const createDraft = vi.fn(async () => 42);
  const updateDraft = vi.fn(async () => undefined);

  const prepareArticle = vi.fn(async () => ({
    title: "Titre test",
    description: "Premier paragraphe.",
    content: "Premier paragraphe.",
    category: "SOCIÉTÉ",
    author: "Source test",
  }));

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
    const { dependencies, findById } = makeDependencies(null);

    await expect(
      createArticleFromObservation(0, dependencies),
    ).rejects.toThrow("Identifiant d’observation invalide.");

    expect(findById).not.toHaveBeenCalled();
  });

  it("refuse une observation vide", async () => {
    const observation = makeObservation({ content: "   " });
    const { dependencies, createDraft, updateDraft } =
      makeDependencies(observation);

    await expect(
      createArticleFromObservation(observation.id, dependencies),
    ).rejects.toThrow("Le contenu collecté est insuffisant");

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

    const result = await createArticleFromObservation(
      observation.id,
      dependencies,
    );

    expect(result).toEqual({ articleId: 12 });
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

    const result = await createArticleFromObservation(
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
        aiRewrittenAt: expect.any(Date),
      }),
    );

    expect(markProcessed).toHaveBeenCalledWith(1, 12);
  });

  it("crée un brouillon puis rattache l’observation", async () => {
    const observation = makeObservation();

    const {
      dependencies,
      createDraft,
      updateDraft,
      markProcessed,
      prepareArticle,
    } = makeDependencies(observation);

    const result = await createArticleFromObservation(
      observation.id,
      dependencies,
    );

    expect(result.articleId).toBe(42);
    expect(updateDraft).not.toHaveBeenCalled();

    expect(prepareArticle).toHaveBeenCalledWith({
      originalTitle: observation.title,
      originalContent: "Premier paragraphe.",
      sourcePublishedAt: null,
      generatedAt: expect.any(Date),
      sourceName: observation.source.name,
      sourceCategory: observation.source.category,
    });

    expect(createDraft).toHaveBeenCalledWith({
      title: "Titre test",
      description: "Premier paragraphe.",
      content: "Premier paragraphe.",
      category: "SOCIÉTÉ",
      author: "Rédaction ANDORRE 360",
      image: "/images/global/hero.jpg",
      aiRewrittenAt: expect.any(Date),
    });

    expect(markProcessed).toHaveBeenCalledWith(1, 42);
  });

  it("normalise la catégorie proposée par le générateur", async () => {
    const observation = makeObservation();
    const {
      dependencies,
      createDraft,
      prepareArticle,
    } = makeDependencies(observation);

    prepareArticle.mockResolvedValue({
      title: "Titre test",
      description: "Premier paragraphe.",
      content: "Premier paragraphe.",
      category: "PRESSE",
      author: "Source test",
    });

    await createArticleFromObservation(
      observation.id,
      dependencies,
    );

    expect(createDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "ACTUALITÉ",
      }),
    );
  });

  it("conserve ILS_EN_PARLENT pour une source de communiqué politique", async () => {
    const observation = makeObservation({
      source: {
        id: 2,
        name: "Parti test",
        category: "ILS_EN_PARLENT",
      },
    } as Partial<ObservationWithSource>);

    const { dependencies, createDraft } =
      makeDependencies(observation);

    await createArticleFromObservation(
      observation.id,
      dependencies,
    );

    expect(createDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "ILS_EN_PARLENT",
      }),
    );
  });

  it("garde la liste de faits hors de l’article et la consigne dans l’audit", async () => {
    const observation = makeObservation();
    const { dependencies, createDraft, prepareArticle } =
      makeDependencies(observation);
    const eventCreate = vi.fn(async () => undefined);
    const factSheet = [
      "Le Comú de Canillo a ouvert les inscriptions le 3 septembre 2026.",
    ];

    prepareArticle.mockResolvedValue({
      title: "Titre test",
      description: "Premier paragraphe.",
      content: "Premier paragraphe.",
      category: "SOCIÉTÉ",
      author: "Source test",
      factSheet,
    } as Awaited<ReturnType<typeof prepareArticle>>);

    await createArticleFromObservation(observation.id, {
      ...dependencies,
      editorialEventWriter: {
        editorialEvent: { create: eventCreate },
      } as unknown as NonNullable<
        CreateArticleFromObservationDependencies["editorialEventWriter"]
      >,
    });

    expect(createDraft).toHaveBeenCalledWith(
      expect.not.objectContaining({ factSheet: expect.anything() }),
    );

    const [[event]] = eventCreate.mock.calls as unknown as [
      [{ data: { details: string } }],
    ];

    expect(JSON.parse(event.data.details)).toMatchObject({
      eventType: "auto_publication_evaluated",
      factSheet,
    });
  });

  describe("contrôle de ressemblance avec la source", () => {
    const LONG_SOURCE =
      "Le Comú de Canillo a ouvert les inscriptions au camp d’été destiné aux enfants de 4 à 12 ans. " +
      "Les familles peuvent s’inscrire en ligne jusqu’au 30 juin. Le camp proposera des activités sportives, " +
      "culturelles et de montagne pendant tout le mois de juillet, avec un encadrement assuré par des moniteurs diplômés.";

    function makeEventWriter() {
      const eventCreate = vi.fn(async () => undefined);
      return {
        eventCreate,
        editorialEventWriter: {
          editorialEvent: { create: eventCreate },
        } as unknown as NonNullable<
          CreateArticleFromObservationDependencies["editorialEventWriter"]
        >,
      };
    }

    it("bloque un article trop proche du texte source sans créer de brouillon", async () => {
      const observation = makeObservation({ content: LONG_SOURCE });
      const {
        dependencies,
        createDraft,
        updateDraft,
        markProcessed,
        prepareArticle,
      } = makeDependencies(observation);
      const { eventCreate, editorialEventWriter } = makeEventWriter();

      prepareArticle.mockResolvedValue({
        title: "Titre test",
        description: "Premier paragraphe.",
        content: LONG_SOURCE,
        category: "SOCIÉTÉ",
        author: "Source test",
      });

      await expect(
        createArticleFromObservation(observation.id, {
          ...dependencies,
          editorialEventWriter,
        }),
      ).rejects.toThrow("trop proche du texte source");

      expect(createDraft).not.toHaveBeenCalled();
      expect(updateDraft).not.toHaveBeenCalled();
      expect(markProcessed).not.toHaveBeenCalled();
      expect(eventCreate).not.toHaveBeenCalled();
    });

    it("consigne la mesure de ressemblance dans l’audit d’un article accepté", async () => {
      const observation = makeObservation({ content: LONG_SOURCE });
      const { dependencies, createDraft, prepareArticle } =
        makeDependencies(observation);
      const { eventCreate, editorialEventWriter } = makeEventWriter();

      prepareArticle.mockResolvedValue({
        title: "Canillo ouvre son camp d’été aux 4-12 ans",
        description: "Les inscriptions sont ouvertes jusqu’au 30 juin 2026.",
        content:
          "Les enfants âgés de 4 à 12 ans pourront participer cet été au camp organisé par la paroisse. " +
          "Inscriptions sur internet, au plus tard le 30 juin 2026.",
        category: "SOCIÉTÉ",
        author: "Source test",
      });

      await createArticleFromObservation(observation.id, {
        ...dependencies,
        editorialEventWriter,
      });

      expect(createDraft).toHaveBeenCalledTimes(1);

      const [[event]] = eventCreate.mock.calls as unknown as [
        [{ data: { details: string } }],
      ];

      expect(JSON.parse(event.data.details).sourceSimilarity).toMatchObject({
        shingleSize: 5,
        blocked: false,
        sharedShingleRatio: expect.any(Number),
        longestSharedRun: expect.any(Number),
      });
    });
  });

  describe("contrôle de fidélité aux faits", () => {
    const FACTS = [
      "Le Comú de Canillo a ouvert le 3 septembre 2026 les inscriptions au camp d’été pour les enfants de 4 à 12 ans.",
    ];

    function setup(article: { title: string; description: string; content: string }) {
      const observation = makeObservation({
        publishedAt: new Date("2026-09-03T08:00:00.000Z"),
      } as Partial<ObservationWithSource>);
      const deps = makeDependencies(observation);
      const eventCreate = vi.fn(async () => undefined);

      deps.prepareArticle.mockResolvedValue({
        ...article,
        category: "SOCIÉTÉ",
        author: "Source test",
        factSheet: FACTS,
      } as Awaited<ReturnType<typeof deps.prepareArticle>>);

      return {
        ...deps,
        observation,
        eventCreate,
        run: () =>
          createArticleFromObservation(observation.id, {
            ...deps.dependencies,
            editorialEventWriter: {
              editorialEvent: { create: eventCreate },
            } as unknown as NonNullable<
              CreateArticleFromObservationDependencies["editorialEventWriter"]
            >,
          }),
      };
    }

    it("bloque un article qui contient un chiffre absent des faits, sans créer de brouillon", async () => {
      const { run, createDraft, updateDraft, markProcessed, eventCreate } = setup({
        title: "Canillo ouvre son camp d’été",
        description: "Les inscriptions ont ouvert le 3 septembre 2026.",
        content: "Le camp accueillera 150 enfants de 4 à 12 ans.",
      });

      await expect(run()).rejects.toThrow(
        "Article bloqué : chiffres absents de la liste de faits : 150",
      );

      expect(createDraft).not.toHaveBeenCalled();
      expect(updateDraft).not.toHaveBeenCalled();
      expect(markProcessed).not.toHaveBeenCalled();
      expect(eventCreate).not.toHaveBeenCalled();
    });

    it("consigne les noms propres à vérifier sans bloquer l’article", async () => {
      const { run, createDraft, eventCreate } = setup({
        title: "Canillo ouvre son camp d’été",
        description: "Les inscriptions ont ouvert le 3 septembre 2026.",
        content: "Selon la conseillère Marta Puig, le camp accueillera les enfants de 4 à 12 ans.",
      });

      await run();

      expect(createDraft).toHaveBeenCalledTimes(1);
      const [[event]] = eventCreate.mock.calls as unknown as [
        [{ data: { details: string } }],
      ];
      expect(JSON.parse(event.data.details).factFidelity).toEqual({
        unsupportedNumbers: [],
        namesToCheck: ["Marta", "Puig"],
        blocked: false,
      });
    });

    it("ne contrôle pas un article produit sans liste de faits", async () => {
      const observation = makeObservation();
      const { dependencies, createDraft, prepareArticle } =
        makeDependencies(observation);

      prepareArticle.mockResolvedValue({
        title: "Titre test",
        description: "Premier paragraphe.",
        content: "Le camp accueillera 150 enfants.",
        category: "SOCIÉTÉ",
        author: "Source test",
      });

      await createArticleFromObservation(observation.id, dependencies);

      expect(createDraft).toHaveBeenCalledTimes(1);
    });
  });
});
