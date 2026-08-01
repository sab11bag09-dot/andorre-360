import { afterEach, describe, expect, it } from "vitest";

import { OpenAiEditorialGenerator } from "./OpenAiEditorialGenerator";
import { createEditorialGenerator } from "./createEditorialGenerator";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_TRANSLATION_MODEL;

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }

  if (originalModel === undefined) {
    delete process.env.OPENAI_TRANSLATION_MODEL;
  } else {
    process.env.OPENAI_TRANSLATION_MODEL = originalModel;
  }
});

describe("createEditorialGenerator", () => {
  it("crée l’adaptateur OpenAI quand la clé est configurée", () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_TRANSLATION_MODEL = "test-model";

    expect(createEditorialGenerator()).toBeInstanceOf(OpenAiEditorialGenerator);
  });

  it("échoue clairement quand la clé est absente", () => {
    delete process.env.OPENAI_API_KEY;

    expect(() => createEditorialGenerator()).toThrow("OPENAI_API_KEY");
  });
});
