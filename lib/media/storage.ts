import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MEDIA_ROOT = path.join(
  process.cwd(),
  "storage",
  "media"
);

export type MediaStorageFolder =
  | "originals"
  | "optimized"
  | "thumbnails";

export function getMediaDirectory(
  folder: MediaStorageFolder
): string {
  return path.join(MEDIA_ROOT, folder);
}

export function getMediaFilePath(
  folder: MediaStorageFolder,
  filename: string
): string {
  return path.join(
    getMediaDirectory(folder),
    filename
  );
}

export async function saveMediaFile(
  folder: MediaStorageFolder,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const directory = getMediaDirectory(folder);

  await mkdir(directory, {
    recursive: true,
  });

  const filePath = getMediaFilePath(
    folder,
    filename
  );

  await writeFile(filePath, buffer);

  return filePath;
}