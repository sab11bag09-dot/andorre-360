import { randomUUID } from "node:crypto";
import { isIP } from "node:net";

/**
 * Reprise de la photo d’un article collecté dans la médiathèque.
 *
 * La reprise dépend du réglage de la source (`imageReuse`) : jamais par
 * défaut ; « essais » pour le chantier, où la photo est marquée `testOnly`
 * et l’article ne peut pas être publié ; « autorisée » quand une licence ou un
 * accord le permet. La photo garde son crédit (nom de la source), la mention
 * de droits relevée et son adresse d’origine.
 *
 * Un échec ne bloque jamais l’article : il garde alors l’image générique.
 */

export type SourceImageReuse = "NONE" | "TESTS" | "ALLOWED";

export type SourceImageInput = {
  imageUrl: string | null;
  imageRights: string | null;
  sourceName: string;
  reuse: SourceImageReuse;
  alt: string;
};

export type ImportedSourceImage = {
  mediaId: number;
  path: string;
  testOnly: boolean;
};

export type SourceMediaData = {
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  credit: string;
  copyright: string | null;
  sourceUrl: string;
  testOnly: boolean;
};

export type SourceImageDependencies = {
  findBySourceUrl(url: string): Promise<{ id: number; path: string; testOnly: boolean } | null>;
  download(url: string): Promise<{ buffer: Buffer; contentType: string }>;
  readDimensions(buffer: Buffer): Promise<{ width: number; height: number }>;
  saveFiles(filename: string, buffer: Buffer): Promise<void>;
  createMedia(data: SourceMediaData): Promise<{ id: number; path: string; testOnly: boolean }>;
};

export const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
/** Largeur minimale pour illustrer une carte sans flou. */
export const MIN_SOURCE_IMAGE_WIDTH = 480;

const IMAGE_EXTENSIONS: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isPrivateIPv4(address: string): boolean {
  const [a, b] = address.split(".").map(Number);

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase();

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:")
  );
}

/**
 * Le serveur ne télécharge qu’une adresse web publique : jamais un fichier
 * local ni une machine du réseau interne, qu’une page malveillante pourrait
 * désigner comme image.
 */
export function isFetchableImageUrl(value: string): boolean {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return false;
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return false;
  }

  const ipVersion = isIP(hostname);

  if (ipVersion === 4) {
    return !isPrivateIPv4(hostname);
  }

  if (ipVersion === 6) {
    return !isPrivateIPv6(hostname);
  }

  return hostname.includes(".");
}

function originalName(url: string): string {
  const name = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "photo";

  return decodeURIComponent(name).slice(0, 200);
}

export async function importSourceImage(
  input: SourceImageInput,
  dependencies: SourceImageDependencies,
): Promise<ImportedSourceImage | null> {
  if (input.reuse === "NONE" || !input.imageUrl || !isFetchableImageUrl(input.imageUrl)) {
    return null;
  }

  try {
    const existing = await dependencies.findBySourceUrl(input.imageUrl);

    if (existing) {
      return { mediaId: existing.id, path: existing.path, testOnly: existing.testOnly };
    }

    const { buffer, contentType } = await dependencies.download(input.imageUrl);
    const mimeType = contentType.split(";")[0].trim().toLowerCase();
    const extension = IMAGE_EXTENSIONS[mimeType];

    if (!extension || buffer.length === 0 || buffer.length > MAX_SOURCE_IMAGE_BYTES) {
      return null;
    }

    const { width, height } = await dependencies.readDimensions(buffer);

    if (width < MIN_SOURCE_IMAGE_WIDTH) {
      return null;
    }

    // Préfixe « source- » : les vignettes de ces photos restent hors Git.
    const filename = `source-${randomUUID()}.${extension}`;

    await dependencies.saveFiles(filename, buffer);

    const media = await dependencies.createMedia({
      filename,
      originalName: originalName(input.imageUrl),
      path: `/api/media/files/sources/${filename}`,
      mimeType,
      size: buffer.length,
      width,
      height,
      alt: input.alt,
      credit: input.sourceName,
      copyright: input.imageRights,
      sourceUrl: input.imageUrl,
      testOnly: input.reuse === "TESTS",
    });

    return { mediaId: media.id, path: media.path, testOnly: media.testOnly };
  } catch (error) {
    console.warn("[importSourceImage] Photo non reprise", {
      imageUrl: input.imageUrl,
      error: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}
