import { describe, expect, it } from "vitest";

import { getVideoEmbedUrl } from "./videoEmbed";

describe("getVideoEmbedUrl", () => {
  it.each([
    ["https://www.youtube.com/watch?v=abc123", "https://www.youtube.com/embed/abc123"],
    ["https://youtube.com/shorts/xyz789", "https://www.youtube.com/embed/xyz789"],
    ["https://youtu.be/abc123?t=4", "https://www.youtube.com/embed/abc123"],
    ["https://vimeo.com/channels/staff/123456", "https://player.vimeo.com/video/123456"],
    ["https://www.tiktok.com/@compte/video/7300000000000000000", "https://www.tiktok.com/player/v1/7300000000000000000"],
  ])("convertit %s", (url, embed) => {
    expect(getVideoEmbedUrl(url)).toBe(embed);
  });

  it("convertit une vidéo Facebook en lecteur intégré", () => {
    expect(getVideoEmbedUrl("https://www.facebook.com/page/videos/42")).toBe(
      "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fpage%2Fvideos%2F42&show_text=false",
    );
  });

  it.each([
    "pas une adresse",
    "https://example.com/video.mp4",
    "https://www.youtube.com/watch",
    // Domaines qui ne font qu’imiter un hébergeur connu.
    "https://notyoutube.com/watch?v=abc123",
    "https://youtube.com.example.org/watch?v=abc123",
  ])("refuse %s", (url) => {
    expect(getVideoEmbedUrl(url)).toBeNull();
  });
});
