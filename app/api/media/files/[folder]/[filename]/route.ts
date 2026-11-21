import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";

import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { resolvePublicMediaFile } from "@/lib/media/resolvePublicMediaFile";
import { isSourceTestMediaFile } from "@/lib/media/sourceTestMedia";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> }
) {
  const { folder, filename } = await params;

  // Les photos reprises des sources pour les essais ne sont jamais publiques.
  const sourceTestFile = isSourceTestMediaFile(folder, filename);
  if (sourceTestFile) {
    const authorizationError = await requireAdminApi();
    if (authorizationError) return authorizationError;
  }

  const mediaFile = resolvePublicMediaFile(folder, filename);

  if (!mediaFile) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 },
    );
  }

  try {
    const buffer = await readFile(mediaFile.filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mediaFile.contentType,
        "Cache-Control": sourceTestFile
          ? "private, no-store"
          : "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
