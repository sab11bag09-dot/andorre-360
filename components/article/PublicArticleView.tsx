import ArticleRenderer from "@/components/article/ArticleRenderer";
import SafeImage from "@/components/SafeImage";

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
}

type Props = {
  article: PublicArticleViewData;
  dateLocale: "ca-ES" | "es-ES" | "fr-FR";
  contentLanguage: "ca" | "es" | "fr";
};

function getVideoEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      const shortsMatch = parsedUrl.pathname.match(/^\/shorts\/([^/?]+)/);

      if (shortsMatch) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }
    }

    if (hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (hostname.includes("vimeo.com")) {
      const videoId = parsedUrl.pathname
        .split("/")
        .filter(Boolean)
        .find((segment) => /^\d+$/.test(segment));

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    if (
      hostname.includes("facebook.com") ||
      hostname.includes("fb.watch")
    ) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url,
      )}&show_text=false`;
    }

    if (hostname.includes("tiktok.com")) {
      const videoId = parsedUrl.pathname.match(/\/video\/(\d+)/)?.[1];

      if (videoId) {
        return `https://www.tiktok.com/player/v1/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

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
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          ) : (
            <iframe
              src={videoEmbedUrl ?? undefined}
              title={`Vidéo : ${article.title}`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 p-10">
            <p className="tracking-widest text-yellow-500">
              {article.category}
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

          <div className="absolute bottom-0 left-0 p-10">
            <p className="tracking-widest text-yellow-500">
              {article.category}
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
              {article.category}
            </p>

            <h1 className="mt-4 font-serif text-5xl md:text-6xl">
              {article.title}
            </h1>
          </div>
        </div>
      )}

      <article className="mx-auto max-w-4xl p-8">
        {article.languageVariants && article.languageVariants.length > 0 && (
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Versions linguistiques">
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
          <p>• Par {article.author}</p>
        </div>

        <p className="mt-4 text-sm tracking-widest text-yellow-500">
          TEMPS DE LECTURE : {article.readingTime}
        </p>

        <p className="mt-8 text-xl leading-relaxed text-gray-200">
          {article.description}
        </p>

        <div className="mt-10">
          <ArticleRenderer content={article.content} />
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6">
          <p className="text-gray-400">Article signé</p>
          <p className="mt-2 text-xl text-yellow-500">{article.author}</p>
        </div>
      </article>
    </main>
  );
}
