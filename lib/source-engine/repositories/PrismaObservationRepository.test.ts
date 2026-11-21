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

  it("neutralise une date manifestement future avant l’écriture", async () => {
    create.mockResolvedValue({
      id: 13,
      url: "https://example.com/article-futur",
    });

    const repository = new PrismaObservationRepository();

    await expect(
      repository.saveMany(3, [
        {
          title: "Titre avec une date future",
          url: "https://example.com/article-futur",
          publishedAt: new Date(
            "2999-01-01T00:00:00.000Z",
          ),
          content: "Contenu de l’observation.",
        },
      ]),
    ).resolves.toBe(1);

    expect(create).toHaveBeenCalledWith({
      data: {
        sourceId: 3,
        title: "Titre avec une date future",
        url: "https://example.com/article-futur",
        publishedAt: null,
        content: "Contenu de l’observation.",
        imageUrl: null,
        imageRights: null,
      },
    });
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

  it("enregistre l’image et la mention de droits de l’article", async () => {
    create.mockResolvedValue({ id: 14, url: "https://example.com/photo" });

    await new PrismaObservationRepository().saveMany(3, [
      {
        title: "Article illustré",
        url: "https://example.com/photo",
        publishedAt: null,
        content: null,
        imageUrl: "https://example.com/photo.jpg",
        imageRights: "© Source",
      },
    ]);

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        imageUrl: "https://example.com/photo.jpg",
        imageRights: "© Source",
      }),
    });
  });

  it("n’efface pas une image connue quand une nouvelle collecte n’en trouve pas", async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Observation déjà présente", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    update.mockResolvedValue({ id: 12, url: "https://example.com/article", content: null });

    await new PrismaObservationRepository().saveMany(3, [
      { title: "Titre", url: "https://example.com/article", publishedAt: null, content: null, imageUrl: null },
    ]);

    expect(update.mock.calls[0][0].data).not.toHaveProperty("imageUrl");
    expect(update.mock.calls[0][0].data).not.toHaveProperty("imageRights");
  });

  it("n’efface pas une date connue quand une nouvelle collecte n’en trouve pas", async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Observation déjà présente", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    update.mockResolvedValue({ id: 12, url: "https://example.com/article", content: null });

    await new PrismaObservationRepository().saveMany(3, [
      { title: "Titre", url: "https://example.com/article", publishedAt: null, content: null },
      {
        title: "Titre",
        url: "https://example.com/article",
        publishedAt: new Date("2999-01-01T00:00:00.000Z"),
        content: null,
      },
    ]);

    expect(update.mock.calls[0][0].data).not.toHaveProperty("publishedAt");
    expect(update.mock.calls[1][0].data).not.toHaveProperty("publishedAt");
  });
});
