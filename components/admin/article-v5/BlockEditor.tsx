"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import BlockCard from "./BlockCard";
import BlockInserter from "./BlockInserter";

import {
  createEmptyDocument,
  parseContent,
  serializeContent,
} from "./content";

import type {
  ArticleBlock,
  ArticleDocument,
  BlockType,
} from "./types";

type Props = {
  content: string;
  onChange: (content: string) => void;
};

function createBlockId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `block-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function createBlock(type: BlockType): ArticleBlock {
  const id = createBlockId();

  switch (type) {
    case "paragraph":
      return {
        id,
        type: "paragraph",
        text: "",
      };

    case "heading":
      return {
        id,
        type: "heading",
        level: 2,
        text: "",
      };

    case "quote":
      return {
        id,
        type: "quote",
        text: "",
        author: "",
      };

    case "divider":
      return {
        id,
        type: "divider",
      };
      case "image":
  return {
    id,
    type: "image",
    src: "",
    alt: "",
    caption: "",
    credit: "",
  };
  }
}

export default function BlockEditor({
  content,
  onChange,
}: Props) {
  const [document, setDocument] =
    useState<ArticleDocument>(() => {
      const parsedDocument = parseContent(content);

      if (parsedDocument.blocks.length > 0) {
        return parsedDocument;
      }

      return createEmptyDocument();
    });

  const lastSerializedContent = useRef(
    serializeContent(document)
  );

  useEffect(() => {
    if (content === lastSerializedContent.current) {
      return;
    }

    const parsedDocument = parseContent(content);

    setDocument(parsedDocument);
    lastSerializedContent.current =
      serializeContent(parsedDocument);
  }, [content]);

  function commitDocument(
    nextDocument: ArticleDocument
  ) {
    const serializedContent =
      serializeContent(nextDocument);

    setDocument(nextDocument);
    lastSerializedContent.current =
      serializedContent;

    onChange(serializedContent);
  }

  function updateBlock(
    blockId: string,
    nextBlock: ArticleBlock
  ) {
    commitDocument({
      ...document,
      blocks: document.blocks.map((block) =>
        block.id === blockId ? nextBlock : block
      ),
    });
  }

  function insertBlock(type: BlockType) {
    commitDocument({
      ...document,
      blocks: [
        ...document.blocks,
        createBlock(type),
      ],
    });
  }

  function deleteBlock(blockId: string) {
    commitDocument({
      ...document,
      blocks: document.blocks.filter(
        (block) => block.id !== blockId
      ),
    });
  }

  function moveBlock(
    blockIndex: number,
    direction: "up" | "down"
  ) {
    const destinationIndex =
      direction === "up"
        ? blockIndex - 1
        : blockIndex + 1;

    if (
      destinationIndex < 0 ||
      destinationIndex >= document.blocks.length
    ) {
      return;
    }

    const nextBlocks = [...document.blocks];

    const [movedBlock] = nextBlocks.splice(
      blockIndex,
      1
    );

    nextBlocks.splice(
      destinationIndex,
      0,
      movedBlock
    );

    commitDocument({
      ...document,
      blocks: nextBlocks,
    });
  }

  return (
    <div className="space-y-4">
      {document.blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 px-6 py-10 text-center">
          <p className="font-semibold text-zinc-200">
            Aucun bloc de contenu
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Ajoutez un paragraphe, un intertitre,
            une citation ou un séparateur.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {document.blocks.map(
            (block, blockIndex) => (
              <BlockCard
                key={block.id}
                block={block}
                position={blockIndex}
                totalBlocks={
                  document.blocks.length
                }
                onChange={(nextBlock) =>
                  updateBlock(
                    block.id,
                    nextBlock
                  )
                }
                onDelete={() =>
                  deleteBlock(block.id)
                }
                onMoveUp={() =>
                  moveBlock(blockIndex, "up")
                }
                onMoveDown={() =>
                  moveBlock(blockIndex, "down")
                }
              />
            )
          )}
        </div>
      )}

      <BlockInserter onInsert={insertBlock} />
    </div>
  );
}