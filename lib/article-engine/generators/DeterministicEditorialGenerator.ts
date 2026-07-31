import type {
  EditorialGenerator,
  PrepareArticleInput,
  PreparedArticle,
} from "./EditorialGenerator";

export class DeterministicEditorialGenerator
  implements EditorialGenerator
{
  async prepareArticle(
    input: PrepareArticleInput,
  ): Promise<PreparedArticle> {
    const title = input.originalTitle.trim();
    const content = input.originalContent.trim();

    return {
      title,
      description: content.slice(0, 250),
      content,
      category:
        input.sourceCategory?.trim() ||
        "Général",
      author: input.sourceName,
    };
  }
}