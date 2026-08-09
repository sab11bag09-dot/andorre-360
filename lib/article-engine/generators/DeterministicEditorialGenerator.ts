import type {
  EditorialGenerator,
  PrepareArticleInput,
  PreparedArticle,
  PreparedTranslation,
  TranslateArticleInput,
} from "./EditorialGenerator";

export class DeterministicEditorialGenerator
  implements EditorialGenerator
{
  async prepareArticle(
    input: PrepareArticleInput,
  ): Promise<PreparedArticle> {
    const title =
      input.originalTitle.trim();

    const content =
      input.originalContent.trim();

    return {
      title,
      description:
        content.slice(0, 250),
      content,
      category:
        input.sourceCategory?.trim() ||
        "ACTUALITÉ",
      author: input.sourceName,
    };
  }

  async translateArticle(
    input: TranslateArticleInput,
  ): Promise<PreparedTranslation> {
    const prefix = `[${input.locale}]`;

    return {
      locale: input.locale,
      title:
        `${prefix} ${input.title.trim()}`,
      description:
        `${prefix} ${input.description.trim()}`,
      content:
        `${prefix} ${input.content.trim()}`,
    };
  }
}