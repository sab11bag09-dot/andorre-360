import sharp from "sharp";

import { prisma } from "@/lib/prisma";
import { robotsPolicy } from "@/lib/source-engine/robots/robotsPolicy";

import {
  importSourceImage,
  isFetchableImageUrl,
  MAX_SOURCE_IMAGE_BYTES,
  type ImportedSourceImage,
  type SourceImageDependencies,
  type SourceImageInput,
} from "./importSourceImage";
import { saveMediaFile } from "./storage";

/** Branchement de la reprise des photos sur le réseau, le disque et la base. */

const DOWNLOAD_TIMEOUT_MS = 10_000;

async function download(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  await robotsPolicy.assertAllowed(url);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    headers: { "User-Agent": "ANDORRE360-collecte/1.0", Accept: "image/jpeg,image/png,image/webp" },
  });

  // Une redirection ne doit pas mener vers une machine interne.
  if (!response.ok || !isFetchableImageUrl(response.url || url)) {
    throw new Error(`Réponse ${response.status} pour ${url}`);
  }

  const declaredLength = Number(response.headers.get("content-length") ?? 0);

  if (declaredLength > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error(`Image trop lourde (${declaredLength} octets)`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? "",
  };
}

export const sourceImageDependencies: SourceImageDependencies = {
  findBySourceUrl: (url) =>
    prisma.media.findFirst({
      where: { sourceUrl: url },
      select: { id: true, path: true, testOnly: true },
      orderBy: { id: "asc" },
    }),
  download,
  readDimensions: async (buffer) => {
    const { width, height } = await sharp(buffer).metadata();

    return { width: width ?? 0, height: height ?? 0 };
  },
  saveFiles: async (filename, buffer) => {
    await saveMediaFile("sources", filename, buffer);
    await saveMediaFile(
      "thumbnails",
      filename,
      await sharp(buffer).resize({ width: 400, withoutEnlargement: true }).toBuffer(),
    );
  },
  createMedia: (data) =>
    prisma.media.create({
      data: { type: "IMAGE", ...data },
      select: { id: true, path: true, testOnly: true },
    }),
};

export type SourceImageService = {
  importImage(input: SourceImageInput): Promise<ImportedSourceImage | null>;
  linkToArticle(mediaId: number, articleId: number): Promise<void>;
};

export const prismaSourceImages: SourceImageService = {
  importImage: (input) => importSourceImage(input, sourceImageDependencies),
  linkToArticle: async (mediaId, articleId) => {
    await prisma.mediaUsage.upsert({
      where: {
        mediaId_entityType_entityId_field: {
          mediaId,
          entityType: "ARTICLE",
          entityId: articleId,
          field: "image",
        },
      },
      create: { mediaId, entityType: "ARTICLE", entityId: articleId, field: "image" },
      update: {},
    });
  },
};
