import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function createSafeFilename(originalName: string) {
  const extension = path.extname(originalName).toLowerCase();
  const nameWithoutExtension = path.basename(originalName, extension);

  const safeName = nameWithoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniquePart = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  return `${safeName || "image"}-${uniquePart}${extension}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        {
          error: "Aucun fichier n’a été envoyé.",
        },
        {
          status: 400,
        },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(uploadedFile.type)) {
      return NextResponse.json(
        {
          error:
            "Format non accepté. Utilise une image JPEG, PNG, WebP ou GIF.",
        },
        {
          status: 400,
        },
      );
    }

    if (uploadedFile.size === 0) {
      return NextResponse.json(
        {
          error: "Le fichier envoyé est vide.",
        },
        {
          status: 400,
        },
      );
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "L’image dépasse la taille maximale de 10 Mo.",
        },
        {
          status: 400,
        },
      );
    }

    const filename = createSafeFilename(uploadedFile.name);

    const uploadsDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
    );

    await mkdir(uploadsDirectory, {
      recursive: true,
    });

    const fileBuffer = Buffer.from(
      await uploadedFile.arrayBuffer(),
    );

    const absoluteFilePath = path.join(
      uploadsDirectory,
      filename,
    );

    await writeFile(absoluteFilePath, fileBuffer);

    const publicPath = `/uploads/${filename}`;

    const media = await prisma.media.create({
      data: {
        filename,
        originalName: uploadedFile.name,
        path: publicPath,
        mimeType: uploadedFile.type,
        size: uploadedFile.size,
      },
    });

    return NextResponse.json(
      {
        message: "Image téléversée avec succès.",
        media,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Erreur pendant le téléversement :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant le téléversement de l’image.",
      },
      {
        status: 500,
      },
    );
  }
}