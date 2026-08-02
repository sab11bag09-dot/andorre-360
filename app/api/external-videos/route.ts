import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";
import { ExternalVideoProvider } from "@/lib/generated/prisma/enums";

function detectProvider(url: string): ExternalVideoProvider | null {
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    return ExternalVideoProvider.YOUTUBE;
  }

  if (hostname.includes("vimeo.com")) {
    return ExternalVideoProvider.VIMEO;
  }

  if (hostname.includes("tiktok.com")) {
    return ExternalVideoProvider.TIKTOK;
  }

  if (hostname.includes("facebook.com") || hostname.includes("fb.watch")) {
    return ExternalVideoProvider.FACEBOOK;
  }

  return null;
}

export async function GET() {
  try {
    const externalVideos = await prisma.externalVideo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      externalVideos,
    });
  } catch (error) {
    console.error(
      "Erreur lors du chargement des vidéos externes :",
      error,
    );

    return NextResponse.json(
      {
        error: "Impossible de charger les vidéos externes.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  const authorizationError = await requireAdminApi();

  if (authorizationError) {
    return authorizationError;
  }

  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { error: "L’URL est obligatoire." },
        { status: 400 },
      );
    }

    let provider: ExternalVideoProvider | null = null;

    try {
      provider = detectProvider(url);
    } catch {
      return NextResponse.json(
        { error: "L’URL n’est pas valide." },
        { status: 400 },
      );
    }

    if (!provider) {
      return NextResponse.json(
        {
          error: "Cette plateforme vidéo n’est pas prise en charge.",
        },
        { status: 400 },
      );
    }

    const externalVideo = await prisma.externalVideo.create({
      data: {
        url,
        provider,
      },
    });

    return NextResponse.json(
      {
        message: "Vidéo externe enregistrée.",
        externalVideo,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erreur lors de l’ajout de la vidéo externe :",
      error,
    );

    return NextResponse.json(
      {
        error: "Impossible d’enregistrer la vidéo externe.",
      },
      {
        status: 500,
      },
    );
  }
}
