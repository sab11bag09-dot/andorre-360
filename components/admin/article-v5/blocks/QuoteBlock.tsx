<'EOF'
"use client";

import type { QuoteBlock } from "../types";

type Props = {
  block: QuoteBlock;
  onChange: (
    block: QuoteBlock
  ) => void;
};

export default function QuoteBlockEditor({
  block,
  onChange,
}: Props) {
  return (
    <div className="border-l-4 border-yellow-500 pl-5">
      <textarea
        value={block.text}
        onChange={(event) =>
          onChange({
            ...block,
            text: event.target.value,
          })
        }
        rows={4}
        placeholder="Saisissez la citation…"
        className="w-full resize-y border-0 bg-transparent px-0 py-1 font-serif text-xl italic leading-8 text-zinc-100 outline-none placeholder:text-zinc-600"
      />

      <input
        type="text"
        value={block.attribution}
        onChange={(event) =>
          onChange({
            ...block,
            attribution: event.target.value,
          })
        }
        placeholder="Auteur ou source de la citation"
        className="mt-3 w-full border-0 bg-transparent px-0 py-2 text-sm text-zinc-400 outline-none placeholder:text-zinc-600"
      />
    </div>
  );
}
EOF
