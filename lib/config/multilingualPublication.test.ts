import { describe, expect, it } from "vitest";

import {
  assertMultilingualPublicationEnabled,
  isMultilingualPublicationEnabled,
} from "./multilingualPublication";

describe("isMultilingualPublicationEnabled", () => {
  it.each(["true", "TRUE", " true "])(
    "active la publication pour %s",
    (value) => {
      expect(isMultilingualPublicationEnabled(value)).toBe(true);
    },
  );

  it.each([undefined, "", "false", "1", "yes"])(
    "désactive la publication pour %s",
    (value) => {
      expect(isMultilingualPublicationEnabled(value)).toBe(false);
    },
  );

  it("bloque une publication quand le coupe-circuit est fermé", () => {
    expect(() =>
      assertMultilingualPublicationEnabled("false"),
    ).toThrow("temporairement désactivée");
  });
});
