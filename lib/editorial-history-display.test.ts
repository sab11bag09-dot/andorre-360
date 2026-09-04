import { describe, expect, it } from "vitest";

import {
  EDITORIAL_EVENT_ACTIONS,
  getEditorialEventActionLabel,
} from "./editorial-history-display";

describe("affichage de l’historique éditorial", () => {
  it("propose les actions de composition dans les filtres", () => {
    expect(EDITORIAL_EVENT_ACTIONS).toEqual(
      expect.arrayContaining([
        "HOME_COMPOSITION_APPLIED",
        "HOME_COMPOSITION_ROLLED_BACK",
      ]),
    );
  });

  it("affiche le libellé d’une composition appliquée", () => {
    expect(getEditorialEventActionLabel("HOME_COMPOSITION_APPLIED")).toBe(
      "Composition de l’accueil appliquée",
    );
  });

  it("affiche le libellé d’un retour arrière", () => {
    expect(getEditorialEventActionLabel("HOME_COMPOSITION_ROLLED_BACK")).toBe(
      "Composition de l’accueil annulée",
    );
  });

  it("conserve le libellé des placements existants", () => {
    expect(getEditorialEventActionLabel("PUBLICATION_PLACED")).toBe(
      "Placement éditorial modifié",
    );
  });
});
