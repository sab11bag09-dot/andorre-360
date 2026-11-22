"use client";

type ParagraphBlockEditorProps = {
  text: string;
  onChange: (text: string) => void;
};

export default function ParagraphBlockEditor({
  text,
  onChange,
}: ParagraphBlockEditorProps) {
  return (
    <textarea
      value={text}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Écris ton paragraphe…"
      rows={5}
      className="min-h-32 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base leading-7 text-zinc-100 outline-none transition focus:border-zinc-500"
    />
  );
}