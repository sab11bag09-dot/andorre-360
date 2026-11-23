import ArticleRenderer from "@/components/article/ArticleRenderer";
import SafeImage from "@/components/SafeImage";
import { getVideoEmbedUrl } from "@/lib/media/videoEmbed";
import { imageCreditLabel } from "@/lib/media/imageCredit";
import { categoryLabel } from "@/lib/article-engine/categoryLabels";
import {
  type ArticleSourceCredit,
  sourceAttributionLead,
  sourceAttributionSeparator,
} from "@/lib/article-engine/articleSourceCredits";

export interface PublicArticleViewData {
  title: string;
  description: string;
  content: string;
  category: string;
  image: string | null;
  author: string;
  readingTime: string;
  videoUrl: string | null;
  publishedAt: Date;
  languageVariants?: Array<{ locale: string; label: string; href: string }>;
  /** Sources dont l’article est tiré : « D’après… » sous le titre. */
  sourceCredits?: ArticleSourceCredit[];
  /** Crédit de la photo (médiathèque), par exemple le nom de la source. */
  imageCredit?: string | null;
}

type Props = {
  article: PublicArticleViewData;
  dateLocale: "ca-ES" | "es-ES" | "fr-FR";
  contentLanguage: "ca" | "es" | "fr";
};

/** Mots fixes de la page, dans la langue de l’article. */
const LABELS = {
  fr: {
    by: "Par",
    readingTime: "TEMPS DE LECTURE :",
    signed: "Article signé",
    languages: "Versions linguistiques",
    video: "Vidéo",
    noVideo: "Votre navigateur ne prend pas en charge la lecture vidéo.",
  },
  ca: {
    by: "Per",
    readingTime: "TEMPS DE LECTURA:",
    signed: "Article signat",
    languages: "Versions lingüístiques",
    video: "Vídeo",
    noVideo: "El vostre navegador no permet reproduir el vídeo.",
  },
  es: {
    by: "Por",
    readingTime: "TIEMPO DE LECTURA:",
    signed: "Artículo firmado",
    languages: "Versiones lingüísticas",
    video: "Vídeo",
    noVideo: "Su navegador no permite reproducir el vídeo.",
  },
} as const;

function isUploadedVideo(url: string) {
  return url.startsWith("/") || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export default function PublicArticleView({
  article,
  dateLocale,
  contentLanguage,
}: Props) {
  const videoEmbedUrl = article.videoUrl
    ? getVideoEmbedUrl(article.videoUrl)
    : null;
  const labels = LABELS[contentLanguage];
  const credits = article.sourceCredits ?? [];

  return (
    <main
      lang={contentLanguage}
      className="min-h-screen bg-black text-white"
    >
            {article.videoUrl &&
      (isUploadedVideo(article.videoUrl) || videoEmbedUrl) ? (
        <div className="relative h-[500px] w-full overflow-hidden bg-black">
          {isUploadedVideo(article.videoUrl) ? (
            <video
              src={article.videoUrl}
              controls
              autoPlay={false}
              preload="metadata"
              className="h-full w-full object-contain"
            >
              {labels.noVideo}
            </video>
          ) : (
            <iframe
              src={videoEmbedUrl ?? undefined}
              title={`${labels.video}${contentLanguage === "fr" ? " : " : ": "}${article.title}`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 p-10">
            <p className="tracking-widest text-yellow-500">
              {categoryLabel(article.category, contentLanguage)}
            </p>

            <h1 className="mt-4 max-w-4xl font-serif text-5xl md:text-6xl">
              {article.title}
            </h1>
          </div>
        </div>
      ) : article.image ? (
        <div className="relative h-[500px] w-full">
          <SafeImage
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/50" />

          {article.imageCredit ? (
            <p className="absolute bottom-3 right-4 z-10 text-xs text-gray-300">
              {imageCreditLabel(contentLanguage)}
              {contentLanguage === "fr" ? " : " : ": "}
              {article.imageCredit}
            </p>
          ) : null}

          <div className="absolute bottom-0 left-0 p-10">
            <p className="tracking-widest text-yellow-500">
              {categoryLabel(article.category, contentLanguage)}
            </p>

            <h1 className="mt-4 max-w-4xl font-serif text-5xl md:text-6xl">
              {article.title}
            </h1>
          </div>
        </div>
      ) : (
        <div className="border-b border-gray-800 bg-zinc-950 px-8 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="tracking-widest text-yellow-500">
              {categoryLabel(article.category, contentLanguage)}
            </p>

            <h1 className="mt-4 font-serif text-5xl md:text-6xl">
              {article.title}
            </h1>
          </div>
        </div>
      )}

      <article className="mx-auto max-w-4xl p-8">
        {article.languageVariants && article.languageVariants.length > 0 && (
          <nav className="mb-6 flex flex-wrap gap-2" aria-label={labels.languages}>
            {article.languageVariants.map((variant) => (
              <a
                key={variant.locale}
                href={variant.href}
                className="rounded border border-yellow-500 px-3 py-1 text-sm text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                {variant.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap gap-4 text-gray-400">
          <p>{article.publishedAt.toLocaleDateString(dateLocale)}</p>
          <p>• {labels.by} {article.author}</p>
          {credits.length > 0 && (
            <p>
              • {sourceAttributionLead(contentLanguage)}
              {credits.map((credit, index) => (
                <span key={`${index}-${credit.name}`}>
                  {sourceAttributionSeparator(contentLanguage, index, credits.length)}
                  {credit.url ? (
                    <a
                      href={credit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-500"
                    >
                      {credit.name}
                    </a>
                  ) : (
                    credit.name
                  )}
                </span>
              ))}
            </p>
          )}
        </div>

        <p className="mt-4 text-sm tracking-widest text-yellow-500">
          {labels.readingTime} {article.readingTime}
        </p>

        <p className="mt-8 text-xl leading-relaxed text-gray-200">
          {article.description}
        </p>

        <div className="mt-10">
          <ArticleRenderer content={article.content} />
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6">
          <p className="text-gray-400">{labels.signed}</p>
          <p className="mt-2 text-xl text-yellow-500">{article.author}</p>
        </div>
      </article>
    </main>
  );
}
