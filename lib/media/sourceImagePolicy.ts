/**
 * Garde-fou de publication : un article illustré par une photo reprise d’une
 * source pour les essais du chantier (`Media.testOnly`) ne peut pas être
 * publié. Il faut d’abord remplacer l’image.
 */

export const TEST_ONLY_IMAGE_MESSAGE =
  "Publication refusée : l’image vient d’une source réservée aux essais. Remplace-la avant de publier.";

type MediaLookup = {
  media: {
    findUnique(args: {
      where: { path: string };
      select: { testOnly: true };
    }): Promise<{ testOnly: boolean } | null>;
  };
};

export async function isTestOnlyImage(image: string, client: MediaLookup): Promise<boolean> {
  const media = await client.media.findUnique({
    where: { path: image },
    select: { testOnly: true },
  });

  return media?.testOnly === true;
}

export async function assertImagePublishable(image: string, client: MediaLookup): Promise<void> {
  if (await isTestOnlyImage(image, client)) {
    throw new Error(TEST_ONLY_IMAGE_MESSAGE);
  }
}
