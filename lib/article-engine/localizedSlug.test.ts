import { describe, expect, it } from "vitest";

import { createLocalizedSlug } from "./localizedSlug";

describe("createLocalizedSlug", () => {
  it.each([
    ["Nova política d’habitatge", "nova-politica-d-habitatge"],
    ["L’accés a l’habitatge", "l-acces-a-l-habitatge"],
    ["Información sobre la niñez", "informacion-sobre-la-ninez"],
    ["¿Qué está pasando?", "que-esta-pasando"],
    ["  Espacios   múltiples  ", "espacios-multiples"],
    ["---Título---", "titulo"],
  ])("normalise %s", (title, expected) => {
    expect(createLocalizedSlug(title)).toBe(expected);
  });

  it("garantit une valeur non vide", () => {
    expect(createLocalizedSlug("¿¡…!?"))
      .toBe("traduction");
  });
});
