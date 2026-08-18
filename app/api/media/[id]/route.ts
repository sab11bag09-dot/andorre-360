import { unlink } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const authorizationError = await requireAdminApi();

  if (authorizationError) {
    return authorizationError;
  }

  try {
    const { id } = await context.params;
    const mediaId = Number(id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return NextResponse.json(
        { error: "Identifiant du média invalide." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const title = normalizeOptionalString(body.title);
    const alt = normalizeOptionalString(body.alt);
    const caption = normalizeOptionalString(body.caption);
    const credit = normalizeOptionalString(body.credit);
    const copyright = normalizeOptionalString(body.copyright);

    const media = await prisma.media.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Média introuvable." },
        { status: 404 }
      );
    }

    const updatedMedia = await prisma.media.update({
      where: {
        id: mediaId,
      },
      data: {
        title,
        alt,
        caption,
        credit,
        copyright,
      },
    });

    return NextResponse.json({
      success: true,
      media: updatedMedia,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du média :", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour le média." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const authorizationError = await requireAdminApi();

  if (authorizationError) {
    return authorizationError;
  }

  try {
    const { id } = await context.params;
    const mediaId = Number(id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return NextResponse.json(
        { error: "Identifiant du média invalide." },
        { status: 400 }
      );
    }

    const media = await prisma.media.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Média introuvable." },
        { status: 404 }
      );
    }
    const usageCount = await prisma.mediaUsage.count({
  where: {
    mediaId,
  },
});

if (usageCount > 0) {
  return NextResponse.json(
    {
      error:
        "Ce média est encore utilisé dans un ou plusieurs articles.",
    },
    { status: 409 },
  );
}

    if (media.path.startsWith("/uploads/")) {
      const relativePath = media.path.replace(/^\/+/, "");
      const filePath = path.join(
        process.cwd(),
        "public",
        relativePath
      );

      try {
        await unlink(filePath);
      } catch (error) {
        const fileError = error as NodeJS.ErrnoException;

        if (fileError.code !== "ENOENT") {
          throw error;
        }
      }
    }

    await prisma.media.delete({
      where: {
        id: mediaId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Le média a été supprimé.",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du média :", error);

    return NextResponse.json(
      { error: "Impossible de supprimer le média." },
      { status: 500 }
    );
  }
}
