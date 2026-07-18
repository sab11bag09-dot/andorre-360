import { unlink } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
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

    const alt =
      typeof body.alt === "string"
        ? body.alt.trim()
        : "";

    const caption =
      typeof body.caption === "string"
        ? body.caption.trim()
        : "";

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
        alt,
        caption,
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