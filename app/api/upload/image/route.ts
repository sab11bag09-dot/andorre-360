import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function sanitizeFilename(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: Request) {
  let filepath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun fichier reçu.",
        },
        {
          status: 400,
        }
      );
    }

    const extension = IMAGE_EXTENSIONS[file.type];

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Format non autorisé. Utilisez une image JPG, PNG, WebP, GIF ou AVIF.",
        },
        {
          status: 415,
        }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Le fichier envoyé est vide.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "L’image ne doit pas dépasser 10 Mo.",
        },
        {
          status: 413,
        }
      );
    }

    const originalExtension = path.extname(file.name);
    const originalBaseName = path.basename(
      file.name,
      originalExtension
    );

    const safeName =
      sanitizeFilename(originalBaseName) || "image";

    const filename = `${safeName}-${crypto.randomUUID()}${extension}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads"
    );

    filepath = path.join(uploadDir, filename);

    const publicPath = `/uploads/${filename}`;

    await mkdir(uploadDir, {
      recursive: true,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filepath, buffer);

    const media = await prisma.media.create({
      data: {
        type: "IMAGE",
        filename,
        originalName: file.name,
        path: publicPath,
        mimeType: file.type,
        size: file.size,
      },
      select: {
        id: true,
        type: true,
        filename: true,
        originalName: true,
        path: true,
        mimeType: true,
        size: true,
        width: true,
        height: true,
        title: true,
        alt: true,
        caption: true,
        credit: true,
        copyright: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        src: media.path,
        media,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (filepath) {
      try {
        await unlink(filepath);
      } catch {
        // Le fichier n’existe peut-être pas encore.
      }
    }

    console.error(
      "Erreur pendant l’upload du média :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Une erreur est survenue pendant l’enregistrement de l’image.",
      },
      {
        status: 500,
      }
    );
  }
}