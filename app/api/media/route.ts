import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      media,
    });
  } catch (error) {
    console.error("Erreur lors du chargement des médias :", error);

    return NextResponse.json(
      {
        error: "Impossible de charger la bibliothèque de médias.",
      },
      {
        status: 500,
      },
    );
  }
}