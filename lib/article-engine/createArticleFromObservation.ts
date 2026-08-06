import type { ObservationRepository } from "../source-engine/repositories/ObservationRepository";
import { PrismaObservationRepository } from "../source-engine/repositories/PrismaObservationRepository";
import { DeterministicEditorialGenerator } from "./generators/DeterministicEditorialGenerator";
import { OpenAiEditorialGenerator } from "./generators/OpenAiEditorialGenerator";
import type { EditorialGenerator } from "./generators/EditorialGenerator";
import { prepareAutoPublication } from "./autoPublicationOrchestration";
import { generateArticleTranslations } from "./generateArticleTranslations";
import {
  recordSystemEditorialEvent,
  type EditorialEventWriter,
} from "../editorial-history";
import type { ArticleRepository } from "./repositories/ArticleRepository";
import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";
import { prisma } from "../prisma";

export interface CreateArticleFromObservationResult {
  articleId: number;
}

export interface CreateArticleFromObservationDependencies {
  observationRepository: Pick<
    ObservationRepository,
    "findById" | "markProcessed"
  >;
  articleRepository: Pick<
    ArticleRepository,
    "createDraft" | "updateDraft" | "publishDraft"
  >;
  editorialGenerator: Pick<
    EditorialGenerator,
    "prepareArticle"
  >;
  editorialEventWriter?: EditorialEventWriter;
}

function isAiMultilingualSource(sourceId: number): boolean {
  const configured = process.env.AI_MULTILINGUAL_SOURCE_IDS
    ?.split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter(Number.isInteger);

  return configured?.includes(sourceId) ?? sourceId === 54;
}

const defaultDependencies: CreateArticleFromObservationDependencies = {
  observationRepository: new PrismaObservationRepository(),
  articleRepository: new PrismaArticleRepository(),
  editorialGenerator: new DeterministicEditorialGenerator(),
  editorialEventWriter: prisma,
};

export async function createArticleFromObservation(
  observationId: number,
  dependencies = defaultDependencies,
  options: { regenerate?: boolean } = {},
): Promise<CreateArticleFromObservationResult> {
  if (!Number.isInteger(observationId) || observationId <= 0) {
    throw new Error("Identifiant d’observation invalide.");
  }

  const observation =
    await dependencies.observationRepository.findById(observationId);

  if (!observation) {
    throw new Error("Observation introuvable.");
  }

  if (observation.processed && observation.articleId !== null && !options.regenerate) {
    return { articleId: observation.articleId };
  }

  if (observation.processed && !options.regenerate) {
    throw new Error(
      "Cette observation est marquée comme traitée sans article associé.",
    );
  }

  const content = observation.content?.trim();

  if (!content) {
    throw new Error(
      "Le contenu collecté est insuffisant pour préparer un article.",
    );
  }

  const aiGenerator =
    isAiMultilingualSource(observation.source.id) && process.env.OPENAI_API_KEY?.trim()
      ? new OpenAiEditorialGenerator({
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_TRANSLATION_MODEL,
        })
      : null;
  const editorialGenerator = aiGenerator ?? dependencies.editorialGenerator;

  let draft = await editorialGenerator.prepareArticle({
    originalTitle: observation.title,
    originalContent: content,
    sourceName: observation.source.name,
    sourceCategory: observation.source.category,
  });

  if (aiGenerator) {
    const french = await aiGenerator.translateArticle({
      locale: "FR",
      title: draft.title,
      description: draft.description,
      content: draft.content,
    });

    draft = {
      ...draft,
      title: french.title,
      description: french.description,
      content: french.content,
    };
  }

  const editorialDraft = {
    ...draft,
    category: draft.category.trim().toUpperCase(),
  };

  let articleId: number;

  if (observation.articleId !== null) {
    articleId = observation.articleId;
    if (options.regenerate) {
      await prisma.article.update({
        where: { id: articleId },
        data: editorialDraft,
      });
    } else {
      await dependencies.articleRepository.updateDraft(articleId, editorialDraft);
    }
  } else {
    articleId = await dependencies.articleRepository.createDraft(editorialDraft);
  }

  const autoPublication = prepareAutoPublication({
    sourceId: observation.source.id,
    observationId: observation.id,
    sourceUrl: observation.source.url,
    observationUrl: observation.url,
    publicationMode: observation.source.publicationMode,
    trustLevel: observation.source.trustLevel,
    title: draft.title,
    content: draft.content,
  });

  if (dependencies.editorialEventWriter) {
    await recordSystemEditorialEvent(
      dependencies.editorialEventWriter,
      {
        action: "ARTICLE_CREATED",
        articleId,
        details: {
          eventType: "auto_publication_evaluated",
          ...autoPublication.audit,
        },
      },
    );
  }

  if (autoPublication.decision.allowed) {
    const publishDraft = dependencies.articleRepository.publishDraft;

    if (!options.regenerate) {
      if (!publishDraft) {
        throw new Error(
          "La publication automatique est autorisée mais indisponible.",
        );
      }

      await publishDraft(articleId);
    }

    try {
      const generatedTranslations = await generateArticleTranslations(articleId, {
        articleRepository: new PrismaArticleRepository(),
        translationRepository: new PrismaArticleTranslationRepository(),
        editorialGenerator: aiGenerator ?? new DeterministicEditorialGenerator(),
      });

      await Promise.all(
        generatedTranslations.translations
          .filter(({ action }) => action !== "skipped")
          .map(({ translationId }) =>
            prisma.articleTranslation.update({
              where: { id: translationId },
              data: {
                status: "PUBLISHED",
                approvedAt: new Date(),
                publishedAt: new Date(),
              },
            }),
          ),
      );
    } catch (error) {
      console.error(
        "[AutoPublication] Traductions non générées",
        { articleId, error },
      );
    }
  }

  await dependencies.observationRepository.markProcessed(
    observation.id,
    articleId,
  );

  return { articleId };
}
