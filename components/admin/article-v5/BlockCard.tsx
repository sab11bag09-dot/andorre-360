"use client";

import DividerBlockEditor from "./blocks/DividerBlock";
import HeadingBlockEditor from "./blocks/HeadingBlock";
import ParagraphBlockEditor from "./blocks/ParagraphBlock";
import QuoteBlockEditor from "./blocks/QuoteBlock";
import ImageBlockEditor from "./blocks/ImageBlock";

import type { ArticleBlock } from "./types";

type Props = {
  block: ArticleBlock;
  position: number;
  totalBlocks: number;
  onChange: (block: ArticleBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

const BLOCK_LABELS: Record<ArticleBlock["type"], string> = {
  paragraph: "Paragraphe",
  heading: "Intertitre",
  quote: "Citation",
  divider: "Séparateur",
  image: "Image",
};

export default function BlockCard({
  block,
  position,
  totalBlocks,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  const canMoveUp = position > 0;
  const canMoveDown = position < totalBlocks - 1;

  function renderEditor() {
    switch (block.type) {
      case "paragraph":
        return (
          <ParagraphBlockEditor
            text={block.text}
            onChange={(text) =>
              onChange({
                ...block,
                text,
              })
            }
          />
        );

      case "heading":
        return (
          <HeadingBlockEditor
            level={block.level}
            text={block.text}
            onChange={({ level, text }) =>
              onChange({
                ...block,
                level,
                text,
              })
            }
          />
        );

      case "quote":
        return (
          <QuoteBlockEditor
            text={block.text}
            author={block.author}
            onChange={({ text, author }) =>
              onChange({
                ...block,
                text,
                author,
              })
            }
          />
        );

      case "divider":
        return <DividerBlockEditor />;
case "image":
  return (
    <ImageBlockEditor
      src={block.src}
      alt={block.alt}
      caption={block.caption}
      credit={block.credit}
      onChange={({ src, alt, caption, credit }) =>
        onChange({
          ...block,
          src,
          alt,
          caption,
          credit,
        })
      }
    />
  );
      default:
        return null;
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-zinc-800 px-2 text-xs font-semibold text-zinc-400">
            {position + 1}
          </span>

          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {BLOCK_LABELS[block.type]}
            </p>

            <p className="text-xs text-zinc-500">
              Bloc de contenu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Déplacer le bloc ${position + 1} vers le haut`}
            title="Déplacer vers le haut"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Déplacer le bloc ${position + 1} vers le bas`}
            title="Déplacer vers le bas"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Supprimer le bloc ${position + 1}`}
            title="Supprimer le bloc"
            className="ml-1 flex h-9 items-center justify-center rounded-md border border-red-500/30 px-3 text-xs font-semibold text-red-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-200"
          >
            Supprimer
          </button>
        </div>
      </header>

      <div className="p-4">
        {renderEditor()}
      </div>
    </article>
  );
}