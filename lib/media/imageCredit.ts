/**
 * Crédit de l’image d’un article, lu dans la médiathèque (`Media.credit`),
 * par exemple le nom de la source d’une photo reprise.
 */

type CreditLookup = {
  media: {
    findUnique(args: {
      where: { path: string };
      select: { credit: true };
    }): Promise<{ credit: string | null } | null>;
  };
};

export async function loadImageCredit(
  image: string | null,
  client: CreditLookup,
): Promise<string | null> {
  if (!image) {
    return null;
  }

  const media = await client.media.findUnique({
    where: { path: image },
    select: { credit: true },
  });

  return media?.credit?.trim() || null;
}

export function imageCreditLabel(language: "fr" | "ca" | "es"): string {
  return language === "fr" ? "Photo" : "Foto";
}
