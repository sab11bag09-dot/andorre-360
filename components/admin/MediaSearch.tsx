"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type MediaSearchProps = {
  initialQuery?: string;
};

export default function MediaSearch({
  initialQuery = "",
}: MediaSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const normalizedQuery = query.trim();

      if (normalizedQuery) {
        params.set("recherche", normalizedQuery);
      } else {
        params.delete("recherche");
      }

      const nextUrl = params.size
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.replace(nextUrl, {
        scroll: false,
      });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [pathname, query, router, searchParams]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  function clearSearch() {
    setQuery("");
  }

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="media-search" className="sr-only">
        Rechercher un média
      </label>

      <input
        id="media-search"
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Rechercher par nom, texte alternatif ou légende…"
        autoComplete="off"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-24 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
      />

      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          Effacer
        </button>
      )}
    </div>
  );
}