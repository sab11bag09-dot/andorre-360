import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SafeImage from "./SafeImage";

describe("SafeImage", () => {
  it("charge une photo de source directement, pour que la connexion administrateur l’accompagne", () => {
    const html = renderToStaticMarkup(
      <SafeImage src="/api/media/files/sources/source-a.jpg" alt="Photo" width={100} height={100} />,
    );

    expect(html).toContain('src="/api/media/files/sources/source-a.jpg"');
    expect(html).not.toContain("/_next/image");
  });

  it("garde l’optimisation pour les autres images", () => {
    const html = renderToStaticMarkup(
      <SafeImage src="/api/media/files/originals/photo.jpg" alt="Photo" width={100} height={100} />,
    );

    expect(html).toContain("/_next/image");
  });
});
