import OpenAI from "openai";

import type {
  EditorialGenerator,
  PrepareArticleInput,
  PreparedArticle,
  PreparedTranslation,
  TranslateArticleInput,
} from "./EditorialGenerator";

type ArticlePayload = {
  title: string;
  description: string;
  content: string;
  category?: string;
  author?: string;
};

function parsePayload(text: string): ArticlePayload {
  const normalized = text.trim()
    .replace(/^\`\`\`json\s*/i, "")
    .replace(/\s*\`\`\`$/, "");
  const value = JSON.parse(normalized) as ArticlePayload;

  for (const key of ["title", "description", "content"] as const) {
    if (typeof value[key] !== "string" || !value[key].trim()) {
      throw new Error(`Réponse IA invalide : champ ${key} manquant.`);
    }
  }

  return value;
}

export class OpenAIEditorialGenerator implements EditorialGenerator {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5.6-terra",
  ) {
    if (!apiKey?.trim()) {
      throw new Error("OPENAI_API_KEY est requis pour la génération IA.");
    }

    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  private async generate(prompt: string): Promise<ArticlePayload> {
    const response = await this.client.responses.create({
      model: this.model,
      input: prompt,
    });

    return parsePayload(response.output_text);
  }

  async prepareArticle(input: PrepareArticleInput): Promise<PreparedArticle> {
    const result = await this.generate(`Réécris cet article en français journalistique neutre. Ne fabrique aucun fait. Conserve les noms propres, chiffres et citations. Retourne uniquement un JSON avec title, description, content, category et author.

Titre source:
${input.originalTitle}

Contenu source:
${input.originalContent}

Source:
${input.sourceName}`);

    return {
      title: result.title,
      description: result.description,
      content: result.content,
      category: result.category?.trim() || input.sourceCategory?.trim() || "Général",
      author: result.author?.trim() || input.sourceName,
    };
  }

  async translateArticle(input: TranslateArticleInput): Promise<PreparedTranslation> {
    const language = input.locale === "FR" ? "français" : input.locale === "CA" ? "catalan" : "espagnol";
    const result = await this.generate(`Traduis cet article en ${language} journalistique naturel. Ne fabrique aucun fait et conserve les noms propres, chiffres et citations. Retourne uniquement un JSON avec title, description et content.

Titre:
${input.title}

Chapô:
${input.description}

Contenu:
${input.content}`);

    return {
      locale: input.locale,
      title: result.title,
      description: result.description,
      content: result.content,
    };
  }
}
