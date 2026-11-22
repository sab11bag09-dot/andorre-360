"use client";

type HeadingBlockEditorProps = {
  level: 2 | 3;
  text: string;
  onChange: (data: { level: 2 | 3; text: string }) => void;
};

export default function HeadingBlockEditor({
  level,
  text,
  onChange,
}: HeadingBlockEditorProps) {
  return (
    <div className="space-y-3">
      <select
        value={level}
        onChange={(event) =>
          onChange({
            level: Number(event.target.value) as 2 | 3,
            text,
          })
        }
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
      >
        <option value={2}>Titre H2</option>
        <option value={3}>Titre H3</option>
      </select>

      <input
        value={text}
        onChange={(event) =>
          onChange({
            level,
            text: event.target.value,
          })
        }
        placeholder="Titre…"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-xl font-semibold text-zinc-100 outline-none focus:border-zinc-500"
      />
    </div>
  );
}