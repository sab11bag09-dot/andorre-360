"use client";

type QuoteBlockEditorProps = {
  text: string;
  author: string;
  onChange: (data: { text: string; author: string }) => void;
};

export default function QuoteBlockEditor({
  text,
  author,
  onChange,
}: QuoteBlockEditorProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(event) =>
          onChange({
            text: event.target.value,
            author,
          })
        }
        placeholder="Texte de la citation…"
        rows={4}
        className="min-h-28 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base italic leading-7 text-zinc-100 outline-none transition focus:border-zinc-500"
      />

      <input
        value={author}
        onChange={(event) =>
          onChange({
            text,
            author: event.target.value,
          })
        }
        placeholder="Auteur de la citation"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
      />
    </div>
  );
}