export {};

import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@/lib/generated/prisma/enums";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { Media } from "@/lib/generated/prisma/client";

import { saveMediaFile } from "./storage";

const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];

export async function uploadMedia(file: File): Promise<Media> {
  if (!file) {
   throw new Error("Aucun fichier n’a été fourni.");
  }

  if (file.size === 0) {
    throw new Error("Le fichier téléversé est vide.");
  }

    if (file.size > MAX_FILE_SIZE) {
    throw new Error("Le fichier dépasse la limite de 300 Mo.");
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    throw new Error(
      "Format non pris en charge. Formats autorisés : JPEG, PNG, WebP, MP4 et WebM."
    );
  }

  const extension = extname(file.name).toLowerCase();
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

 const metadata = isImage
  ? await sharp(buffer).metadata()
  : { width: null, height: null };

  await saveMediaFile("originals", filename, buffer);

  if (isImage) {
  const thumbnailBuffer = await sharp(buffer)
    .resize({
      width: 400,
      withoutEnlargement: true,
    })
    .toBuffer();

  await saveMediaFile("thumbnails", filename, thumbnailBuffer);
}

  return prisma.media.create({
    data: {
      type: isVideo ? MediaType.VIDEO : MediaType.IMAGE,
      filename,
      originalName: file.name,
      path: `/api/media/files/originals/${filename}`,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
    },
  });
}