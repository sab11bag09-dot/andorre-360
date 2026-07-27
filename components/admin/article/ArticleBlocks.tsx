mkdir -p components/admin/article-v5/blocks

cat > components/admin/article-v5/types.ts <<'EOF'
export type ParagraphBlock = {
  id: string;
  type: "paragraph";
  text: string;
};

export type HeadingBlock = {
  id: string;
  type: "heading";
  level: 2 | 3;
  text: string;
};

export type QuoteBlock = {
  id: string;
  type: "quote";
  text: string;
  attribution: string;
};

export type DividerBlock = {
  id: string;
  type: "divider";
};

export type ArticleBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | DividerBlock;

export type ArticleBlockType =
  ArticleBlock["type"];

export type SerializedArticleContent = {
  version: 1;
  blocks: ArticleBlock[];
};
EOF

cat > components/admin/article-v5/content.ts <<'EOF'
import type {
  ArticleBlock,
  ArticleBlockType,
  SerializedArticleContent,
} from "./types";

function createBlockId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `block-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function createArticleBlock(
  type: ArticleBlockType
): ArticleBlock {
  switch (type) {
    case "heading":
      return {
        id: createBlockId(),
        type: "heading",
        level: 2,
        text: "",
      };

    case "quote":
      return {
        id: createBlockId(),
        type: "quote",
        text: "",
        attribution: "",
      };

    case "divider":
      return {
        id: createBlockId(),
        type: "divider",
      };

    case "paragraph":
    default:
      return {
        id: createBlockId(),
        type: "paragraph",
        text: "",
      };
  }
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeBlock(
  value: unknown
): ArticleBlock | null {
  if (!isRecord(value)) {
    return null;
  }

  const id =
    typeof value.id === "string" && value.id
      ? value.id
      : createBlockId();

  if (value.type === "paragraph") {
    return {
      id,
      type: "paragraph",
      text:
        typeof value.text === "string"
          ? value.text
          : "",
    };
  }

  if (value.type === "heading") {
    return {
      id,
      type: "heading",
      level: value.level === 3 ? 3 : 2,
      text:
        typeof value.text === "string"
          ? value.text
          : "",
    };
  }

  if (value.type === "quote") {
    return {
      id,
      type: "quote",
      text:
        typeof value.text === "string"
          ? value.text
          : "",
      attribution:
        typeof value.attribution === "string"
          ? value.attribution
          : "",
    };
  }

  if (value.type === "divider") {
    return {
      id,
      type: "divider",
    };
  }

  return null;
}

function parseBlockArray(
  value: unknown
): ArticleBlock[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const blocks = value
    .map(normalizeBlock)
    .filter(
      (block): block is ArticleBlock =>
        block !== null
    );

  return blocks.length > 0 ? blocks : null;
}

function parseStructuredContent(
  content: string
): ArticleBlock[] | null {
  try {
    const parsed: unknown = JSON.parse(content);

    const directBlocks =
      parseBlockArray(parsed);

    if (directBlocks) {
      return directBlocks;
    }

    if (
      isRecord(parsed) &&
      parsed.version === 1
    ) {
      return parseBlockArray(parsed.blocks);
    }

    return null;
  } catch {
    return null;
  }
}

function parseLegacyContent(
  content: string
): ArticleBlock[] {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return [createArticleBlock("paragraph")];
  }

  const paragraphs = normalizedContent
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [createArticleBlock("paragraph")];
  }

  return paragraphs.map((text) => ({
    id: createBlockId(),
    type: "paragraph" as const,
    text,
  }));
}

export function parseArticleContent(
  content: string
): ArticleBlock[] {
  return (
    parseStructuredContent(content) ??
    parseLegacyContent(content)
  );
}

export function serializeArticleContent(
  blocks: ArticleBlock[]
): string {
  const payload: SerializedArticleContent = {
    version: 1,
    blocks,
  };

  return JSON.stringify(payload);
}

export function getArticleContentText(
  content: string
): string {
  const structuredBlocks =
    parseStructuredContent(content);

  if (!structuredBlocks) {
    return content;
  }

  return structuredBlocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
          return block.text;

        case "quote":
          return [
            block.text,
            block.attribution,
          ]
            .filter(Boolean)
            .join(" ");

        case "divider":
          return "";

        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export function hasArticleContent(
  content: string
): boolean {
  return getArticleContentText(content).trim()
    .length > 0;
}
EOF