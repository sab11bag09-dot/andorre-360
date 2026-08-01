import Link from "next/link";

export default function EditorialHeader() {
  return (
    <section className="mt-10 flex flex-col gap-4 border-b border-gray-300 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-700">
          Composition en direct
        </p>

        <h2 className="mt-2 font-serif text-3xl md:text-4xl">
          Page d’accueil
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Les missions éditoriales priment sur le remplissage automatique.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:border-yellow-500"
      >
        Voir la homepage →
      </Link>
    </section>
  );
}