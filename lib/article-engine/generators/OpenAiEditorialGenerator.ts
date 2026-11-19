import OpenAI from "openai";

import { AUTOMATED_ARTICLE_AUTHOR } from "../editorialSignature";
import type {
  EditorialGenerator,
  PrepareArticleInput,
  PreparedArticle,
  PreparedTranslation,
  TranslateArticleInput,
} from "./EditorialGenerator";

const DEFAULT_MODEL = "gpt-5.6-terra";
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Rédaction en deux temps : un premier appel extrait une liste de faits de
 * la source, sans citations ni témoignages ; un second appel rédige l’article
 * à partir de cette liste seulement, sans jamais voir le texte source.
 *
 * Cette méthode éloigne le texte produit de la formulation de la source.
 * Elle ne tranche pas la question juridique de la reprise d’articles de
 * presse : un avis juridique reste nécessaire avant toute mise en ligne.
 */
export const OPENAI_EDITORIAL_PROMPT_VERSION =
  "editorial-facts-v2";

/** Nombre maximal de faits retenus pour un article. */
export const MAX_FACTS = 40;
/** Longueur maximale d’un fait, pour éviter la reprise de paragraphes entiers. */
export const MAX_FACT_LENGTH = 400;
/** Au-delà de ce nombre de mots, un passage entre guillemets est une citation. */
export const MAX_QUOTED_WORDS = 4;
/**
 * Longueur maximale d’un titre, espaces compris. Calibrée le 19 novembre
 * 2026 sur la page d’accueil : la plupart des emplacements de titre
 * contiennent de 56 à 65 caractères avant d’être coupés.
 */
export const MAX_TITLE_LENGTH = 70;

interface TranslationResponse {
  title: string;
  description: string;
  content: string;
}

interface StructuredResponseRequest {
  model: string;
  instructions: string;
  input: string;
  schemaName: string;
  schema: Record<string, unknown>;
}

export interface StructuredResponseClient {
  create(request: StructuredResponseRequest): Promise<string>;
}

interface OpenAiEditorialGeneratorOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  client?: StructuredResponseClient;
}

class OpenAiResponsesClient implements StructuredResponseClient {
  private readonly client: OpenAI;

  constructor(apiKey: string, timeoutMs: number) {
    this.client = new OpenAI({ apiKey, timeout: timeoutMs });
  }

  async create(request: StructuredResponseRequest): Promise<string> {
    const response = await this.client.responses.create({
      model: request.model,
      instructions: request.instructions,
      input: request.input,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: request.schemaName,
          strict: true,
          schema: request.schema,
        },
      },
    });

    return response.output_text;
  }
}

const translationSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    content: { type: "string" },
  },
  required: ["title", "description", "content"],
  additionalProperties: false,
} as const;

const titleSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
  },
  required: ["title"],
  additionalProperties: false,
} as const;

const factSheetSchema = {
  type: "object",
  properties: {
    facts: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["facts"],
  additionalProperties: false,
} as const;

const QUOTED_PASSAGE = /[«“„"]\s*([^«»“”„"]+?)\s*[»”"]/gu;

/** Indique si le texte contient un passage entre guillemets trop long. */
export function containsLongQuotation(value: string): boolean {
  for (const match of value.matchAll(QUOTED_PASSAGE)) {
    const words = match[1]?.trim().split(/\s+/u).filter(Boolean) ?? [];
    if (words.length > MAX_QUOTED_WORDS) return true;
  }
  return false;
}

const KNOWN_EXTRACTION_COLLISIONS = [
  [/\bparcoursdans\b/giu, "parcours dans"],
  [/\blesanimaux\b/giu, "les animaux"],
  [/\bdesanimaux\b/giu, "des animaux"],
  [/\blemême\b/giu, "le même"],
  [/\bEncampreversera\b/gu, "Encamp reversera"],
] as const;

function normalizeEditorialText(value: string): string {
  let normalized = value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/([.!?;:])(?=\p{Lu})/gu, "$1 ");

  for (
    const [collision, replacement] of
    KNOWN_EXTRACTION_COLLISIONS
  ) {
    normalized = normalized.replace(
      collision,
      replacement,
    );
  }

  return normalized
    .replace(/ +\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function containsMarkdown(value: string): boolean {
  return (
    /\[[^\]]+\]\([^)]+\)/.test(value) ||
    /(^|\n)\s{0,3}#{1,6}\s/.test(value) ||
    /(^|\n)\s{0,3}[-*+]\s/.test(value)
  );
}

function assertPlainEditorialOutput(
  response: TranslationResponse,
): void {
  if (
    containsMarkdown(response.title) ||
    containsMarkdown(response.description) ||
    containsMarkdown(response.content)
  ) {
    throw new Error(
      "Le fournisseur éditorial a renvoyé du Markdown interdit.",
    );
  }
}

function parseFactSheetResponse(output: string): string[] {
  let value: unknown;

  try {
    value = JSON.parse(output);
  } catch {
    throw new Error(
      "Le fournisseur éditorial a renvoyé une liste de faits invalide.",
    );
  }

  const rawFacts =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>).facts
      : undefined;

  if (!Array.isArray(rawFacts)) {
    throw new Error(
      "Le fournisseur éditorial a renvoyé une liste de faits invalide.",
    );
  }

  const facts = [
    ...new Set(
      rawFacts
        .filter((fact): fact is string => typeof fact === "string")
        .map((fact) => normalizeEditorialText(fact))
        .filter(Boolean),
    ),
  ];

  if (facts.length === 0) {
    throw new Error(
      "L’extraction n’a produit aucun fait exploitable.",
    );
  }

  if (facts.length > MAX_FACTS) {
    throw new Error(
      `L’extraction a produit plus de ${MAX_FACTS} faits.`,
    );
  }

  if (facts.some((fact) => fact.length > MAX_FACT_LENGTH)) {
    throw new Error(
      `Un fait extrait dépasse ${MAX_FACT_LENGTH} caractères.`,
    );
  }

  if (facts.some(containsLongQuotation)) {
    throw new Error(
      "La liste de faits contient une citation directe interdite.",
    );
  }

  return facts;
}

function assertNoLongQuotation(response: TranslationResponse): void {
  if (
    containsLongQuotation(response.title) ||
    containsLongQuotation(response.description) ||
    containsLongQuotation(response.content)
  ) {
    throw new Error(
      "L’article rédigé contient une citation directe interdite.",
    );
  }
}

function parseTitleResponse(output: string): string {
  let value: unknown;

  try {
    value = JSON.parse(output);
  } catch {
    throw new Error("Le raccourcissement du titre a renvoyé une réponse JSON invalide.");
  }

  const title =
    value && typeof value === "object" && !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).title === "string"
      ? ((value as Record<string, unknown>).title as string).trim()
      : "";

  if (!title) {
    throw new Error("Le raccourcissement du titre a renvoyé un titre vide.");
  }

  return normalizeEditorialText(title);
}

function assertTitleLength(title: string): void {
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(
      `Le titre dépasse ${MAX_TITLE_LENGTH} caractères (${title.length}).`,
    );
  }
}

function parseTranslationResponse(output: string): TranslationResponse {
  let value: unknown;

  try {
    value = JSON.parse(output);
  } catch {
    throw new Error("Le fournisseur de traduction a renvoyé une réponse JSON invalide.");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Le fournisseur de traduction a renvoyé une réponse invalide.");
  }

  const response = value as Record<string, unknown>;
  const title = typeof response.title === "string" ? response.title.trim() : "";
  const description =
    typeof response.description === "string" ? response.description.trim() : "";
  const content = typeof response.content === "string" ? response.content.trim() : "";

  if (!title || !description || !content) {
    throw new Error("Le fournisseur de traduction a renvoyé des champs incomplets.");
  }

  return {
    title: normalizeEditorialText(title),
    description: normalizeEditorialText(description),
    content: normalizeEditorialText(content),
  };
}

export class OpenAiEditorialGenerator implements EditorialGenerator {
  readonly auditMetadata: {
    provider: string;
    model: string;
    promptVersion: string;
  };

  private readonly model: string;
  private readonly client: StructuredResponseClient;
  constructor(options: OpenAiEditorialGeneratorOptions) {
    if (!options.apiKey.trim()) {
      throw new Error("La variable OPENAI_API_KEY est absente.");
    }

    this.model = options.model?.trim() || DEFAULT_MODEL;
    this.auditMetadata = {
      provider: "openai",
      model: this.model,
      promptVersion: OPENAI_EDITORIAL_PROMPT_VERSION,
    };
    this.client =
      options.client ??
      new OpenAiResponsesClient(
        options.apiKey,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );
  }

  async prepareArticle(input: PrepareArticleInput): Promise<PreparedArticle> {
    const sourcePublishedAt =
      input.sourcePublishedAt?.toISOString() ?? null;
    const generatedAt = input.generatedAt.toISOString();

    const factSheet = await this.extractFacts(input, {
      sourcePublishedAt,
      generatedAt,
    });

    let output: string;

    try {
      output = await this.client.create({
        model: this.model,
        instructions: [
          "Rédige en français un article journalistique original, clair et factuel adapté à ANDORRE 360.",
          "Rédige uniquement à partir de la liste de faits fournie : tu n’as pas accès au texte d’origine et tu ne dois pas chercher à le reconstituer.",
          "N’ajoute aucun fait absent de la liste, n’invente aucune information et n’ajoute aucune connaissance extérieure.",
          "N’insère aucune citation entre guillemets et ne prête à personne des paroles qui ne figurent pas dans la liste.",
          "Indique une fois, de façon naturelle, l’origine de l’information à partir du nom de la source fourni.",
          "Crée un titre informatif, un chapô synthétique et un article entièrement rédigé, organisé selon ton propre plan.",
          `Le titre compte au plus ${MAX_TITLE_LENGTH} caractères, espaces compris : va à l’essentiel, sans détail secondaire.`,
          "Ne mets pas de date dans le titre, sauf si elle est l’information principale ; le chapô et le corps donnent la date.",
          "Utilise la date de publication de la source et la date de génération fournies comme contexte temporel.",
          "Remplace toute expression relative comme aujourd’hui, hier ou demain par une date absolue lorsqu’elle peut être déterminée.",
          "Toute date événementielle déterminable doit comporter le jour, le mois et l’année, dans le chapô et le corps comme dans le titre lorsqu’il en contient une.",
          "Si une référence temporelle ne peut pas être déterminée avec certitude, reformule-la sans inventer de date.",
          "N’utilise aucun balisage Markdown ou HTML : rends uniquement du texte brut, en conservant les URL sous leur forme brute.",
          "Dans le chapô, conserve les quantités exactes fournies par les faits et évite toute formulation vague lorsqu’un chiffre précis est disponible.",
          "Applique les conventions typographiques françaises aux nombres, pourcentages et montants.",
          "Développe un acronyme lors de sa première occurrence uniquement si sa signification figure dans les faits.",
          "Ne mentionne pas le processus de rédaction.",
          "Retourne uniquement les trois champs demandés.",
        ].join(" "),
        input: JSON.stringify({
          facts: factSheet,
          sourceName: input.sourceName,
          sourceCategory: input.sourceCategory,
          sourcePublishedAt,
          generatedAt,
        }),
        schemaName: "article_from_facts",
        schema: translationSchema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur inconnue";
      throw new Error(`La rédaction OpenAI a échoué : ${message}`);
    }

    const drafted = parseTranslationResponse(output);
    const rewritten =
      drafted.title.length > MAX_TITLE_LENGTH
        ? {
            ...drafted,
            title: await this.shortenTitle(drafted.title, "français", {
              facts: factSheet,
            }),
          }
        : drafted;

    assertPlainEditorialOutput(rewritten);
    assertNoLongQuotation(rewritten);
    assertTitleLength(rewritten.title);

    return {
      title: rewritten.title,
      description: rewritten.description,
      content: rewritten.content,
      category: input.sourceCategory?.trim() || "Général",
      author: AUTOMATED_ARTICLE_AUTHOR,
      factSheet,
    };
  }

  /**
   * Un seul appel supplémentaire, à partir du titre trop long et du contexte
   * fourni (liste de faits pour la rédaction, chapô traduit pour une
   * traduction), jamais du texte source ; si le résultat reste trop long,
   * l’article ou la traduction est refusé.
   */
  private async shortenTitle(
    title: string,
    language: string,
    context: { facts: string[] } | { description: string },
  ): Promise<string> {
    let output: string;

    try {
      output = await this.client.create({
        model: this.model,
        instructions: [
          `Raccourcis ce titre d’article en ${language} à ${MAX_TITLE_LENGTH} caractères au plus, espaces compris, et garde-le en ${language}.`,
          "facts" in context
            ? "Garde l’information principale, exacte et fidèle à la liste de faits ; n’ajoute aucun fait."
            : "Garde l’information principale, exacte et fidèle au chapô fourni ; n’ajoute aucune information.",
          "Ne mets pas de date dans le titre, sauf si elle est l’information principale.",
          "N’utilise ni guillemets de citation, ni balisage Markdown ou HTML.",
          "Retourne uniquement le champ title.",
        ].join(" "),
        input: JSON.stringify({ title, ...context, maxLength: MAX_TITLE_LENGTH }),
        schemaName: "article_title",
        schema: titleSchema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur inconnue";
      throw new Error(`Le raccourcissement du titre OpenAI a échoué : ${message}`);
    }

    return parseTitleResponse(output);
  }

  private async extractFacts(
    input: PrepareArticleInput,
    context: { sourcePublishedAt: string | null; generatedAt: string },
  ): Promise<string[]> {
    let output: string;

    try {
      output = await this.client.create({
        model: this.model,
        instructions: [
          "Extrais de cet article la liste des faits vérifiables, en français : qui, quoi, où, quand, combien.",
          "Rédige chaque fait sous la forme d’une phrase courte, neutre et autonome, avec tes propres mots, sans reprendre la formulation de la source.",
          "Conserve exactement les noms propres, fonctions, lieux, chiffres, montants et dates.",
          "Remplace les dates relatives par une date absolue lorsqu’elle peut être déterminée grâce aux dates fournies.",
          "Ne retiens aucune citation, même courte, et aucun témoignage : une prise de position officielle peut seulement être résumée en un fait neutre et attribué, sans guillemets.",
          "Écris les noms d’événements, d’œuvres ou de programmes sans guillemets.",
          "N’inclus ni opinion, ni commentaire, ni anecdote, ni description de style, et n’ajoute aucune information absente de la source.",
          "Ignore les menus, mentions légales, liens de partage et autres éléments étrangers à l’article.",
          "N’utilise aucun balisage Markdown ou HTML.",
          "Retourne uniquement le champ facts.",
        ].join(" "),
        input: JSON.stringify({
          title: normalizeEditorialText(input.originalTitle),
          content: normalizeEditorialText(input.originalContent),
          sourceName: input.sourceName,
          sourcePublishedAt: context.sourcePublishedAt,
          generatedAt: context.generatedAt,
        }),
        schemaName: "article_fact_sheet",
        schema: factSheetSchema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur inconnue";
      throw new Error(`L’extraction des faits OpenAI a échoué : ${message}`);
    }

    return parseFactSheetResponse(output);
  }

  async translateArticle(
    input: TranslateArticleInput,
  ): Promise<PreparedTranslation> {
    const targetLanguage =
      input.locale === "FR"
        ? "français"
        : input.locale === "CA"
          ? "catalan"
          : "espagnol";

    let output: string;

    try {
      output = await this.client.create({
        model: this.model,
        instructions: [
          `Traduis fidèlement cet article journalistique vers le ${targetLanguage}.`,
          "N’ajoute, ne retire et n’invente aucune information.",
          "Conserve les noms propres, nombres, URL et la structure HTML ou Markdown.",
          "Adopte un style journalistique naturel adapté à Andorre.",
          `Le titre traduit compte au plus ${MAX_TITLE_LENGTH} caractères, espaces compris : resserre-le si nécessaire sans perdre l’information principale.`,
          "Retourne uniquement les trois champs demandés.",
        ].join(" "),
        input: JSON.stringify({
          title: input.title,
          description: input.description,
          content: input.content,
        }),
        schemaName: "article_translation",
        schema: translationSchema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur inconnue";
      throw new Error(`La traduction OpenAI a échoué : ${message}`);
    }

    const parsed = parseTranslationResponse(output);
    const translated =
      parsed.title.length > MAX_TITLE_LENGTH
        ? {
            ...parsed,
            title: await this.shortenTitle(parsed.title, targetLanguage, {
              description: parsed.description,
            }),
          }
        : parsed;

    assertTitleLength(translated.title);

    return {
      locale: input.locale,
      ...translated,
    };
  }
}
