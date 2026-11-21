// Sans dépendance Node : utilisé aussi dans le navigateur (SafeImage).

/**
 * Photo reprise d’une source pour les essais du chantier : son original
 * (`sources/`) et sa miniature (`thumbnails/source-…`). Elle ne doit être
 * servie qu’à un administrateur.
 */
export function isSourceTestMediaFile(folder: string, filename: string): boolean {
  return folder === "sources" || (folder === "thumbnails" && filename.startsWith("source-"));
}

/** Chemin public d’une photo de source réservée aux essais. */
export function isSourceTestMediaPath(path: string): boolean {
  const match = /^\/api\/media\/files\/([^/]+)\/([^/?#]+)/.exec(path);
  return match ? isSourceTestMediaFile(match[1], match[2]) : false;
}
