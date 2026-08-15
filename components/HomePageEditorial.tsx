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

            <h1 className="line-clamp-2 max-w-5xl font-serif text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
              {hero.title}
            </h1>

            <p className="mt-5 line-clamp-2 max-w-2xl text-base leading-relaxed text-gray-200 md:text-lg">
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

          <div className="flex flex-col space-y-10 lg:col-span-4">
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

                    <h2 className="mt-4 line-clamp-2 max-w-4xl font-serif text-4xl leading-tight md:text-5xl">
                      {feature.title}
                    </h2>
                  </div>

                  {feature.image ? (
  <div className="relative mt-7 h-[360px] overflow-hidden md:h-[440px]">
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

              <section className="flex md:col-span-1 md:min-h-[440px] md:flex-col">
                <div className="mb-5 border-b border-yellow-500 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                    L’essentiel
                  </p>

                </div>

                <div className="flex-1 divide-y divide-gray-800">
                  {briefs.slice(0, 4).map((article) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}`}
                      className="group block py-5 first:pt-0"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
                        {article.category}
                      </p>

                      <h3 className="mt-2 line-clamp-3 font-serif text-lg leading-snug transition group-hover:text-yellow-500">
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

                    <h2 className="mt-4 line-clamp-2 max-w-4xl font-serif text-2xl leading-tight md:text-3xl lg:text-4xl">
                      {grandFormat.title}
                    </h2>

                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                      {/* Chapô : une colonne à gauche */}

                      <div className="flex flex-col justify-between md:col-span-1 md:min-h-[440px]">
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

      <section className="mt-auto w-full px-0 pb-0">
        <div className="w-full overflow-hidden border-y border-gray-800 bg-white">
          <img
            src="data:image/jpeg;base64,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Qr7AAgAV1bPHr0Yx59jGwefO3Wb90f0bhACNJVB9aZBrzjYa3n2YZyeNmr0eJHnwYz4sRjKAEKbArEhgj7Nvk165Ix4x6PG/TINwgAAAAABjIi5kqj4kjGSAAAAHn0NGdyo/vaI2JQi+948eyAAAHn0rRncI3vcNGJA165AjbNoCAANGdyo+zYIeZY0Z3CN63jTrlCPu9AIAR5CtXneNPmQI2JQj53jR72AIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAr8SVmz3j1Lqe2NetW3zuRffv1N7BeYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//2gAMAwEAAgADAAAAIfvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvuO9d9PvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvuAFXX7Hn9/vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvC/vvvvvrfNfvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvt3PvvvvvvvavvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvLfvvvvvvvvnP8A777777777xf7xf4XZTb37habzo7Larbf7zX77fI3pb7ebO9f777777774aD7iN37b757yJyzL9fLzLoD6afz759/r75f5P7L77777776zZ33z28V67L7SbyC7vb36Yjfiy7b7yriWpVzaL/P77777774dz7Xx/5/4kb/AO8m+8oUpUfuZ/U+V+PK/PO9PTv8U+++++++++++++++++++++++++++++++++++p++++++++++Vf++++++++++++++++++++++++++++++++++++21+++++++ud+++++++++++++++480+w80+48w208w4ym88++8oV2+++45W++++++++++++++++8MM8M88ccs88McM88Mc8M+++Muc2cMN+++++++++++++++++HIktdrJiFG4MjXLrPbr+++++++us+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ccMMe++++++++++++++++++++++++++++++04044848+0xy2w1/wCsdeuv9+t8/wDfXb777777777777777777xxzwzzyz56+7655x553673/989+83z7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777776w33b77777ydTT77L775uvT77r776OL77777776xT77777776sxFf74L76vi5T74D777fpf76r77idMZb6j77rMnb77777777oQj/74D76hShz74D777yfj76j76h/h/76r76wID3777777777zxz74L777yz774D77777976r775wz776j774z/37777776yxorbD4L5TDqq5r4DxyZaaj9yr7h5a/KJyr4Sirjrr777777yzjThT4LjDjzzTTIj75DRTz76rjijzzTzyr7jTzjRT777777xjgTSz76zgzyiDRx77zophBj67yAxrjbCT74Ajyijz77777776yx777766yyyz7776xxwxxz776yyzwxzz75wyxyyz777777777777777777777777777777777777777777777777777777777777777777777776o2sGp7777777777777777777777777777777777777777777777777777777777777777777777/2gAMAwEAAgADAAAAEM99+92/+31235w278yw+038y/z6435/2439699489w168+9663/AP8AfHPvv3z/AH3/APe8/vfvMf8Av/fvL/73v/8A9xdzk/f9/wC/8etve/d8v+Mf/s/sevu/c8u/+s/+ddd98+//APdgnejLpaE3T/HL3b7L7r3fjbzz/wA+/wDsf9v+vvvtPtu+vPv/AIhA/wB3562uKZ8+/wAPt/e9te998d/f+d+/9+/f+vd9+/fe+/8A7FyffnjfPf7gfj3fnjnPrHj/APy4z9z2+26x5/504w66wxyz03jkzz/6/wCN+MQ2/wD737zz/bqh/wCk8xG29jG5jgsTJqbzd+/3dX4/yjP5v/lnnEk9y7zw2x3/APRO5r6c8IcNIY3q9PP4X4OjfmGm9PE9D460ekPI+d//APTT32npEC6Q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"
            alt="Andorra 360 — Le briefing quotidien pour comprendre l’Andorre"
            className="h-auto w-full object-cover"
          />
        </div>
      </section>
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

            <h3 className="mt-3 line-clamp-3 font-serif text-lg leading-snug transition group-hover:text-yellow-500">
              {article.title}
            </h3>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
              Lire l’article →
            </p>
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

    </main>
  );
}
