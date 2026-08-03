import { beforeEach, describe, expect, it, vi } from "vitest";

import { Prisma } from "@/lib/generated/prisma/client";

const { create, update } = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    observation: {
      create,
      update,
    },
  },
}));

import { PrismaObservationRepository } from "./PrismaObservationRepository";

describe("PrismaObservationRepository", () => {
  beforeEach(() => {
    create.mockReset();
    update.mockReset();
  });

  it("actualise une observation existante sans la remettre à traiter", async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        "Observation déjà présente",
        {
          code: "P2002",
          clientVersion: "test",
        },
      ),
    );
    update.mockResolvedValue({
      id: 12,
      url: "https://example.com/article",
      content: "Contenu actualisé",
    });

    const repository = new PrismaObservationRepository();

    await expect(
      repository.saveMany(3, [
        {
          title: "Titre actualisé",
          url: "https://example.com/article",
          publishedAt: new Date("2026-08-03T12:00:00.000Z"),
          content: "Contenu actualisé",
        },
      ]),
    ).resolves.toBe(0);

    expect(update).toHaveBeenCalledWith({
      where: {
        sourceId_url: {
          sourceId: 3,
          url: "https://example.com/article",
        },
      },
      data: {
        title: "Titre actualisé",
        publishedAt: new Date("2026-08-03T12:00:00.000Z"),
        content: "Contenu actualisé",
      },
    });
  });
});
