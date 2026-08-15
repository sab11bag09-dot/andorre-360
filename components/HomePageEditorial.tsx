import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getPublishedArticles } from "@/lib/articles";
import { buildEditorialLayout } from "@/lib/editorial/engine";

export default async function HomePageEditorial() {
  const editorialLayout = await buildEditorialLayout("home");
  const publishedArticles = await getPublishedArticles();

  /*
   * Empêche un même article d’apparaître plusieurs fois
   * dans les différentes zones de la homepage.
   */
  const usedArticleIds = new Set<number>();

  if (editorialLayout.hero) {
    usedArticleIds.add(editorialLayout.hero.id);
  }

  if (editorialLayout.feature) {
    usedArticleIds.add(editorialLayout.feature.id);
  }

  editorialLayout.secondary.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  editorialLayout.card.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  editorialLayout.briefs.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  if (editorialLayout.grandFormat) {
    usedArticleIds.add(editorialLayout.grandFormat.id);
  }

  if (editorialLayout.editorial) {
    usedArticleIds.add(editorialLayout.editorial.id);
  }

  editorialLayout.discover.forEach((article) => {
    usedArticleIds.add(article.id);
  });

  const availableArticles = publishedArticles.filter(
    (article) => !usedArticleIds.has(article.id)
  );

  /*
   * Les zones définies manuellement sont prioritaires.
   * Les articles disponibles complètent automatiquement
   * les zones encore vides.
   */
  const hero =
    editorialLayout.hero ??
    availableArticles.shift() ??
    null;

  const feature =
    editorialLayout.feature ??
    availableArticles.shift() ??
    null;

  const briefs =
    editorialLayout.briefs.length > 0
      ? editorialLayout.briefs
      : availableArticles.splice(0, 4);

  const grandFormat =
    editorialLayout.grandFormat ??
    availableArticles.shift() ??
    null;

 const cards =
  editorialLayout.card.length > 0
    ? editorialLayout.card
    : availableArticles.splice(0, 5);

  const editorial = editorialLayout.editorial;

  const discover =
    editorialLayout.discover.length > 0
      ? editorialLayout.discover
      : availableArticles.splice(0, 4);

  if (!hero) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="font-serif text-3xl">
          Aucune Une principale définie
        </h1>

        <p className="mt-4 text-gray-400">
          Crée une mission éditoriale avec la zone
          « Une principale ».
        </p>

        <Link
          href="/admin/diffusion"
          className="mt-6 inline-block rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          Ouvrir la diffusion éditoriale
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* UNE PRINCIPALE */}

      <Link
        href={`/article/${hero.slug}`}
        className="block"
      >
        <section className="relative h-[68vh] min-h-[520px] overflow-hidden">
          <SafeImage
            src={hero.image}
            alt={hero.title}
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover transition duration-700 hover:scale-100"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-12 md:px-10 md:pb-16">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
              À la Une · {hero.category}
            </p>

            <h1 className="max-w-5xl font-serif text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
              {hero.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-200 md:text-lg">
              {hero.description}
            </p>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Lire l’article →
            </p>
          </div>
        </section>
      </Link>

      {/* CORPS ÉDITORIAL : 4 COLONNES + 2 COLONNES */}

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-6">
          {/* PARTIE GAUCHE */}

          <div className="space-y-10 lg:col-span-4">
            {/* GRANDE CARTE */}

            {feature && (
              <Link
                href={`/article/${feature.slug}`}
                className="group block"
              >
                <article className="border-y-4 border-yellow-500 py-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Grande carte · {feature.category}
                    </p>

                    <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight md:text-5xl">
                      {feature.title}
                    </h2>
                  </div>

                  {feature.image ? (
  <div className="relative mt-7 h-[520px] overflow-hidden md:h-[620px]">
    <SafeImage
      src={feature.image}
      alt={feature.title}
      fill
      sizes="(max-width: 1024px) 100vw, 66vw"
      className="object-cover transition duration-500 group-hover:scale-[1.02]"
    />
  </div>
) : null}

                  <div className="pt-6">
                    <p className="max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
                      {feature.description}
                    </p>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* BRÈVES + GRAND FORMAT */}

            <div className="grid gap-8 md:grid-cols-4">
              {/* BRÈVES */}

              <section className="md:col-span-1">
                <div className="mb-5 border-b border-yellow-500 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    L’essentiel
                  </p>

                  <h2 className="mt-1 font-serif text-2xl">
                    Brèves
                  </h2>
                </div>

                <div className="divide-y divide-gray-800">
                  {briefs.slice(0, 4).map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block py-5 first:pt-0"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                        {article.category}
                      </p>

                      <h3 className="mt-2 font-serif text-lg leading-snug transition group-hover:text-yellow-500">
                        {article.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </section>

              {/* GRAND FORMAT */}

              {grandFormat && (
                <Link
                  href={`/article/${grandFormat.slug}`}
                  className="group block md:col-span-3"
                >
                  <article className="border-l border-gray-800 pl-0 md:pl-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Grand Format · {grandFormat.category}
                    </p>

                    {/* Titre sur toute la largeur des trois colonnes */}

                    <h2 className="mt-4 max-w-4xl font-serif text-3xl leading-tight md:text-4xl lg:text-5xl">
                      {grandFormat.title}
                    </h2>

                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                      {/* Chapô : une colonne à gauche */}

                      <div className="flex flex-col justify-between md:col-span-1">
                        <p className="leading-relaxed text-gray-300">
                          {grandFormat.description}
                        </p>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                          Lire le Grand Format →
                        </p>
                      </div>

                      {/* Photo : deux colonnes à droite */}

                     {grandFormat.image ? (
  <div className="relative h-[320px] overflow-hidden md:col-span-2 md:h-[440px]">
    <SafeImage
      src={grandFormat.image}
      alt={grandFormat.title}
      fill
      sizes="(max-width: 768px) 100vw, 44vw"
      className="object-cover transition duration-500 group-hover:scale-[1.02]"
    />
  </div>
) : null}
                    </div>
                  </article>
                </Link>
              )}
            </div>
          </div>

          {/* COLONNE ÉDITORIALE DROITE */}

          <aside className="space-y-9 lg:col-span-2 lg:flex lg:flex-col lg:gap-9 lg:space-y-0 lg:border-l lg:border-gray-800 lg:pl-8">
            {/* ÉDITO */}

            <section className="border-b border-gray-800 pb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500 text-3xl text-yellow-500">
                  ✒
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-500">
                    ANDORRE 360
                  </p>

                  <h2 className="mt-1 font-serif text-3xl">
                    L’Édito
                  </h2>
                </div>
              </div>

              {editorial ? (
                <Link
                  href={`/article/${editorial.slug}`}
                  className="group mt-6 block"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    La voix de la rédaction
                  </p>

                  <h3 className="mt-3 font-serif text-2xl leading-snug transition group-hover:text-yellow-500">
                    {editorial.title}
                  </h3>

                  <p className="mt-4 line-clamp-4 leading-relaxed text-gray-400">
                    {editorial.description}
                  </p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                    Lire l’édito →
                  </p>
                </Link>
              ) : (
                <div className="mt-6 border border-dashed border-gray-700 p-5">
                  <p className="text-sm leading-relaxed text-gray-500">
                    Aucun édito n’est actuellement programmé.
                  </p>
                </div>
              )}
            </section>

            {/* CARTES ÉDITORIALES */}

<section className="border-t-2 border-yellow-500 pt-5">
  <div className="mb-4">
  <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
    La rédaction
  </span>

  <h2 className="mt-1 font-serif text-2xl">
    Sélection
  </h2>
</div>

  <div className="divide-y divide-gray-800">
    {cards.slice(0, 5).map((article, index) => (
      <Link
        key={article.id}
        href={`/article/${article.slug}`}
        className="group block py-6"
      >
        <article className="grid grid-cols-[110px_1fr] gap-4">
          <div className="relative h-[110px] overflow-hidden">
            <SafeImage
              src={article.image}
              alt={article.title}
              fill
              sizes="110px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>

          <div>
            <div className="flex items-start gap-3">
              <span className="font-serif text-2xl leading-none text-gray-700">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                {article.category}
              </p>
            </div>

            <h3 className="mt-3 font-serif text-lg leading-snug transition group-hover:text-yellow-500">
              {article.title}
            </h3>
          </div>
        </article>
      </Link>
    ))}
  </div>
</section>

            {/* À DÉCOUVRIR */}

            {discover.length > 0 && (
              <section className="mt-12 rounded-xl bg-zinc-900 p-6 lg:mt-0 lg:flex lg:flex-1 lg:flex-col">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  Continuer la lecture
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  À découvrir
                </h2>

                <div className="mt-5 divide-y divide-zinc-700">
                  {discover.slice(0, 4).map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                          {article.category}
                        </p>

                        <h3 className="mt-1 font-serif leading-snug transition group-hover:text-yellow-500">
                          {article.title}
                        </h3>
                      </div>

                      <span className="mt-4 shrink-0 text-yellow-500">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-14 md:px-10">
        <div className="overflow-hidden border-y border-gray-800 bg-white">
          <img
            src="/uploads/andorra-360-pub.jpeg"
            alt="Andorra 360 — Le briefing quotidien pour comprendre l’Andorre"
            className="h-auto w-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}
