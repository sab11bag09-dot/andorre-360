import { getImageMetadata } from "./image";

export type MediaMetadata = {
  size: number;
  mimeType: string;
  width: number | null;
  height: number | null;
};

export async function extractMediaMetadata(
  buffer: Buffer,
  mimeType: string
): Promise<MediaMetadata> {
  if (!mimeType.startsWith("image/")) {
    return {
      size: buffer.length,
      mimeType,
      width: null,
      height: null,
    };
  }

  const imageMetadata =
    await getImageMetadata(buffer);

  return {
    size: buffer.length,
    mimeType,
    width: imageMetadata.width,
    height: imageMetadata.height,
  };
}