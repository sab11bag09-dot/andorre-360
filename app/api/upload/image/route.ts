import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function sanitizeFilename(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: Request) {
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

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
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

    const extension = path.extname(file.name).toLowerCase();
    const originalName = path.basename(file.name, extension);
    const safeName = sanitizeFilename(originalName) || "image";
    const uniqueSuffix = crypto.randomUUID();

    const filename = `${safeName}-${uniqueSuffix}${extension}`;
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads"
    );
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, {
      recursive: true,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      src: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Erreur pendant l’upload de l’image :", error);

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