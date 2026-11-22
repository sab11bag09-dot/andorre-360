"use client";

import type { BlockType } from "./types";

type Props = {
  onInsert: (type: BlockType) => void;
};

const BLOCKS: Array<{
  type: BlockType;
  label: string;
  description: string;
}> = [
  
  {
    
    type: "paragraph",
    label: "Paragraphe",
    description: "Texte classique",
  },
  {
    type: "heading",
    label: "Intertitre",
    description: "Titre H2 ou H3",
  },
  {
    type: "quote",
    label: "Citation",
    description: "Citation avec auteur",
  },
  {
    type: "divider",
    label: "Séparateur",
    description: "Ligne horizontale",
  },
  {
  type: "image",
  label: "Image",
  description: "Image avec légende",
},
];

export default function BlockInserter({
  onInsert,
}: Props) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4">
      <p className="mb-4 text-sm font-semibold text-zinc-200">
        Ajouter un bloc
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {BLOCKS.map((block) => (
          <button
            key={block.type}
            type="button"
            onClick={() => onInsert(block.type)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-left transition hover:border-yellow-500 hover:bg-zinc-800"
          >
            <div className="mb-2 text-lg font-semibold text-white">
              +
            </div>

            <div className="font-medium text-zinc-100">
              {block.label}
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              {block.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}