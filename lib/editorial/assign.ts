import { prisma } from "@/lib/prisma";

import { EditorialZone } from "./zones";

export interface AssignPublicationOptions {
  articleId: number;
  pageKey: string;
  zone: EditorialZone;
}

export interface AssignPublicationResult {
  success: boolean;
  movedArticles: number;
  message: string;
}

/**
 * Affecte un article à une zone éditoriale.
 *
 * Cette fonction deviendra le cœur du Studio.
 *
 * Elle sera utilisée par :
 *
 * - le bouton "Remplacer"
 * - le glisser-déposer
 * - les automatisations
 * - l'IA
 * - les futures applications mobiles
 */
export async function assignPublicationToZone(
  options: AssignPublicationOptions
): Promise<AssignPublicationResult> {
  const { articleId } = options;

  // Vérification de l'existence de l'article

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    return {
      success: false,
      movedArticles: 0,
      message: "Article introuvable.",
    };
  }

  // Le vrai moteur de cascade sera construit
  // dans le prochain sprint.

  return {
    success: true,
    movedArticles: 0,
    message: "Moteur prêt.",
  };
}