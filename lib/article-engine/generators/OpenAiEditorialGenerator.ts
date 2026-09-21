import OpenAI from "openai";

import type {
  EditorialGenerator,
  PrepareArticleInput,
  PreparedArticle,
  PreparedTranslation,
  TranslateArticleInput,
} from "./EditorialGenerator";

const DEFAULT_MODEL = "gpt-5.6-terra";
const DEFAULT_TIMEOUT_MS = 30_000;

export const OPENAI_EDITORIAL_PROMPT_VERSION =
  "editorial-rewrite-v3";

interface TranslationResponse {
  title: string;
  description: string;
  content: string;
}

interface StructuredResponseRequest {
  model: string;
  instructions: string;
  input: string;
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
          name: "article_translation",
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
    let output: string;

    try {
      output = await this.client.create({
        model: this.model,
        instructions: [
          "Rédige en français un article journalistique original, clair et factuel adapté à ANDORRE 360.",
          "Ne produis pas une traduction littérale et ne reproduis pas la structure des phrases de la source.",
          "Crée un titre informatif, un chapô synthétique et un article entièrement rédigé.",
          "Conserve strictement les faits, noms propres, chiffres, dates, citations et liens présents dans la source.",
          "Utilise la date de publication de la source et la date de génération fournies comme contexte temporel.",
          "Remplace les expressions relatives comme aujourd’hui, hier, demain, ce matin, cette année ou enguany par une date absolue lorsqu’elle peut être déterminée.",
          "Toute date événementielle déterminable doit comporter le jour, le mois et l’année, y compris dans le titre, le chapô et le corps.",
          "Si une référence temporelle ne peut pas être déterminée avec certitude, reformule-la sans inventer de date.",
          "Corrige les défauts évidents d’extraction, d’espacement, de ponctuation et de typographie sans modifier le sens.",
          "N’utilise aucun balisage Markdown ou HTML : rends uniquement du texte brut, en conservant les URL sous leur forme brute.",
          "Dans le chapô, conserve les quantités exactes fournies par la source et évite toute formulation vague lorsqu’un chiffre précis est disponible.",
          "Applique les conventions typographiques françaises aux nombres, pourcentages et montants.",
          "Développe un acronyme lors de sa première occurrence uniquement si sa signification figure dans la source.",
          "N’invente aucune information, n’ajoute aucune connaissance extérieure et ne mentionne pas le processus de réécriture.",
          "Retourne uniquement les trois champs demandés.",
        ].join(" "),
        input: JSON.stringify({
          title: normalizeEditorialText(
            input.originalTitle,
          ),
          content: normalizeEditorialText(
            input.originalContent,
          ),
          sourceName: input.sourceName,
          sourceCategory: input.sourceCategory,
          sourcePublishedAt:
            input.sourcePublishedAt?.toISOString() ?? null,
          generatedAt: input.generatedAt.toISOString(),
        }),
        schema: translationSchema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur inconnue";
      throw new Error(`La réécriture OpenAI a échoué : ${message}`);
    }

    const rewritten = parseTranslationResponse(output);

    assertPlainEditorialOutput(rewritten);

    return {
      title: rewritten.title,
      description: rewritten.description,
      content: rewritten.content,
      category: input.sourceCategory?.trim() || "Général",
      author: input.sourceName,
    };
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
          "Retourne uniquement les trois champs demandés.",
        ].join(" "),
        input: JSON.stringify({
          title: input.title,
          description: input.description,
          content: input.content,
        }),
        schema: translationSchema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur inconnue";
      throw new Error(`La traduction OpenAI a échoué : ${message}`);
    }

    const translated = parseTranslationResponse(output);

    return {
      locale: input.locale,
      ...translated,
    };
  }
}
