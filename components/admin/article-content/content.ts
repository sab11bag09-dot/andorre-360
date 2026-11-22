import type { ArticleBlock, ArticleDocument } from "./types";

export function createEmptyDocument(): ArticleDocument {
  return {
    version: 1,
    blocks: [],
  };
}

export function parseContent(content: string): ArticleDocument {
  if (!content.trim()) {
    return createEmptyDocument();
  }

  try {
    const parsed = JSON.parse(content);

    if (
      parsed &&
      parsed.version === 1 &&
      Array.isArray(parsed.blocks)
    ) {
      return parsed as ArticleDocument;
    }
  } catch {
    // Ancien format : texte brut
  }

  const blocks: ArticleBlock[] = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `legacy-${index}`,
      type: "paragraph" as const,
      text,
    }));

  return {
    version: 1,
    blocks,
  };
}

export function serializeContent(document: ArticleDocument): string {
  return JSON.stringify(document);
}

export function countWords(document: ArticleDocument): number {
  return document.blocks.reduce((total, block) => {
    switch (block.type) {
      case "paragraph":
      case "heading":
        return (
          total +
          block.text
            .trim()
            .split(/\s+/)
            .filter(Boolean).length
        );

      case "quote":
        return (
          total +
          `${block.text} ${block.author}`
            .trim()
            .split(/\s+/)
            .filter(Boolean).length
        );

      default:
        return total;
    }
  }, 0);
}