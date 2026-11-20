/**
 * Convertit l’adresse d’une vidéo hébergée (YouTube, Vimeo, Facebook, TikTok)
 * en adresse de lecteur intégrable. Renvoie `null` pour toute autre adresse,
 * y compris un domaine qui imite seulement un hébergeur connu.
 */

function isHost(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function getVideoEmbedUrl(url: string): string | null {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  if (isHost(hostname, "youtube.com")) {
    const videoId =
      parsedUrl.searchParams.get("v") ?? (segments[0] === "shorts" ? segments[1] : undefined);

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (isHost(hostname, "youtu.be")) {
    return segments[0] ? `https://www.youtube.com/embed/${segments[0]}` : null;
  }

  if (isHost(hostname, "vimeo.com")) {
    const videoId = segments.find((segment) => /^\d+$/.test(segment));

    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  if (isHost(hostname, "facebook.com") || isHost(hostname, "fb.watch")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }

  if (isHost(hostname, "tiktok.com")) {
    const videoId = parsedUrl.pathname.match(/\/video\/(\d+)/)?.[1];

    return videoId ? `https://www.tiktok.com/player/v1/${videoId}` : null;
  }

  return null;
}
