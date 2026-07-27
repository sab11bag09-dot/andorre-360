import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import ReplaceButton from "@/components/editorial/ReplaceButton";
import type { EditorialZone } from "@/lib/editorial/zones";

type EditorialSlotArticle = {
  id: number;
  slug: string;
  title: string;
  category: string;
  author: string;
  image: string | null;
  description: string;
};

type ReplaceArticle = {
  id: number;
  title: string;
  category: string;
  author: string;
};

type EditorialSlotProps = {
  title: string;
  article: EditorialSlotArticle | null;
  editionKey: string;
  zone: EditorialZone;
  articles: ReplaceArticle[];
  emptyText?: string;
  compact?: boolean;
};

export default function EditorialSlot({
  title,
  article,
  editionKey,
  zone,
  articles,
  emptyText = "Aucun contenu affecté",
  compact = false,
}: EditorialSlotProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-5">
        <h2 className="font-serif text-xl text-gray-900">
          {title}
        </h2>

        <ReplaceButton
          editionKey={editionKey}
          zone={zone}
          articles={articles}
        />
      </div>

      {!article ? (
        <div
          className={`m-6 flex items-center justify-center rounded-xl border border-dashed border-gray-300 text-center text-gray-400 ${
            compact ? "min-h-28 p-5" : "min-h-64 p-10"
          }`}
        >
          {emptyText}
        </div>
      ) : compact ? (
        <div className="p-4">
          <div
            className={
              article.image
                ? "grid grid-cols-[96px_1fr] gap-4"
                : "grid grid-cols-1 gap-4"
            }
          >
            {article.image ? (
              <div className="relative h-24 overflow-hidden rounded-xl bg-gray-100">
                <SafeImage
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600">
                {article.category}
              </p>

              <h3 className="mt-2 line-clamp-2 font-serif text-lg text-gray-900">
                {article.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Par {article.author}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/article/${article.slug}`}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-100"
                >
                  Lire
                </Link>

                <Link
                  href={`/admin/articles/${article.id}`}
                  className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-600"
                >
                  Éditer
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {article.image ? (
            <div className="relative h-72 w-full bg-gray-100">
              <SafeImage
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-600">
              {article.category}
            </p>

            <h3 className="mt-3 font-serif text-3xl leading-tight text-gray-900 md:text-4xl">
              {article.title}
            </h3>

            <p className="mt-4 leading-relaxed text-gray-600">
              {article.description}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Par {article.author}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/article/${article.slug}`}
                className="rounded-lg bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                LIRE LA PAGE →
              </Link>

              <Link
                href={`/admin/articles/${article.id}`}
                className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
              >
                Éditer
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}