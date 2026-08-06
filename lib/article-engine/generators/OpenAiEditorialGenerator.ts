import OpenAI from "openai";

import { DeterministicEditorialGenerator } from "./DeterministicEditorialGenerator";
import type {
  EditorialGenerator,
  PrepareArticleInput,
  PreparedArticle,
  PreparedTranslation,
  TranslateArticleInput,
} from "./EditorialGenerator";

const DEFAULT_MODEL = "gpt-5.6-terra";
const DEFAULT_TIMEOUT_MS = 30_000;

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

  return { title, description, content };
}

export class OpenAiEditorialGenerator implements EditorialGenerator {
  private readonly model: string;
  private readonly client: StructuredResponseClient;
  private readonly deterministicGenerator = new DeterministicEditorialGenerator();

  constructor(options: OpenAiEditorialGeneratorOptions) {
    if (!options.apiKey.trim()) {
      throw new Error("La variable OPENAI_API_KEY est absente.");
    }

    this.model = options.model?.trim() || DEFAULT_MODEL;
    this.client =
      options.client ??
      new OpenAiResponsesClient(
        options.apiKey,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      );
  }

  async prepareArticle(input: PrepareArticleInput): Promise<PreparedArticle> {
    return this.deterministicGenerator.prepareArticle(input);
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
