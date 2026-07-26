export {};

import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@/lib/generated/prisma/enums";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { Media } from "@/lib/generated/prisma/client";

import { saveMediaFile } from "./storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadMedia(file: File): Promise<Media> {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size === 0) {
    throw new Error("The uploaded file is empty");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("The uploaded file exceeds the 10 MB limit");
  }

  const extension = extname(file.name).toLowerCase();
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const metadata = await sharp(buffer).metadata();

  await saveMediaFile("originals", filename, buffer);

  const thumbnailBuffer = await sharp(buffer)
    .resize({
      width: 400,
      withoutEnlargement: true,
    })
    .toBuffer();

  await saveMediaFile("thumbnails", filename, thumbnailBuffer);

  return prisma.media.create({
    data: {
      type: MediaType.IMAGE,
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