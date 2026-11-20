import Link from "next/link";
import type { ReactNode } from "react";

import MediaPreview from "@/components/article/MediaPreview";
import SafeImage from "@/components/SafeImage";

/**
 * Cartes partagées des pages de rubrique.
 *
 * Une page décrit son plan et sa répartition d’articles ; le rendu de chaque
 * rôle (une, article principal, brève, carte, Question à…, Bon à savoir) est
 * défini ici une seule fois. Les titres sont limités en nombre de lignes,
 * jamais par une hauteur fixe : un titre de 70 caractères s’affiche en entier
 * à toutes les largeurs d’écran. Les cartes d’une même rangée ont la même
 * hauteur, et l’appel à lire est aligné en bas de chacune.
 */

export type RubricArticle = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  videoUrl: string | null;
  category: string;
};

const CARD_FRAME =
  "flex h-full flex-col overflow-hidden rounded-xl border border-gray-800 transition hover:border-yellow-500";
const KICKER = "text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500";

function articleHref(article: RubricArticle): string {
  return `/article/${article.slug}`;
}

function ReadMore({ label = "Lire l’article →" }: { label?: string }) {
  return (
    <p className="mt-auto pt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
      {label}
    </p>
  );
}

function Description({ text, className }: { text: string | null; className: string }) {
  return text ? <p className={className}>{text}</p> : null;
}

// ---------------------------------------------------------------------------
// Structure de page
// ---------------------------------------------------------------------------

/** Squelette commun : une, bandeau facultatif, colonne principale et colonne latérale. */
export function RubricPage({
  hero,
  banner,
  aside,
  children,
}: {
  hero?: ReactNode;
  banner?: ReactNode;
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      {hero}
      {banner}

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-6">
          <div className="flex flex-col gap-8 lg:col-span-4">{children}</div>
          <aside className="flex flex-col gap-6 lg:col-span-2">{aside}</aside>
        </div>
      </section>
    </main>
  );
}

/**
 * Grille de cartes de la colonne principale. `fill` l’étire pour qu’elle
 * termine la colonne à la hauteur de la colonne latérale.
 */
export function RubricGrid({
  columns,
  fill = false,
  children,
}: {
  columns: 2 | 3;
  fill?: boolean;
  children: ReactNode;
}) {
  const layout = columns === 3 ? "gap-4 md:grid-cols-3" : "gap-6 md:grid-cols-2";

  return <div className={`grid ${layout}${fill ? " lg:flex-1" : ""}`}>{children}</div>;
}

/** Bouton vers un partenaire, en tête de colonne latérale. */
export function RubricPartnerLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-lg bg-yellow-500 px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-yellow-400"
    >
      {label}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Cartes
// ---------------------------------------------------------------------------

/** Une de la rubrique, en pleine largeur. */
export function RubricHero({
  article,
  categoryLabel,
}: {
  article: RubricArticle;
  categoryLabel?: string;
}) {
  return (
    <Link href={articleHref(article)} className="block">
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <SafeImage
          src={article.image}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute bottom-10 left-6 right-6 max-w-3xl md:left-8">
          <p className="text-sm uppercase tracking-widest text-yellow-500">
            {categoryLabel ?? article.category}
          </p>

          <h1 className="mt-4 line-clamp-4 font-serif text-[1.75rem] leading-[1.15] md:line-clamp-3 md:text-5xl">
            {article.title}
          </h1>

          <Description
            text={article.description}
            className="mt-4 line-clamp-2 leading-6 text-gray-300"
          />

          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-yellow-500">
            Lire l’article →
          </p>
        </div>
      </section>
    </Link>
  );
}

/** Article principal, en tête de la colonne principale ; seule carte qui lit la vidéo. */
export function RubricMainCard({ article }: { article: RubricArticle }) {
  return (
    <Link href={articleHref(article)} className="block">
      <article className={CARD_FRAME}>
        <div className="relative h-72 md:h-[420px]">
          <MediaPreview
            image={article.image}
            videoUrl={article.videoUrl}
            title={article.title}
            mode="featured"
          />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h2 className="line-clamp-4 font-serif text-[1.75rem] leading-[1.1] md:line-clamp-3 md:text-4xl">
            {article.title}
          </h2>

          <Description
            text={article.description}
            className="mt-4 line-clamp-2 leading-6 text-gray-400"
          />

          <ReadMore />
        </div>
      </article>
    </Link>
  );
}

/** Brève : titre seul, dans une grille de trois. */
export function RubricBriefCard({ article }: { article: RubricArticle }) {
  return (
    <Link href={articleHref(article)} className="block">
      <article className="flex h-full flex-col rounded-lg md:min-h-[150px] border border-gray-800 p-4 transition hover:border-yellow-500">
        <h3 className="line-clamp-4 font-serif text-lg leading-snug">{article.title}</h3>

        <ReadMore />
      </article>
    </Link>
  );
}

/** Carte sans image : titre et chapô. */
export function RubricTextCard({ article }: { article: RubricArticle }) {
  return (
    <Link href={articleHref(article)} className="block">
      <article className={`${CARD_FRAME} p-5`}>
        <h2 className="line-clamp-3 font-serif text-xl leading-snug xl:text-2xl">
          {article.title}
        </h2>

        <Description
          text={article.description}
          className="mt-3 line-clamp-2 leading-6 text-gray-400"
        />

        <ReadMore />
      </article>
    </Link>
  );
}

/**
 * Carte avec image. `wide` : carte de la colonne principale (deux par rangée) ;
 * `side` : carte de la colonne latérale. `stretch` agrandit l’image pour que la
 * carte remplisse la hauteur disponible.
 *
 * Les liens restent en `block` : dans une grille, la cellule s’étire seule et
 * la carte la remplit (`h-full`) ; dans la colonne latérale, seule la carte
 * `stretch` grandit (`lg:flex-1`).
 */
export function RubricImageCard({
  article,
  size,
  showDescription = true,
  stretch = false,
}: {
  article: RubricArticle;
  size: "wide" | "side";
  showDescription?: boolean;
  stretch?: boolean;
}) {
  const wide = size === "wide";
  const imageHeight = wide ? "h-56" : "h-40";
  const stretchImage = stretch ? (wide ? " lg:h-auto lg:min-h-56 lg:flex-1" : " lg:h-auto lg:min-h-40 lg:flex-1") : "";

  return (
    <Link href={articleHref(article)} className={`block${stretch ? " lg:flex-1" : ""}`}>
      <article className={CARD_FRAME}>
        <div className={`relative shrink-0 ${imageHeight}${stretchImage}`}>
          <MediaPreview image={article.image} videoUrl={article.videoUrl} title={article.title} />
        </div>

        <div className={`flex flex-col ${wide ? "p-5" : "p-4"}${stretch ? "" : " flex-1"}`}>
          {wide ? (
            <h2 className="line-clamp-3 font-serif text-xl leading-snug xl:text-2xl">
              {article.title}
            </h2>
          ) : (
            <h3 className="line-clamp-4 font-serif text-lg leading-snug">{article.title}</h3>
          )}

          {showDescription ? (
            <Description
              text={article.description}
              className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-400"
            />
          ) : null}

          <ReadMore />
        </div>
      </article>
    </Link>
  );
}

/** Entretien « Question à… », en tête de la colonne latérale. */
export function RubricQuestionCard({
  article,
  fallbackImage,
}: {
  article: RubricArticle;
  fallbackImage?: string | null;
}) {
  return (
    <Link href={articleHref(article)} className="block">
      <article className={CARD_FRAME}>
        <div className="relative h-56 shrink-0">
          <MediaPreview
            image={article.image ?? fallbackImage ?? null}
            videoUrl={article.videoUrl}
            title={article.title}
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className={KICKER}>Question à…</p>

          <h2 className="mt-3 line-clamp-4 font-serif text-xl leading-snug xl:text-2xl">
            {article.title}
          </h2>

          <Description
            text={article.description}
            className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400"
          />

          <ReadMore label="Lire l’entretien →" />
        </div>
      </article>
    </Link>
  );
}

/** Encadré « Bon à savoir », avec une brève facultative en dessous. */
export function RubricGoodToKnow({
  article,
  brief,
}: {
  article: RubricArticle;
  brief?: RubricArticle | null;
}) {
  return (
    <section className="overflow-hidden rounded-xl border-t-2 border-yellow-500 bg-zinc-900">
      <Link
        href={articleHref(article)}
        className="flex flex-col p-6 transition hover:bg-zinc-800"
      >
        <p className={KICKER}>Bon à savoir</p>

        <h2 className="mt-4 line-clamp-4 font-serif text-xl leading-snug xl:line-clamp-3 xl:text-2xl">
          {article.title}
        </h2>

        <Description
          text={article.description}
          className="mt-4 line-clamp-3 leading-6 text-gray-400"
        />

        <ReadMore />
      </Link>

      {brief ? (
        <Link
          href={articleHref(brief)}
          className="flex flex-col border-t border-zinc-700 p-5 transition hover:bg-zinc-800"
        >
          <h3 className="line-clamp-4 font-serif text-lg leading-snug">{brief.title}</h3>

          <ReadMore />
        </Link>
      ) : null}
    </section>
  );
}
