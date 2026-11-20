import { AUTOMATED_ARTICLE_AUTHOR } from "./editorialSignature";
import { assertMultilingualPublicationEnabled } from "../config/multilingualPublication";
import type { ObservationRepository } from "../source-engine/repositories/ObservationRepository";
import { PrismaObservationRepository } from "../source-engine/repositories/PrismaObservationRepository";
import { DeterministicEditorialGenerator } from "./generators/DeterministicEditorialGenerator";
import { OpenAiEditorialGenerator } from "./generators/OpenAiEditorialGenerator";
import type { EditorialGenerator } from "./generators/EditorialGenerator";
import { prepareAutoPublication } from "./autoPublicationOrchestration";
import { generateArticleTranslations } from "./generateArticleTranslations";
import {
  assertRequiredTranslationsPublished,
  REQUIRED_TRANSLATION_LOCALES,
} from "./multilingualPublicationGuard";
import { normalizeEditorialCategory } from "./normalizeEditorialCategory";
import {
  describeSourceSimilarity,
  evaluateSourceSimilarity,
  measureSourceSimilarity,
} from "./sourceSimilarity";
import { checkFactFidelity, describeFactFidelity } from "./factFidelity";
import {
  recordSystemEditorialEvent,
  type EditorialEventWriter,
} from "../editorial-history";
import type { ArticleRepository } from "./repositories/ArticleRepository";
import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";
import { prisma } from "../prisma";
import { prismaSourceImages, type SourceImageService } from "../media/sourceImages";
import { prismaBankImages, type BankImageService } from "../media/bankImages";

const GENERIC_ARTICLE_IMAGE = "/images/global/hero.jpg";

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
    "prepareArticle" | "auditMetadata"
  >;
  editorialEventWriter?: EditorialEventWriter;
  /** Reprise de la photo de la source ; sans elle, l’article garde l’image générique. */
  sourceImages?: SourceImageService;
  /** Banque d’images de la rédaction, quand la source ne fournit pas de photo. */
  bankImages?: BankImageService;
}

const defaultDependencies: CreateArticleFromObservationDependencies = {
  observationRepository: new PrismaObservationRepository(),
  articleRepository: new PrismaArticleRepository(),
  editorialGenerator: new DeterministicEditorialGenerator(),
  editorialEventWriter: prisma,
  sourceImages: prismaSourceImages,
  bankImages: prismaBankImages,
};

export async function createArticleFromObservation(
  observationId: number,
  dependencies = defaultDependencies,
  options: {
    regenerate?: boolean;
    allowAutoPublication?: boolean;
  } = {},
): Promise<CreateArticleFromObservationResult> {
  if (!Number.isInteger(observationId) || observationId <= 0) {
    throw new Error("Identifiant d’observation invalide.");
  }

  const observation =
    await dependencies.observationRepository.findById(observationId);

  if (!observation) {
    throw new Error("Observation introuvable.");
  }

  if (
    observation.processed &&
    observation.articleId !== null &&
    !options.regenerate
  ) {
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

  const usesProductionPipeline = dependencies === defaultDependencies;

  const aiGenerator = usesProductionPipeline
    ? (() => {
        const apiKey = process.env.OPENAI_API_KEY?.trim();

        if (!apiKey) {
          throw new Error(
            "OPENAI_API_KEY est obligatoire pour préparer un article.",
          );
        }

        return new OpenAiEditorialGenerator({
          apiKey,
          model: process.env.OPENAI_TRANSLATION_MODEL,
        });
      })()
    : null;

  const editorialGenerator = aiGenerator ?? dependencies.editorialGenerator;
  const generatedAt = new Date();

  const { factSheet, ...draft } = await editorialGenerator.prepareArticle({
    originalTitle: observation.title,
    originalContent: content,
    sourcePublishedAt: observation.publishedAt,
    generatedAt,
    sourceName: observation.source.name,
    sourceCategory: observation.source.category,
  });

  // Contrôle de ressemblance : un article trop proche de sa source n’est
  // jamais enregistré, ni comme nouveau brouillon ni en remplacement.
  const similarity = measureSourceSimilarity(
    { title: observation.title, content },
    draft,
  );
  const similarityEvaluation = evaluateSourceSimilarity(similarity);

  if (similarityEvaluation.blocked) {
    throw new Error(
      `Article bloqué : trop proche du texte source (${describeSourceSimilarity(similarity)}).`,
    );
  }

  // Contrôle de fidélité : un chiffre absent de la liste de faits bloque
  // l’article ; un nom propre absent est seulement consigné à vérifier.
  const factFidelity = factSheet
    ? checkFactFidelity({
        article: draft,
        facts: factSheet,
        sourceName: observation.source.name,
        contextDates: [observation.publishedAt, generatedAt],
      })
    : null;

  if (factFidelity && factFidelity.unsupportedNumbers.length > 0) {
    throw new Error(`Article bloqué : ${describeFactFidelity(factFidelity)}.`);
  }

  // Après les contrôles bloquants : un article refusé ne laisse aucune photo orpheline.
  const sourceImage = dependencies.sourceImages
    ? await dependencies.sourceImages.importImage({
        imageUrl: observation.imageUrl ?? null,
        imageRights: observation.imageRights ?? null,
        sourceName: observation.source.name,
        reuse: observation.source.imageReuse ?? "NONE",
        alt: draft.title,
      })
    : null;

  const sourceEditorialCategory = normalizeEditorialCategory(
    observation.source.category,
  );
  const category =
    sourceEditorialCategory === "ILS_EN_PARLENT"
      ? "ILS_EN_PARLENT"
      : normalizeEditorialCategory(draft.category);

  // Image : photo de la source si elle l’autorise, sinon banque de la rubrique, sinon image générique.
  const articleImage =
    sourceImage ??
    (dependencies.bankImages ? await dependencies.bankImages.pick(category) : null);

  const editorialDraft = {
    ...draft,
    // Quel que soit le générateur, la source ne signe jamais l’article.
    author: AUTOMATED_ARTICLE_AUTHOR,
    image: articleImage?.path ?? GENERIC_ARTICLE_IMAGE,
    aiRewrittenAt: generatedAt,
    category,
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
      await dependencies.articleRepository.updateDraft(
        articleId,
        editorialDraft,
      );
    }
  } else {
    articleId =
      await dependencies.articleRepository.createDraft(editorialDraft);
  }

  // Le rattachement vaut pour toute image de la médiathèque, de la source ou de la banque.
  if (articleImage && dependencies.sourceImages) {
    await dependencies.sourceImages.linkToArticle(articleImage.mediaId, articleId);
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
    generator: editorialGenerator.auditMetadata,
    runtimeConfig: options.allowAutoPublication
      ? undefined
      : {
          enabled: false,
          emergencyStop: false,
          sourceIds: [],
        },
  });

  if (dependencies.editorialEventWriter) {
    await recordSystemEditorialEvent(dependencies.editorialEventWriter, {
      action: "ARTICLE_CREATED",
      articleId,
      details: {
        eventType: "auto_publication_evaluated",
        ...autoPublication.audit,
        sourceSimilarity: {
          ...similarity,
          blocked: false,
        },
        ...(factSheet ? { factSheet } : {}),
        ...(factFidelity ? { factFidelity: { ...factFidelity, blocked: false } } : {}),
        ...(sourceImage ? { sourceImage } : {}),
      },
    });
  }

  // Une photo réservée aux essais interdit toute publication, automatique comprise.
  if (autoPublication.decision.allowed && !sourceImage?.testOnly) {
    assertMultilingualPublicationEnabled();

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

    const publishedTranslations = await prisma.articleTranslation.findMany({
      where: {
        articleId,
        locale: {
          in: [...REQUIRED_TRANSLATION_LOCALES],
        },
      },
      select: {
        locale: true,
        status: true,
      },
    });

    assertRequiredTranslationsPublished(publishedTranslations);

    if (!options.regenerate) {
      if (!dependencies.articleRepository.publishDraft) {
        throw new Error(
          "La publication automatique est autorisée mais indisponible.",
        );
      }

      await dependencies.articleRepository.publishDraft(articleId);
    }
  }

  await dependencies.observationRepository.markProcessed(
    observation.id,
    articleId,
  );

  return { articleId };
}
