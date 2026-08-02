"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  getFilInfoFormatLabel,
  normalizeFilInfoFormat,
} from "@/lib/fil-info-format";
import type { FilInfoPageEntry } from "@/lib/fil-info-pagination";
import { FIL_INFO_REFRESH_INTERVAL_MS } from "@/lib/fil-info";
import { getFilInfoArticlePath, type PublicFilInfoLocale } from "@/lib/fil-info-locale";

type PageResponse = {
  entries: FilInfoPageEntry[];
  hasMore: boolean;
  nextCursor: string | null;
};

const localeNames = { fr: "fr-FR", ca: "ca-ES", es: "es-ES" } as const;
const copy = {
  fr: { updated: "Nouvelles informations disponibles", updating: "Actualisation…", archives: "Archives du fil", retry: "Réessayer", more: "Afficher plus", loading: "Chargement…", error: "Impossible de charger la suite du Fil info." },
  ca: { updated: "Hi ha informació nova disponible", updating: "Actualitzant…", archives: "Arxiu del fil", retry: "Torna-ho a provar", more: "Mostra’n més", loading: "Carregant…", error: "No s’ha pogut carregar la resta del fil." },
  es: { updated: "Hay nueva información disponible", updating: "Actualizando…", archives: "Archivo del hilo", retry: "Reintentar", more: "Mostrar más", loading: "Cargando…", error: "No se ha podido cargar el resto del hilo." },
} as const;

function formatPublicationDate(value: string, locale: PublicFilInfoLocale) {
  return new Intl.DateTimeFormat(localeNames[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Andorra",
  }).format(new Date(value));
}

export default function FilInfoPagination({
  initialCursor,
  latestCursor,
  initialHasMore,
  locale = "fr",
}: {
  initialCursor: string | null;
  latestCursor: string | null;
  initialHasMore: boolean;
  locale?: PublicFilInfoLocale;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<FilInfoPageEntry[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [newEntriesAvailable, setNewEntriesAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!latestCursor) {
      return;
    }

    let active = true;

    async function checkForUpdates() {
      try {
        const response = await fetch(
          `/api/fil-info/updates?after=${encodeURIComponent(latestCursor!)}&locale=${locale}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as { available: boolean };

        if (active && result.available) {
          setNewEntriesAvailable(true);
        }
      } catch {
        // Le contrôle est silencieux : la page reste utilisable hors connexion.
      }
    }

    const interval = window.setInterval(
      checkForUpdates,
      FIL_INFO_REFRESH_INTERVAL_MS,
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [latestCursor, locale]);

  function refreshNewEntries() {
    setNewEntriesAvailable(false);
    startTransition(() => router.refresh());
  }

  async function loadMore() {
    if (!cursor || isLoadingMore) {
      return;
    }

    setError(null);
    setIsLoadingMore(true);

    try {
      const response = await fetch(
        `/api/fil-info?cursor=${encodeURIComponent(cursor)}&locale=${locale}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("FIL_INFO_PAGE_FAILED");
      }

      const result = (await response.json()) as PageResponse;
      setEntries((current) => [...current, ...result.entries]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch {
      setError(copy[locale].error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <section
      aria-labelledby="fil-info-history-title"
      aria-busy={isLoadingMore || isPending}
      className="mt-16 md:mt-20"
    >
      {newEntriesAvailable && (
        <div className="mb-8 flex justify-center" role="status">
          <button
            type="button"
            onClick={refreshNewEntries}
            disabled={isPending}
            className="border border-yellow-500 bg-yellow-500 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500 motion-reduce:transition-none disabled:opacity-60"
          >
            {isPending
              ? copy[locale].updating
              : copy[locale].updated}
          </button>
        </div>
      )}

      {entries.length > 0 && (
        <>
          <div className="mb-7 border-t border-gray-800 pt-5">
            <h2 id="fil-info-history-title" className="font-serif text-3xl">
              {copy[locale].archives}
            </h2>
          </div>

          <ol className="divide-y divide-gray-800 border-y border-gray-800">
            {entries.map((entry) => {
              const format = normalizeFilInfoFormat(entry.filInfoFormat);

              return (
                <li key={entry.id}>
                  <Link
                    href={getFilInfoArticlePath(locale, entry.slug)}
                    className="grid gap-3 px-2 py-6 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-yellow-500 motion-reduce:transition-none sm:grid-cols-[190px_1fr] sm:px-5"
                  >
                    <time
                      dateTime={entry.publicationDate}
                      className="text-xs capitalize text-yellow-500"
                    >
                      {formatPublicationDate(entry.publicationDate, locale)}
                    </time>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">
                        {getFilInfoFormatLabel(format, locale)}
                      </p>
                      <h3 className="mt-2 font-serif text-xl leading-tight">
                        {entry.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {error && (
        <div className="mt-5 text-center" role="alert">
          <p className="text-sm text-red-300">{error}</p>
          <button
            type="button"
            onClick={loadMore}
            className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-yellow-500 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500"
          >
            {copy[locale].retry}
          </button>
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore || !cursor}
            className="border border-gray-700 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-yellow-500 hover:text-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500 motion-reduce:transition-none disabled:opacity-60"
          >
            {isLoadingMore ? copy[locale].loading : copy[locale].more}
          </button>
        </div>
      )}
    </section>
  );
}
