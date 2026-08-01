import {
  describe,
  expect,
  it,
} from "vitest";

import { DeterministicEditorialGenerator } from "./DeterministicEditorialGenerator";

describe(
  "DeterministicEditorialGenerator.translateArticle",
  () => {
    it.each([
      {
        locale: "CA" as const,
        prefix: "[CA]",
      },
      {
        locale: "ES" as const,
        prefix: "[ES]",
      },
    ])(
      "prépare une traduction simulée en $locale",
      async ({ locale, prefix }) => {
        const generator =
          new DeterministicEditorialGenerator();

        const result =
          await generator.translateArticle({
            locale,
            title:
              "  Titre français  ",
            description:
              "  Chapô français  ",
            content:
              "  Contenu français  ",
          });

        expect(result).toEqual({
          locale,
          title:
            `${prefix} Titre français`,
          description:
            `${prefix} Chapô français`,
          content:
            `${prefix} Contenu français`,
        });
      },
    );
  },
);
