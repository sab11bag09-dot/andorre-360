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

  it("prépare un article français avec la réponse structurée", async () => {
    const generator = new OpenAiEditorialGenerator({
      apiKey: "test-key",
      client: makeClient(
        JSON.stringify({
          title: "Titre français",
          description: "Description française",
          content: "Contenu français",
        }),
      ),
    });

    await expect(
      generator.prepareArticle({
        originalTitle: " Titre français ",
        originalContent: " Contenu français ",
        sourceName: "Source",
        sourceCategory: "Actualité",
      }),
    ).resolves.toMatchObject({
      title: "Titre français",
      description: "Description française",
      content: "Contenu français",
    });
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
