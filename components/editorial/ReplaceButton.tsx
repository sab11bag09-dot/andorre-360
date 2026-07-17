"use client";

import { useState } from "react";

import ReplaceDialog from "@/components/editorial/ReplaceDialog";
import type { EditorialZone } from "@/lib/editorial/zones";

type ReplaceArticle = {
  id: number;
  title: string;
  category: string;
  author: string;
};

type ReplaceButtonProps = {
  editionKey: string;
  zone: EditorialZone;
  articles: ReplaceArticle[];
};

export default function ReplaceButton({
  editionKey,
  zone,
  articles,
}: ReplaceButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold transition hover:border-yellow-500 hover:bg-yellow-50"
      >
        🔄 Remplacer
      </button>

      <ReplaceDialog
        open={open}
        onClose={() => setOpen(false)}
        editionKey={editionKey}
        zone={zone}
        articles={articles}
      />
    </>
  );
}