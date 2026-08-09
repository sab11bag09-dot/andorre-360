import SafeImage from "@/components/SafeImage";
import Link from "next/link";

import { getFeaturedArticle, getPublishedArticles } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { buildEditorialLayout } from "@/lib/editorial/engine";

export default async function HomePageEditorial() {
  const [editorialLayout, publishedArticles, automaticHero] = await Promise.all([
    buildEditorialLayout("home"),
    getPublishedArticles(),
    getFeaturedArticle(),
  ]);

  /*
   * Empêche un même article d’apparaître plusieurs fois
   * dans les différentes zones de la homepage.
   */
  const usedArticleIds = new Set<number>();

  if (editorialLayout.hero) {
    usedArticleIds.add(editorialLayout.hero.id);
  }

  if (automaticHero) {
    usedArticleIds.add(automaticHero.id);
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
  const hero = automaticHero ?? editorialLayout.hero ?? null;

  const automaticFeatureIndex = availableArticles.findIndex((article) => {
    const text = [article.title, article.category, article.description]
      .join(" ")
      .toLocaleLowerCase("fr");
    return (
      Boolean(article.image) &&
      !/(parti politique|partis politiques|parti démocrate|parti socialiste|partit polític|partido político)/u.test(text)
    );
  });

  const automaticFeature =
    automaticFeatureIndex >= 0
      ? availableArticles.splice(automaticFeatureIndex, 1)[0]
      : null;

  const feature = editorialLayout.feature ?? automaticFeature ?? null;

  const grandFormatIndex = availableArticles.findIndex((article) => {
    const text = [article.title, article.category, article.description]
      .join(" ")
      .toLocaleLowerCase("fr");
    return (
      article.content.trim().length >= 800 &&
      Boolean(article.image) &&
      !/(parti politique|partis politiques|parti démocrate|parti socialiste|partit polític|partido político)/u.test(text)
    );
  });

  const automaticGrandFormat =
    grandFormatIndex >= 0
      ? availableArticles.splice(grandFormatIndex, 1)[0]
      : null;

  const grandFormat =
    editorialLayout.grandFormat ?? automaticGrandFormat ?? null;

  const briefPool =
    availableArticles.length > 0
      ? availableArticles
      : publishedArticles.filter(
          (article) =>
            article.id !== hero?.id &&
            article.id !== feature?.id &&
            article.id !== grandFormat?.id,
        );

  const shortArticles = briefPool.filter(
    (article) => article.content.trim().length < 800,
  );

  const automaticBriefs = [
    ...shortArticles,
    ...briefPool.filter((article) => !shortArticles.includes(article)),
  ].slice(0, 5);

  automaticBriefs.forEach((article) => {
    const index = availableArticles.findIndex((item) => item.id === article.id);
    if (index >= 0) availableArticles.splice(index, 1);
  });

  const briefs = [
    ...editorialLayout.briefs,
    ...automaticBriefs.filter(
      (article) =>
        !editorialLayout.briefs.some((manual) => manual.id === article.id),
    ),
  ].slice(0, 5);

  const cards = [
    ...editorialLayout.card,
    ...availableArticles,
  ].slice(0, 5);

  const media = await prisma.media.findMany({
    where: { type: "IMAGE" },
    select: {
      path: true,
      originalName: true,
      title: true,
      alt: true,
      caption: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const cardsWithImages = cards.map((article) => {
    if (article.image || media.length === 0) return article;

    const terms = [article.title, article.category, article.description]
      .join(" ")
      .toLocaleLowerCase("fr")
      .split(/[^\\p{L}\\p{N}]+/u)
      .filter((term) => term.length >= 4);

    const match = media
      .map((item, index) => ({
        item,
        index,
        score: terms.reduce((total, term) => {
          const text = [item.originalName, item.title, item.alt, item.caption]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("fr");
          return total + (text.includes(term) ? 1 : 0);
        }, 0),
      }))
      .sort((left, right) => right.score - left.score || left.index - right.index)[0];

    return { ...article, image: match?.item.path ?? "" };
  });

  cards.forEach((article) => {
    const index = availableArticles.findIndex((item) => item.id === article.id);
    if (index >= 0) availableArticles.splice(index, 1);
  });

  const editorial = editorialLayout.editorial;

  const discoverPool =
    availableArticles.length > 0
      ? availableArticles
      : publishedArticles.filter(
          (article) =>
            article.id !== hero?.id &&
            article.id !== feature?.id &&
            article.id !== grandFormat?.id,
        );

  const discover = discoverPool.filter((article, index, articles) => {
    const category = article.category.trim().toLocaleLowerCase("fr");
    return (
      category &&
      articles.findIndex(
        (candidate) =>
          candidate.category.trim().toLocaleLowerCase("fr") === category,
      ) === index
    );
  }).slice(0, 6);

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

          <div className="flex min-h-full flex-col gap-10 lg:col-span-4">
            {/* GRANDE CARTE */}

            {feature && (
              <Link
                href={`/article/${feature.slug}`}
                className="group block"
              >
                <article className="flex h-[980px] flex-col border-y-4 border-yellow-500 py-8 md:h-[1100px]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Grande carte · {feature.category}
                    </p>

                    <h2 className="mt-4 line-clamp-2 max-w-4xl font-serif text-4xl leading-tight md:text-5xl">
                      {feature.title}
                    </h2>
                  </div>

                  {feature.image ? (
  <div className="relative mt-7 h-[520px] shrink-0 overflow-hidden md:h-[620px]">
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
                    <p className="line-clamp-3 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
                      {feature.description}
                    </p>

                    <p className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-500">
                      Lire l’article →
                    </p>
                  </div>
                </article>
              </Link>
            )}

            {/* BRÈVES + GRAND FORMAT */}

            <div className="grid items-stretch gap-8 md:grid-cols-4">
              {/* BRÈVES */}

              <section className="flex h-full min-h-[520px] flex-col md:col-span-1">
                <div className="mb-5 border-b border-yellow-500 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    L’essentiel
                  </p>

                  <h2 className="mt-1 font-serif text-2xl">
                    Brèves
                  </h2>
                </div>

                <div className="divide-y divide-gray-800">
                  {briefs.slice(0, 5).map((article) => (
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
                  <article className="flex h-full flex-col border-l border-gray-800 pl-0 md:pl-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                      Grand Format · {grandFormat.category}
                    </p>

                    {/* Titre sur toute la largeur des trois colonnes */}

                    <h2 className="mt-4 max-w-4xl font-serif text-3xl leading-tight md:text-4xl lg:text-5xl">
                      {grandFormat.title}
                    </h2>

                    <div className="mt-6 flex flex-1 items-stretch gap-6 md:grid md:grid-cols-3">
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

            {/* VISUEL PROMOTIONNEL ANDORRA 360 */}

            <Link
              href="/"
              className="group mt-auto block overflow-hidden rounded-xl border border-gray-800 bg-white transition hover:border-yellow-500 md:col-span-4"
            >
              <div className="relative aspect-[8/5] w-full bg-white">
                <SafeImage
                  src="/images/andorre-360-promotion.png"
                  alt="Andorra 360 — Le briefing quotidien pour comprendre l’Andorre"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-contain transition duration-500 group-hover:scale-[1.01]"
                />
              </div>
            </Link>
          </div>

          {/* COLONNE ÉDITORIALE DROITE */}

          <aside className="h-full space-y-9 lg:col-span-2 lg:flex lg:flex-col lg:gap-9 lg:space-y-0 lg:border-l lg:border-gray-800 lg:pl-8">
            {/* ÉDITO */}

            <section className="flex min-h-[360px] flex-col border-b border-gray-800 pb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500 text-3xl text-yellow-500">
                  ✒
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-500">
                    ANDORRA 360
                  </p>

                  <h2 className="mt-1 font-serif text-3xl">
                    L’Édito
                  </h2>
                </div>
              </div>

              {editorial ? (
                <Link
                  href={`/article/${editorial.slug}`}
                  className="group mt-6 flex flex-1 flex-col"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    La voix de la rédaction
                  </p>

                  <h3 className="mt-3 line-clamp-3 font-serif text-2xl leading-snug transition group-hover:text-yellow-500">
                    {editorial.title}
                  </h3>

                  <p className="mt-4 line-clamp-4 leading-relaxed text-gray-400">
                    {editorial.description}
                  </p>

                  <p className="mt-auto pt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
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

<section className="min-h-[690px] border-t-2 border-yellow-500 pt-5">
  <div className="mb-4">
  <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
    La rédaction
  </span>

  <h2 className="mt-1 font-serif text-2xl">
    Sélection
  </h2>
</div>

  <div className="divide-y divide-gray-800">
    {cardsWithImages.slice(0, 5).map((article, index) => (
      <Link
        key={article.id}
        href={`/article/${article.slug}`}
        className="group block py-4"
      >
        <article className="grid grid-cols-[90px_1fr] gap-4">
          <div className="relative h-[90px] overflow-hidden">
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
              <section className="mt-12 min-h-[390px] rounded-xl bg-zinc-900 p-6 lg:mt-auto lg:flex lg:flex-col">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  Continuer la lecture
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  À découvrir
                </h2>

                <div className="mt-5 divide-y divide-zinc-700">
                  {discover.map((article) => (
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
    </main>
  );
}
