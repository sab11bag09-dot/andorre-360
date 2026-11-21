import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";

/** Médiathèque complète : chemins, crédits, droits et origine des photos. Réservée aux administrateurs. */
export async function GET() {
  const authorizationError = await requireAdminApi();
  if (authorizationError) return authorizationError;

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