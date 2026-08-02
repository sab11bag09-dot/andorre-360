import { describe, expect, it } from "vitest";

import {
  getFilInfoFormatLabel,
  normalizeFilInfoFormat,
} from "./fil-info-format";

describe("normalizeFilInfoFormat", () => {
  it.each([
    ["ALERT", "ALERT"],
    ["alerte", "ALERT"],
    ["BRIEF", "BRIEF"],
    ["brève", "BRIEF"],
    ["ARTICLE", "ARTICLE"],
    ["video", "ARTICLE"],
    [null, "ARTICLE"],
  ])("normalise %s", (value, expected) => {
    expect(normalizeFilInfoFormat(value)).toBe(expected);
  });

  it("fournit les libellés français", () => {
    expect(getFilInfoFormatLabel("ALERT")).toBe("Alerte");
    expect(getFilInfoFormatLabel("BRIEF")).toBe("Brève");
    expect(getFilInfoFormatLabel("ARTICLE")).toBe("Article");
  });
});
