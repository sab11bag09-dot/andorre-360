"use client";

import { SectionHeader } from "@/components/admin/ui";

type Props = {
  contentType: string;
  slug: string;
  wordCount: number;
  readingTime: number;
  pageKey: string;
  zoneLabel: string;

  featured: boolean;
  setFeatured: (value: boolean) => void;
};

export default function ArticleSidebar({
  contentType,
  slug,
  wordCount,
  readingTime,
  pageKey,
  zoneLabel,
  featured,
  setFeatured,
}: Props) {
  return (
    <>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <SectionHeader
          eyebrow="Informations"
          title="Aperçu technique"
        />

        <dl className="mt-6 divide-y divide-zinc-800">
          <div className="flex justify-between gap-4 py-4 first:pt-0">
            <dt className="text-sm text-zinc-500">
              Type
            </dt>

            <dd className="text-right text-sm font-semibold capitalize text-white">
              {contentType}
            </dd>
          </div>

          <div className="py-4">
            <dt className="text-sm text-zinc-500">
              Slug
            </dt>

            <dd className="mt-2 break-words text-sm font-semibold text-white">
              {slug || "—"}
            </dd>
          </div>

          <div className="flex justify-between gap-4 py-4">
            <dt className="text-sm text-zinc-500">
              Nombre de mots
            </dt>

            <dd className="text-sm font-semibold text-white">
              {wordCount}
            </dd>
          </div>

          <div className="flex justify-between gap-4 py-4">
            <dt className="text-sm text-zinc-500">
              Temps de lecture
            </dt>

            <dd className="text-sm font-semibold text-white">
              {readingTime} min
            </dd>
          </div>

          <div className="flex justify-between gap-4 py-4">
            <dt className="text-sm text-zinc-500">
              Page
            </dt>

            <dd className="max-w-[65%] text-right text-sm font-semibold text-white">
              {pageKey}
            </dd>
          </div>

          <div className="flex justify-between gap-4 py-4 last:pb-0">
            <dt className="text-sm text-zinc-500">
              Mise en avant
            </dt>

            <dd className="max-w-[65%] text-right text-sm font-semibold text-white">
              {zoneLabel}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <SectionHeader
  eyebrow="Compatibilité"
  title="Options héritées"
/>

        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) =>
              setFeatured(event.target.checked)
            }
            className="mt-1 h-4 w-4 accent-yellow-500"
          />

          <span>
            <span className="block font-semibold text-white">
              Contenu vedette
            </span>

            <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
              Réglage temporaire conservé pour les anciennes parties du projet.
            </span>
          </span>
        </label>
      </section>
    </>
  );
}