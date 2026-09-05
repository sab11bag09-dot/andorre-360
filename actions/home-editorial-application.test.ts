import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  randomUUID,
  requireAdmin,
  simulateAutomatedHome,
  applyPreparedHomeComposition,
  rollbackAutomatedHomeComposition,
  revalidatePath,
  revalidateEditorialPublicPage,
} = vi.hoisted(() => ({
  randomUUID: vi.fn(),
  requireAdmin: vi.fn(),
  simulateAutomatedHome: vi.fn(),
  applyPreparedHomeComposition: vi.fn(),
  rollbackAutomatedHomeComposition: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateEditorialPublicPage: vi.fn(),
}));

vi.mock("node:crypto", () => ({
  randomUUID,
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdmin,
}));

vi.mock("@/lib/editorial/simulateAutomatedHome", () => ({
  simulateAutomatedHome,
}));

vi.mock("@/lib/editorial/applyPreparedHomeComposition", () => ({
  applyPreparedHomeComposition,
}));

vi.mock("@/lib/editorial/rollbackAutomatedHomeComposition", () => ({
  rollbackAutomatedHomeComposition,
}));

vi.mock("@/lib/public-revalidation", () => ({
  revalidateEditorialPublicPage,
}));

import type { LockedHomePublication } from "@/lib/editorial/loadLockedHomePlacements";

import {
  applyCurrentHomeEditorialProposal,
  rollbackHomeEditorialRun,
} from "./home-editorial-application";

const admin = {
  id: "admin-1",
  email: "admin@example.com",
};

const generatedAt = new Date("2026-09-05T09:00:00.000Z");

const composition = {
  placements: [],
  evaluations: [],
  unfilledSlots: {
    hero: 1,
    feature: 1,
    "grand-format": 1,
    card: 4,
    brief: 4,
  },
};

const lockedPlacements: LockedHomePublication[] = [];

describe("actions d’application éditoriale de l’accueil", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireAdmin.mockResolvedValue(admin);
    randomUUID.mockReturnValue("run-server-123");

    simulateAutomatedHome.mockResolvedValue({
      mode: "PROPOSAL_ONLY",
      generatedAt,
      candidateCount: 0,
      candidateFacts: [],
      lockedPlacements,
      assessments: [],
      composition,
    });

    applyPreparedHomeComposition.mockResolvedValue({
      createdPublicationIds: [100, 101],
      disabledPublicationIds: [50],
      preservedLockedPublicationIds: [10],
      placements: [],
    });

    rollbackAutomatedHomeComposition.mockResolvedValue({
      runId: "run-server-123",
      disabledPublicationIds: [100, 101],
      restoredPublicationIds: [50],
      preservedLockedPublicationIds: [10],
      rolledBackAt: "2026-09-05T10:00:00.000Z",
    });
  });

  it("exige un administrateur avant de simuler une application", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(applyCurrentHomeEditorialProposal()).rejects.toThrow(
      "Accès refusé",
    );

    expect(simulateAutomatedHome).not.toHaveBeenCalled();
    expect(applyPreparedHomeComposition).not.toHaveBeenCalled();
  });

  it("recalcule puis applique la composition uniquement côté serveur", async () => {
    await expect(applyCurrentHomeEditorialProposal()).resolves.toEqual({
      success: true,
      runId: "run-server-123",
      generatedAt: "2026-09-05T09:00:00.000Z",
      createdPublicationIds: [100, 101],
      disabledPublicationIds: [50],
      preservedLockedPublicationIds: [10],
    });

    expect(simulateAutomatedHome).toHaveBeenCalledWith({
      candidateLimit: 30,
    });

    expect(applyPreparedHomeComposition).toHaveBeenCalledWith({
      runId: "run-server-123",
      policyVersion: "1.1",
      actor: admin,
      composition,
      lockedPlacements,
    });
  });

  it("revalide les pages uniquement après une application réussie", async () => {
    await applyCurrentHomeEditorialProposal();

    expect(revalidatePath.mock.calls).toEqual([
      ["/admin"],
      ["/admin/editorial"],
      ["/admin/diffusion"],
      ["/admin/diffusion/simulation"],
      ["/admin/history"],
    ]);

    expect(revalidateEditorialPublicPage).toHaveBeenCalledWith("home");
  });

  it("retourne une erreur sûre si l’application échoue", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    applyPreparedHomeComposition.mockRejectedValue(
      new Error("Erreur interne secrète"),
    );

    await expect(applyCurrentHomeEditorialProposal()).resolves.toEqual({
      success: false,
      code: "APPLICATION_FAILED",
      message:
        "La composition n’a pas pu être appliquée. Aucun placement n’a été modifié.",
    });

    expect(consoleError).toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(revalidateEditorialPublicPage).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("exige un administrateur avant le retour arrière", async () => {
    requireAdmin.mockRejectedValue(new Error("Accès refusé"));

    await expect(rollbackHomeEditorialRun("run-server-123")).rejects.toThrow(
      "Accès refusé",
    );

    expect(rollbackAutomatedHomeComposition).not.toHaveBeenCalled();
  });

  it("effectue puis revalide un retour arrière réussi", async () => {
    await expect(rollbackHomeEditorialRun("run-server-123")).resolves.toEqual({
      success: true,
      runId: "run-server-123",
      rolledBackAt: "2026-09-05T10:00:00.000Z",
      disabledPublicationIds: [100, 101],
      restoredPublicationIds: [50],
      preservedLockedPublicationIds: [10],
    });

    expect(rollbackAutomatedHomeComposition).toHaveBeenCalledWith({
      runId: "run-server-123",
      actor: admin,
    });

    expect(revalidateEditorialPublicPage).toHaveBeenCalledWith("home");
  });

  it("retourne une erreur sûre si le retour arrière échoue", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    rollbackAutomatedHomeComposition.mockRejectedValue(
      new Error("Détail interne secret"),
    );

    await expect(rollbackHomeEditorialRun("run-server-123")).resolves.toEqual({
      success: false,
      code: "ROLLBACK_FAILED",
      message: "Le retour arrière a échoué. Aucun placement n’a été modifié.",
    });

    expect(consoleError).toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(revalidateEditorialPublicPage).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
