import {
  type ArticleChannel,
  type ArticleContentType,
  type ArticleDraft,
  createArticleDraft,
} from "./types";
import type { EditorialStatus } from "@/lib/generated/prisma/client";
type ArticleRecord = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  content: string;
  image: string;
  author: string;
  readingTime: string;
  contentType: string;
  videoUrl: string | null;
  videoDuration: string | null;
  socialText: string | null;
  featured: boolean;
  published: boolean;
  editorialStatus: EditorialStatus;
};

type PublicationRecord = {
  channel: string;
  pageKey: string;
  zone: string;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
};

const ARTICLE_CONTENT_TYPES: ArticleContentType[] = [
  "article",
  "editorial",
  "video",
  "interview",
  "podcast",
  "gallery",
];

const ARTICLE_CHANNELS: ArticleChannel[] = [
  "site",
  "application",
  "newsletter",
  "social",
];

function isArticleContentType(
  value: string
): value is ArticleContentType {
  return ARTICLE_CONTENT_TYPES.includes(
    value as ArticleContentType
  );
}

function isArticleChannel(
  value: string
): value is ArticleChannel {
  return ARTICLE_CHANNELS.includes(
    value as ArticleChannel
  );
}

function formatDateTimeLocal(
  value: Date | null
): string {
  if (!value) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(
    value.getMonth() + 1
  ).padStart(2, "0");
  const day = String(value.getDate()).padStart(
    2,
    "0"
  );
  const hours = String(value.getHours()).padStart(
    2,
    "0"
  );
  const minutes = String(
    value.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function mapArticleToDraft(
  article: ArticleRecord,
  publication?: PublicationRecord | null
): ArticleDraft {
  return createArticleDraft({
    id: article.id,

    title: article.title,
    slug: article.slug,

    category: article.category,
    author: article.author,

    description: article.description,
    content: article.content,

    image: article.image,

    contentType: isArticleContentType(
      article.contentType
    )
      ? article.contentType
      : "article",

    videoUrl: article.videoUrl ?? "",
    videoDuration: article.videoDuration ?? "",

    socialText: article.socialText ?? "",

    featured: article.featured,
    published: article.published,
    editorialStatus:
  article.editorialStatus,

    pageKey: publication?.pageKey ?? "home",
    zone: publication?.zone ?? "standard",
    priority: publication?.priority ?? 0,

    channel:
      publication &&
      isArticleChannel(publication.channel)
        ? publication.channel
        : "site",

    startsAt: formatDateTimeLocal(
      publication?.startsAt ?? null
    ),

    endsAt: formatDateTimeLocal(
      publication?.endsAt ?? null
    ),

    readingTime: article.readingTime,
  });
}