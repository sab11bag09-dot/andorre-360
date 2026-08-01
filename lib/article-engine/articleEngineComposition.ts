import type { GenerateArticleTranslationsDependencies } from "./generateArticleTranslations";
import { createEditorialGenerator } from "./generators/createEditorialGenerator";
import { PrismaArticleRepository } from "./repositories/PrismaArticleRepository";
import { PrismaArticleTranslationRepository } from "./repositories/PrismaArticleTranslationRepository";

export function createGenerateArticleTranslationsDependencies(): GenerateArticleTranslationsDependencies {
  return {
    articleRepository: new PrismaArticleRepository(),
    translationRepository: new PrismaArticleTranslationRepository(),
    editorialGenerator: createEditorialGenerator(),
  };
}
