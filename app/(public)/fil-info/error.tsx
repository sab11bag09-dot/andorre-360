"use client";

import { useEffect } from "react";

export default function FilInfoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur de chargement du Fil info :", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-black px-5 py-20 text-white">
      <section className="mx-auto max-w-2xl border border-gray-800 bg-neutral-950 p-8 text-center sm:p-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500">
          Fil info indisponible
        </p>
        <h1 className="mt-4 font-serif text-3xl">La page n’a pas pu être chargée.</h1>
        <p className="mt-4 text-sm leading-7 text-gray-400">
          Réessayez dans quelques instants. Aucun contenu n’a été modifié.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 border border-yellow-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-yellow-500 transition hover:bg-yellow-500 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500 motion-reduce:transition-none"
        >
          Réessayer
        </button>
      </section>
    </main>
  );
}
