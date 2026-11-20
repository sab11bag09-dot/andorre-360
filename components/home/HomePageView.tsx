import Image from "next/image";
import Link from "next/link";

import SafeImage from "@/components/SafeImage";
import type { HomeComposition } from "@/lib/editorial/composeHomePage";
import { getVideoEmbedUrl } from "@/lib/media/videoEmbed";

/**
 * Affichage de la page d’accueil, sans accès aux données : la composition
 * est calculée par `composeHomePage`. Les titres sont limités en lignes,
 * jamais par une hauteur fixe ; les blocs prennent la hauteur de leur
 * contenu, ce qui évite de couper un article placé.
 */

export type HomeArticle = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  videoUrl: string | null;
  category: string;
};

const KICKER = "text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500";
const READ_MORE = "text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500";
const FALLBACK_IMAGE = "/images/global/hero.jpg";

/**
 * Mise en page indépendante des textes : chaque titre et chaque chapô réserve
 * son nombre de lignes (`line-clamp-N min-h-[Nlh]`), un chapô absent garde sa
 * place et une photo absente est remplacée par l’image générique. Les blocs et
 * les photos ne bougent donc pas selon la longueur des textes.
 */
function Description({ text, className }: { text: string | null; className: string }) {
  return text ? <p className={className}>{text}</p> : <p aria-hidden="true" className={className} />;
}

function href(article: HomeArticle): string {
  return `/article/${article.slug}`;
}

function EmptyHome() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="font-serif text-3xl">Aucune Une principale définie</h1>

      <p className="mt-4 text-gray-400">
        Crée une mission éditoriale avec la zone « Une principale ».
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

function Hero({ article }: { article: HomeArticle }) {
  return (
    <Link href={href(article)} className="block">
      <section className="relative h-[68vh] min-h-[520px] overflow-hidden">
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover transition duration-700 hover:scale-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-12 md:px-10 md:pb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
            À la Une · {article.category}
          </p>

          <h1 className="line-clamp-4 min-h-[4lh] max-w-5xl font-serif text-[1.75rem] leading-[1.1] md:line-clamp-3 md:min-h-[3lh] md:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          <Description
            text={article.description}
            className="mt-5 line-clamp-2 min-h-[2lh] max-w-2xl text-base leading-relaxed text-gray-200 md:text-lg"
          />

          <p className={`mt-7 ${KICKER}`}>Lire l’article →</p>
        </div>
      </section>
    </Link>
  );
}

function FeatureCard({ article }: { article: HomeArticle }) {
  return (
    <Link href={href(article)} className="group block">
      <article className="border-y-4 border-yellow-500 py-8">
        <p className={KICKER}>Grande carte · {article.category}</p>

        <h2 className="mt-4 line-clamp-4 min-h-[4lh] max-w-4xl font-serif text-[1.75rem] leading-tight md:line-clamp-3 md:min-h-[3lh] md:text-5xl">
          {article.title}
        </h2>

        <div className="relative mt-7 h-[330px] overflow-hidden md:h-[390px]">
          <SafeImage
            src={article.image || FALLBACK_IMAGE}
              alt={article.title}
              fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>

        <div className="pt-6">
          <Description
            text={article.description}
            className="line-clamp-2 min-h-[2lh] max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg"
          />

          <p className={`mt-6 ${READ_MORE}`}>Lire l’article →</p>
        </div>
      </article>
    </Link>
  );
}

function Briefs({ articles }: { articles: HomeArticle[] }) {
  return (
    <section className="flex flex-col lg:col-span-1">
      <div className="mb-5 border-b border-yellow-500 pb-3">
        <p className={KICKER}>L’essentiel</p>
      </div>

      <div className="flex-1 divide-y divide-gray-800">
        {articles.map((article) => (
          <Link key={article.id} href={href(article)} className="group block py-5 first:pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-500">
              {article.category}
            </p>

            <h3 className="mt-2 line-clamp-4 min-h-[4lh] font-serif text-lg leading-snug transition group-hover:text-yellow-500">
              {article.title}
            </h3>

            <p className={`mt-3 ${READ_MORE}`}>Lire l’article →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function GrandFormat({ article }: { article: HomeArticle }) {
  return (
    <Link href={href(article)} className="group block lg:col-span-3">
      <article className="border-gray-800 lg:border-l lg:pl-7">
        <p className={KICKER}>Grand Format · {article.category}</p>

        {/* Titre sur toute la largeur des trois colonnes */}
        <h2 className="mt-4 line-clamp-3 min-h-[3lh] max-w-4xl font-serif text-2xl leading-tight md:text-3xl lg:text-4xl">
          {article.title}
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Chapô : une colonne à gauche */}
          <div className="flex flex-col justify-between md:col-span-1">
            <Description
              text={article.description}
              className="line-clamp-6 min-h-[6lh] leading-relaxed text-gray-300"
            />

            <p className={`mt-6 ${READ_MORE}`}>Lire l’article →</p>
          </div>

          {/* Photo : deux colonnes à droite */}
          <div className="relative h-[320px] overflow-hidden md:col-span-2 md:h-[440px]">
            <SafeImage
              src={article.image || FALLBACK_IMAGE}
                alt={article.title}
                fill
              sizes="(max-width: 768px) 100vw, 44vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

function BriefingAdvertisement() {
  return (
    <section className="overflow-hidden border-y border-gray-800 bg-white">
      <Image
        src="/images/home/briefing-andorra-360.jpg"
        alt="Andorra 360 — Le briefing quotidien pour comprendre l’Andorre"
        width={762}
        height={512}
        sizes="(max-width: 1280px) 100vw, 66vw"
        className="h-auto w-full"
      />
    </section>
  );
}

function Editorial({ article }: { article: HomeArticle | null }) {
  const videoEmbedUrl = article?.videoUrl ? getVideoEmbedUrl(article.videoUrl) : null;

  return (
    <section className="border-b border-gray-800 pb-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500 text-3xl text-yellow-500">
          ✒
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-500">
            ANDORRA 360
          </p>

          <h2 className="mt-1 font-serif text-3xl">L’Édito</h2>
        </div>
      </div>

      {article ? (
        <div className="mt-6">
          <Link href={href(article)} className="group block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              La voix de la rédaction
            </p>

            <h3 className="mt-3 line-clamp-3 min-h-[3lh] font-serif text-2xl leading-snug transition group-hover:text-yellow-500">
              {article.title}
            </h3>

            <Description
              text={article.description}
              className="mt-4 line-clamp-2 min-h-[2lh] leading-relaxed text-gray-400"
            />
          </Link>

          {/* Le lecteur vidéo reste hors du lien : on peut lancer la vidéo sans quitter la page. */}
          <div className="relative mt-5 h-64 overflow-hidden rounded-xl bg-black">
            {videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title={`Vidéo : ${article.title}`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <Link href={href(article)} className="block h-full">
                <SafeImage
                  src={article.image || FALLBACK_IMAGE}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 33vw"
                  className="object-cover"
                />
              </Link>
            )}
          </div>

          <Link href={href(article)} className={`mt-5 block ${READ_MORE}`}>
            Lire l’édito →
          </Link>
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-gray-700 p-5">
          <p className="text-sm leading-relaxed text-gray-500">
            Aucun édito n’est actuellement programmé.
          </p>
        </div>
      )}
    </section>
  );
}

function Selection({ articles }: { articles: HomeArticle[] }) {
  return (
    <section className="border-t-2 border-yellow-500 pt-5">
      <div className="mb-4">
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">La rédaction</span>

        <h2 className="mt-1 font-serif text-2xl">Sélection</h2>
      </div>

      <div className="divide-y divide-gray-800">
        {articles.map((article, index) => (
          <Link key={article.id} href={href(article)} className="group block py-6">
            <article className="grid grid-cols-[110px_1fr] gap-4">
              <div className="relative h-[110px] overflow-hidden">
                <SafeImage
                  src={article.image || FALLBACK_IMAGE}
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

                <h3 className="mt-3 line-clamp-4 min-h-[4lh] font-serif text-lg leading-snug transition group-hover:text-yellow-500">
                  {article.title}
                </h3>

                <p className={`mt-4 ${READ_MORE}`}>Lire l’article →</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Discover({ articles }: { articles: HomeArticle[] }) {
  return (
    <section className="rounded-xl bg-zinc-900 p-6 xl:flex xl:flex-1 xl:flex-col">
      <p className={KICKER}>Continuer la lecture</p>

      <h2 className="mt-2 font-serif text-2xl">À découvrir</h2>

      <div className="mt-5 divide-y divide-zinc-700">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={href(article)}
            className="group flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                {article.category}
              </p>

              <h3 className="mt-1 line-clamp-3 min-h-[3lh] font-serif leading-snug transition group-hover:text-yellow-500">
                {article.title}
              </h3>

              <p className={`mt-3 ${READ_MORE}`}>Lire l’article →</p>
            </div>

            <span className="mt-4 shrink-0 text-yellow-500">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePageView({ home }: { home: HomeComposition<HomeArticle> }) {
  if (!home.hero) {
    return <EmptyHome />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Hero article={home.hero} />

      {/* CORPS ÉDITORIAL : 4 COLONNES + 2 COLONNES */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid items-start gap-10 xl:grid-cols-6">
          <div className="flex flex-col gap-10 xl:col-span-4">
            {home.feature && <FeatureCard article={home.feature} />}

            {(home.briefs.length > 0 || home.grandFormat) && (
              <div className="grid gap-8 lg:grid-cols-4">
                {home.briefs.length > 0 && <Briefs articles={home.briefs} />}
                {home.grandFormat && <GrandFormat article={home.grandFormat} />}
              </div>
            )}

            <BriefingAdvertisement />
          </div>

          <aside className="flex flex-col gap-9 xl:col-span-2 xl:self-stretch xl:border-l xl:border-gray-800 xl:pl-8">
            <Editorial article={home.editorial} />
            {home.cards.length > 0 && <Selection articles={home.cards} />}
            {home.discover.length > 0 && <Discover articles={home.discover} />}
          </aside>
        </div>
      </section>
    </main>
  );
}
