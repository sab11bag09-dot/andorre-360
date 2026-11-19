import { describe, expect, it, vi } from "vitest";

import type { StructuredResponseClient } from "./OpenAiEditorialGenerator";
import {
  MAX_TITLE_LENGTH,
  OpenAiEditorialGenerator,
} from "./OpenAiEditorialGenerator";

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

  describe("rédaction en deux temps à partir des faits", () => {
    const SOURCE_TITLE = "El Govern aprova el pla d’habitatge";
    const SOURCE_SENTENCE =
      "Segons el ministre, «aquest pla canviarà la vida de moltes famílies andorranes», va dir ahir.";
    const sourcePublishedAt = new Date("2026-09-02T00:00:00.000Z");
    const generatedAt = new Date("2026-09-20T12:00:00.000Z");

    const FACTS = [
      "Le gouvernement d’Andorre a approuvé un plan logement le 1er septembre 2026.",
      "Le plan prévoit 120 logements à loyer abordable.",
    ];

    const ARTICLE = {
      title: "Le gouvernement approuve un plan de 120 logements abordables",
      description:
        "Le plan, approuvé le 1er septembre 2026, prévoit 120 logements à loyer abordable.",
      content:
        "Le gouvernement d’Andorre a approuvé le 1er septembre 2026 un plan logement qui prévoit 120 logements à loyer abordable.",
    };

    function makeTwoStepClient(
      facts: unknown = { facts: FACTS },
      article: unknown = ARTICLE,
    ): StructuredResponseClient {
      return {
        create: vi
          .fn()
          .mockResolvedValueOnce(
            typeof facts === "string" ? facts : JSON.stringify(facts),
          )
          .mockResolvedValueOnce(
            typeof article === "string" ? article : JSON.stringify(article),
          ),
      };
    }

    function prepare(
      generator: OpenAiEditorialGenerator,
      overrides: Partial<{
        originalTitle: string;
        originalContent: string;
      }> = {},
    ) {
      return generator.prepareArticle({
        originalTitle: ` ${SOURCE_TITLE} `,
        originalContent: ` ${SOURCE_SENTENCE} `,
        sourcePublishedAt,
        generatedAt,
        sourceName: "Govern d’Andorra",
        sourceCategory: "Actualité",
        ...overrides,
      });
    }

    function requests(client: StructuredResponseClient) {
      return vi.mocked(client.create).mock.calls.map(([request]) => request);
    }

    it("extrait d’abord les faits de la source, puis rédige à partir des faits seulement", async () => {
      const client = makeTwoStepClient();
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        model: "test-model",
        client,
      });

      await expect(prepare(generator)).resolves.toEqual({
        ...ARTICLE,
        category: "Actualité",
        author: "Rédaction ANDORRE 360",
        factSheet: FACTS,
      });

      const [extraction, drafting] = requests(client);

      expect(client.create).toHaveBeenCalledTimes(2);
      expect(extraction?.model).toBe("test-model");
      expect(extraction?.schemaName).toBe("article_fact_sheet");
      expect(JSON.parse(extraction?.input ?? "{}")).toEqual({
        title: SOURCE_TITLE,
        content: SOURCE_SENTENCE,
        sourceName: "Govern d’Andorra",
        sourcePublishedAt: "2026-09-02T00:00:00.000Z",
        generatedAt: "2026-09-20T12:00:00.000Z",
      });
      expect(extraction?.instructions).toContain("aucune citation");
      expect(extraction?.instructions).toContain("aucun témoignage");

      expect(drafting?.model).toBe("test-model");
      expect(drafting?.schemaName).toBe("article_from_facts");
      expect(JSON.parse(drafting?.input ?? "{}")).toEqual({
        facts: FACTS,
        sourceName: "Govern d’Andorra",
        sourceCategory: "Actualité",
        sourcePublishedAt: "2026-09-02T00:00:00.000Z",
        generatedAt: "2026-09-20T12:00:00.000Z",
      });
    });

    it("ne transmet jamais le texte source à l’étape de rédaction", async () => {
      const client = makeTwoStepClient();
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await prepare(generator);

      const drafting = requests(client)[1];

      expect(drafting?.input).not.toContain("Govern aprova");
      expect(drafting?.input).not.toContain("canviarà la vida");
      expect(drafting?.instructions).not.toContain("citations");
      expect(drafting?.instructions).toContain("uniquement à partir de la liste de faits");
    });

    it("trace la nouvelle méthode de rédaction dans l’audit", () => {
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        model: "test-model",
        client: makeTwoStepClient(),
      });

      expect(generator.auditMetadata).toEqual({
        provider: "openai",
        model: "test-model",
        promptVersion: "editorial-facts-v2",
      });
    });

    it("conserve les contraintes de dates, de texte brut et de quantités à la rédaction", async () => {
      const client = makeTwoStepClient();
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await prepare(generator);

      const drafting = requests(client)[1];

      expect(drafting?.instructions).toContain("date absolue");
      expect(drafting?.instructions).toContain("jour, le mois et l’année");
      expect(drafting?.instructions).toContain("aucun balisage Markdown ou HTML");
      expect(drafting?.instructions).toContain("quantités exactes");
    });

    it("nettoie les collisions de mots avant l’extraction et dans l’article rédigé", async () => {
      const client = makeTwoStepClient(
        { facts: FACTS },
        {
          title: "Titre propre",
          description: "Le Comú d’Encampreversera 2 euros par inscription.",
          content:
            "Le parcoursdans la montagne protège lesanimaux avec lemême guide.",
        },
      );
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await expect(
        prepare(generator, {
          originalContent:
            "Le parcoursdans la montagne protège lesanimaux avec lemême guide.",
        }),
      ).resolves.toMatchObject({
        description: "Le Comú d’Encamp reversera 2 euros par inscription.",
        content:
          "Le parcours dans la montagne protège les animaux avec le même guide.",
      });

      expect(requests(client)[0]?.input).toContain(
        "Le parcours dans la montagne protège les animaux avec le même guide.",
      );
    });

    it("refuse une liste de faits vide sans lancer la rédaction", async () => {
      const client = makeTwoStepClient({ facts: [" ", ""] });
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await expect(prepare(generator)).rejects.toThrow(
        "aucun fait exploitable",
      );
      expect(client.create).toHaveBeenCalledTimes(1);
    });

    it("refuse une liste de faits qui reprend une citation longue de la source", async () => {
      const client = makeTwoStepClient({
        facts: [
          "Le ministre a déclaré : « ce plan changera la vie de nombreuses familles andorranes ».",
        ],
      });
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await expect(prepare(generator)).rejects.toThrow("citation");
      expect(client.create).toHaveBeenCalledTimes(1);
    });

    it("accepte un nom court entre guillemets dans un fait", async () => {
      const facts = [
        "Le festival « Andorra Ski Fest » aura lieu le 4 décembre 2026.",
      ];
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client: makeTwoStepClient({ facts }),
      });

      await expect(prepare(generator)).resolves.toMatchObject({
        factSheet: facts,
      });
    });

    it("refuse un article rédigé qui contient une citation longue", async () => {
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client: makeTwoStepClient(
          { facts: FACTS },
          {
            ...ARTICLE,
            content:
              "Le ministre a assuré que “ce plan changera la vie de nombreuses familles”.",
          },
        ),
      });

      await expect(prepare(generator)).rejects.toThrow("citation");
    });

    it("interdit le Markdown dans l’article rédigé", async () => {
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client: makeTwoStepClient(
          { facts: FACTS },
          {
            ...ARTICLE,
            content: "Consultez [le site](https://example.com).",
          },
        ),
      });

      await expect(prepare(generator)).rejects.toThrow("Markdown interdit");
    });

    it("signale lisiblement une erreur pendant l’extraction des faits", async () => {
      const client: StructuredResponseClient = {
        create: vi.fn().mockRejectedValue(new Error("délai dépassé")),
      };
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await expect(prepare(generator)).rejects.toThrow(
        "L’extraction des faits OpenAI a échoué : délai dépassé",
      );
    });

    it("signale lisiblement une erreur pendant la rédaction", async () => {
      const client: StructuredResponseClient = {
        create: vi
          .fn()
          .mockResolvedValueOnce(JSON.stringify({ facts: FACTS }))
          .mockRejectedValueOnce(new Error("quota atteint")),
      };
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await expect(prepare(generator)).rejects.toThrow(
        "La rédaction OpenAI a échoué : quota atteint",
      );
    });

    it("refuse un fait trop long, signe d’un paragraphe repris tel quel", async () => {
      const client = makeTwoStepClient({ facts: ["mot ".repeat(120)] });
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client,
      });

      await expect(prepare(generator)).rejects.toThrow("dépasse 400 caractères");
      expect(client.create).toHaveBeenCalledTimes(1);
    });

    it("rejette une liste de faits mal formée", async () => {
      const generator = new OpenAiEditorialGenerator({
        apiKey: "test-key",
        client: makeTwoStepClient("pas du JSON"),
      });

      await expect(prepare(generator)).rejects.toThrow(
        "liste de faits invalide",
      );
    });

    describe("longueur du titre", () => {
      const LONG_TITLE =
        "Le 1er septembre 2026, le gouvernement d’Andorre approuve un plan qui prévoit 120 logements à loyer abordable";
      const SHORT_TITLE = "Andorre : un plan pour 120 logements à loyer abordable";

      function makeClientWithTitles(...titles: string[]): StructuredResponseClient {
        const create = vi
          .fn()
          .mockResolvedValueOnce(JSON.stringify({ facts: FACTS }))
          .mockResolvedValueOnce(
            JSON.stringify({ ...ARTICLE, title: titles[0] }),
          );
        for (const title of titles.slice(1)) {
          create.mockResolvedValueOnce(JSON.stringify({ title }));
        }
        return { create };
      }

      it("fixe une limite de 70 caractères", () => {
        expect(MAX_TITLE_LENGTH).toBe(70);
      });

      it("demande un titre court, sans date sauf si elle est l’information principale", async () => {
        const client = makeTwoStepClient();
        const generator = new OpenAiEditorialGenerator({ apiKey: "test-key", client });

        await prepare(generator);

        const [, drafting] = requests(client);
        expect(drafting?.instructions).toContain("70 caractères");
        expect(drafting?.instructions).toContain(
          "pas de date dans le titre, sauf si elle est l’information principale",
        );
        expect(drafting?.instructions).not.toContain("y compris dans le titre");
      });

      it("garde un titre de longueur correcte sans appel supplémentaire", async () => {
        const client = makeTwoStepClient();
        const generator = new OpenAiEditorialGenerator({ apiKey: "test-key", client });

        await expect(prepare(generator)).resolves.toMatchObject({
          title: ARTICLE.title,
        });
        expect(client.create).toHaveBeenCalledTimes(2);
      });

      it("fait raccourcir une fois un titre trop long, à partir des faits seulement", async () => {
        const client = makeClientWithTitles(LONG_TITLE, SHORT_TITLE);
        const generator = new OpenAiEditorialGenerator({
          apiKey: "test-key",
          model: "test-model",
          client,
        });

        await expect(prepare(generator)).resolves.toMatchObject({
          title: SHORT_TITLE,
          description: ARTICLE.description,
          content: ARTICLE.content,
        });

        expect(client.create).toHaveBeenCalledTimes(3);
        const [, , shortening] = requests(client);
        expect(shortening?.model).toBe("test-model");
        expect(shortening?.schemaName).toBe("article_title");
        expect(shortening?.instructions).toContain("70 caractères");
        expect(JSON.parse(shortening?.input ?? "{}")).toEqual({
          title: LONG_TITLE,
          facts: FACTS,
          maxLength: 70,
        });
        expect(shortening?.input).not.toContain(SOURCE_SENTENCE);
      });

      it("bloque l’article si le titre raccourci reste trop long", async () => {
        const client = makeClientWithTitles(LONG_TITLE, LONG_TITLE);
        const generator = new OpenAiEditorialGenerator({ apiKey: "test-key", client });

        await expect(prepare(generator)).rejects.toThrow(
          `Le titre dépasse 70 caractères (${LONG_TITLE.length})`,
        );
        expect(client.create).toHaveBeenCalledTimes(3);
      });

      it("applique au titre raccourci les contrôles de texte brut et de citation", async () => {
        const client = makeClientWithTitles(
          LONG_TITLE,
          "Le Govern : « un plan qui changera la vie des familles »",
        );
        const generator = new OpenAiEditorialGenerator({ apiKey: "test-key", client });

        await expect(prepare(generator)).rejects.toThrow("citation");
      });
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
