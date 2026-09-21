import { describe, expect, it, vi } from "vitest";

import type { StructuredResponseClient } from "./OpenAiEditorialGenerator";
import { OpenAiEditorialGenerator } from "./OpenAiEditorialGenerator";

function makeClient(output: string): StructuredResponseClient {
  return {
    create: vi.fn().mockResolvedValue(output),
  };
}

describe("OpenAiEditorialGenerator", () => {
  it("traduit en catalan avec une sortie structurée", async () => {
    const client = makeClient(
      JSON.stringify({
        title: "Títol català",
        description: "Descripció catalana",
        content: "Contingut català",
      }),
    );

    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      model: "test-model",
      client,
    });

    await expect(
      generator.translateArticle({
        locale: "CA",
        title: "Titre français",
        description: "Description française",
        content: "Contenu français",
      }),
    ).resolves.toEqual({
      locale: "CA",
      title: "Títol català",
      description: "Descripció catalana",
      content: "Contingut català",
    });

    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "test-model",
        instructions: expect.stringContaining("catalan"),
        schema: expect.objectContaining({
          additionalProperties: false,
        }),
      }),
    );
  });

  it("demande explicitement une traduction espagnole", async () => {
    const client = makeClient(
      JSON.stringify({
        title: "Título",
        description: "Descripción",
        content: "Contenido",
      }),
    );

    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client,
    });

    await generator.translateArticle({
      locale: "ES",
      title: "Titre",
      description: "Description",
      content: "Contenu",
    });

    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.stringContaining("espagnol"),
      }),
    );
  });

  it("rejette une réponse JSON invalide", async () => {
    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client: makeClient("pas du JSON"),
    });

    await expect(
      generator.translateArticle({
        locale: "CA",
        title: "Titre",
        description: "Description",
        content: "Contenu",
      }),
    ).rejects.toThrow("réponse JSON invalide");
  });

  it("rejette une réponse dont un champ est vide", async () => {
    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client: makeClient(
        JSON.stringify({
          title: "Titre",
          description: " ",
          content: "Contenu",
        }),
      ),
    });

    await expect(
      generator.translateArticle({
        locale: "ES",
        title: "Titre",
        description: "Description",
        content: "Contenu",
      }),
    ).rejects.toThrow("champs incomplets");
  });

  it("transforme une erreur fournisseur en erreur métier lisible", async () => {
    const client: StructuredResponseClient = {
      create: vi.fn().mockRejectedValue(new Error("délai dépassé")),
    };

    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client,
    });

    await expect(
      generator.translateArticle({
        locale: "CA",
        title: "Titre",
        description: "Description",
        content: "Contenu",
      }),
    ).rejects.toThrow("La traduction OpenAI a échoué : délai dépassé");
  });

  it("prépare un article français avec son contexte temporel et sa traçabilité", async () => {
    const client = makeClient(
      JSON.stringify({
        title: "Titre français",
        description: "Description française",
        content: "Contenu français",
      }),
    );
    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      model: "test-model",
      client,
    });
    const sourcePublishedAt = new Date(
      "2026-09-02T00:00:00.000Z",
    );
    const generatedAt = new Date(
      "2026-09-20T12:00:00.000Z",
    );

    await expect(
      generator.prepareArticle({
        originalTitle: " Titre français ",
        originalContent: " Contenu français ",
        sourcePublishedAt,
        generatedAt,
        sourceName: "Source",
        sourceCategory: "Actualité",
      }),
    ).resolves.toMatchObject({
      title: "Titre français",
      description: "Description française",
      content: "Contenu français",
    });

    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "test-model",
        instructions: expect.stringContaining(
          "date absolue",
        ),
        input: JSON.stringify({
          title: "Titre français",
          content: "Contenu français",
          sourceName: "Source",
          sourceCategory: "Actualité",
          sourcePublishedAt:
            "2026-09-02T00:00:00.000Z",
          generatedAt:
            "2026-09-20T12:00:00.000Z",
        }),
      }),
    );

    expect(generator.auditMetadata).toEqual({
      provider: "openai",
      model: "test-model",
      promptVersion: "editorial-rewrite-v3",
    });
  });

  it("nettoie les collisions de mots avant et après la génération", async () => {
    const client = makeClient(
      JSON.stringify({
        title: "Titre propre",
        description:
          "Le Comú d’Encampreversera 2 euros par inscription.",
        content:
          "Le parcoursdans la montagne protège lesanimaux avec lemême guide.",
      }),
    );
    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client,
    });

    await expect(
      generator.prepareArticle({
        originalTitle: "Titre source",
        originalContent:
          "Le parcoursdans la montagne protège lesanimaux avec lemême guide.",
        sourcePublishedAt: new Date(
          "2026-09-04T00:00:00.000Z",
        ),
        generatedAt: new Date(
          "2026-09-20T12:00:00.000Z",
        ),
        sourceName: "Encamp",
        sourceCategory: "Actualité",
      }),
    ).resolves.toMatchObject({
      description:
        "Le Comú d’Encamp reversera 2 euros par inscription.",
      content:
        "Le parcours dans la montagne protège les animaux avec le même guide.",
    });

    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.stringContaining(
          "Le parcours dans la montagne protège les animaux avec le même guide.",
        ),
      }),
    );
  });

  it("interdit le Markdown dans un article préparé", async () => {
    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client: makeClient(
        JSON.stringify({
          title: "Titre",
          description: "Description",
          content:
            "Consultez [le site](https://example.com).",
        }),
      ),
    });

    await expect(
      generator.prepareArticle({
        originalTitle: "Titre",
        originalContent: "Contenu source.",
        sourcePublishedAt: new Date(
          "2026-09-04T00:00:00.000Z",
        ),
        generatedAt: new Date(
          "2026-09-20T12:00:00.000Z",
        ),
        sourceName: "Source",
        sourceCategory: "Actualité",
      }),
    ).rejects.toThrow("Markdown interdit");
  });

  it("exige les années, le texte brut et les quantités exactes", async () => {
    const client = makeClient(
      JSON.stringify({
        title: "Titre",
        description: "Description",
        content: "Contenu",
      }),
    );
    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client,
    });

    await generator.prepareArticle({
      originalTitle: "Titre",
      originalContent: "Contenu source.",
      sourcePublishedAt: new Date(
        "2026-09-04T00:00:00.000Z",
      ),
      generatedAt: new Date(
        "2026-09-20T12:00:00.000Z",
      ),
      sourceName: "Source",
      sourceCategory: "Actualité",
    });

    const request = vi.mocked(client.create).mock.calls[0]?.[0];

    expect(request?.instructions).toContain(
      "jour, le mois et l’année",
    );
    expect(request?.instructions).toContain(
      "aucun balisage Markdown ou HTML",
    );
    expect(request?.instructions).toContain(
      "quantités exactes",
    );
  });

  it("refuse une clé vide", () => {
    expect(
      () =>
        new OpenAiEditorialGenerator({
          apiKey: " ",
          client: makeClient("{}"),
        }),
    ).toThrow("OPENAI_API_KEY");
  });
});
