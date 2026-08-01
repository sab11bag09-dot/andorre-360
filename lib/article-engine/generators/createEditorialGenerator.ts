import type { EditorialGenerator } from "./EditorialGenerator";
import { OpenAiEditorialGenerator } from "./OpenAiEditorialGenerator";

export function createEditorialGenerator(): EditorialGenerator {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY doit être configurée pour générer les traductions.",
    );
  }

  return new OpenAiEditorialGenerator({
    apiKey,
    model: process.env.OPENAI_TRANSLATION_MODEL,
  });
}
