import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import MediaMetadataForm from "./MediaMetadataForm";

const PROPS = {
  mediaId: 3,
  initialTitle: null,
  initialAlt: null,
  initialCaption: null,
  initialCredit: "ANDORRE 360",
  initialCopyright: null,
};

describe("MediaMetadataForm — banque d’images", () => {
  it("propose de ranger une image de la rédaction dans la banque d’une rubrique", () => {
    const html = renderToStaticMarkup(
      <MediaMetadataForm {...PROPS} bankAvailable initialBankCategory="SPORTS" />,
    );

    expect(html).toContain("Banque d’images");
    expect(html).toContain('<option value="SPORTS" selected="">Sports</option>');
    expect(html).toContain("Toutes les rubriques");
  });

  it("ne propose pas la banque pour une photo de source ou une vidéo", () => {
    expect(renderToStaticMarkup(<MediaMetadataForm {...PROPS} />)).not.toContain("Banque d’images");
  });
});
