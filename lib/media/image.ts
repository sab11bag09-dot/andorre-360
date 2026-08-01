import sharp from "sharp";

export async function getImageMetadata(
  buffer: Buffer
) {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    format: metadata.format ?? null,
  };
}

export async function createWebP(
  buffer: Buffer
): Promise<Buffer> {
  return sharp(buffer)
    .webp({
      quality: 85,
    })
    .toBuffer();
}

export async function createThumbnail(
  buffer: Buffer
): Promise<Buffer> {
  return sharp(buffer)
    .resize({
      width: 400,
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
    })
    .toBuffer();
}