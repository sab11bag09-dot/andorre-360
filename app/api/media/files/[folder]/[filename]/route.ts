import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

export const runtime = "nodejs";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> }
) {
  const { folder, filename } = await params;

  try {
    const filePath = join(
      process.cwd(),
      "storage",
      "media",
      folder,
      filename
    );

    const buffer = await readFile(filePath);

    const extension = extname(filename).toLowerCase();
    const contentType =
      MIME_TYPES[extension] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}