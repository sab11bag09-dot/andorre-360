import {
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

const PUBLIC_MEDIA_FOLDERS = new Set([
  "originals",
  "optimized",
  "thumbnails",
]);

const MEDIA_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const SAFE_MEDIA_FILENAME =
  /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,254}$/;

export type PublicMediaFile = {
  filePath: string;
  contentType: string;
};

export function resolvePublicMediaFile(
  folder: string,
  filename: string,
  projectRoot = process.cwd(),
): PublicMediaFile | null {
  if (
    !PUBLIC_MEDIA_FOLDERS.has(folder) ||
    !SAFE_MEDIA_FILENAME.test(filename)
  ) {
    return null;
  }

  const extension = filename
    .slice(filename.lastIndexOf("."))
    .toLowerCase();
  const contentType = MEDIA_MIME_TYPES[extension];

  if (!contentType) {
    return null;
  }

  const mediaRoot = resolve(projectRoot, "storage", "media");
  const filePath = resolve(mediaRoot, folder, filename);
  const relativePath = relative(mediaRoot, filePath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    return null;
  }

  return {
    filePath,
    contentType,
  };
}
