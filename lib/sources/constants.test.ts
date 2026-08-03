import { describe, expect, it } from "vitest";

import {
  SourceOrganizationType,
  SourceTrustLevel,
} from "@/lib/generated/prisma/client";

import {
  ORGANIZATION_TYPES,
  TRUST_LEVELS,
} from "./constants";

describe("constantes des sources", () => {
  it("propose exactement les types d’organisation Prisma", () => {
    expect(
      ORGANIZATION_TYPES.map((option) => option.value).sort(),
    ).toEqual(Object.values(SourceOrganizationType).sort());
  });

  it("propose exactement les niveaux de confiance Prisma", () => {
    expect(
      TRUST_LEVELS.map((option) => option.value).sort(),
    ).toEqual(Object.values(SourceTrustLevel).sort());
  });
});
