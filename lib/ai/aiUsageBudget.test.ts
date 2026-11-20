import { describe, expect, it, vi } from "vitest";

import {
  AI_BUDGET_WINDOW_MS,
  AiBudgetExceededError,
  DEFAULT_DAILY_TOKEN_LIMIT,
  aiBudgetStatus,
  meterAiCall,
  readDailyTokenLimit,
  type AiUsageEntry,
  type AiUsageLedger,
} from "./aiUsageBudget";

const NOW = new Date("2026-11-20T18:00:00.000Z");
// Typographie française : espace fine insécable entre les milliers.
const TEN_THOUSAND = (10_000).toLocaleString("fr-FR");

function ledger(used: number) {
  const recorded: AiUsageEntry[] = [];
  const value: AiUsageLedger & { recorded: AiUsageEntry[] } = {
    recorded,
    tokensUsedSince: vi.fn(async () => used),
    record: vi.fn(async (entry: AiUsageEntry) => {
      recorded.push(entry);
    }),
  };
  return value;
}

const META = { provider: "openai", model: "test-model", operation: "article_from_facts" };

describe("readDailyTokenLimit", () => {
  it("lit le plafond de jetons sur 24 heures", () => {
    expect(readDailyTokenLimit({ AI_DAILY_TOKEN_LIMIT: "120000" })).toBe(120_000);
  });

  it("applique un plafond par défaut quand la variable est absente ou invalide", () => {
    expect(readDailyTokenLimit({})).toBe(DEFAULT_DAILY_TOKEN_LIMIT);
    expect(readDailyTokenLimit({ AI_DAILY_TOKEN_LIMIT: "beaucoup" })).toBe(DEFAULT_DAILY_TOKEN_LIMIT);
    expect(readDailyTokenLimit({ AI_DAILY_TOKEN_LIMIT: "-5" })).toBe(DEFAULT_DAILY_TOKEN_LIMIT);
    expect(readDailyTokenLimit({ AI_DAILY_TOKEN_LIMIT: "1.5" })).toBe(DEFAULT_DAILY_TOKEN_LIMIT);
  });

  it("accepte 0 pour interdire tout appel", () => {
    expect(readDailyTokenLimit({ AI_DAILY_TOKEN_LIMIT: "0" })).toBe(0);
  });
});

describe("aiBudgetStatus", () => {
  it("compte les jetons des 24 dernières heures", async () => {
    const usage = ledger(1_000);

    await expect(
      aiBudgetStatus(usage, { env: { AI_DAILY_TOKEN_LIMIT: "5000" }, now: NOW }),
    ).resolves.toEqual({ used: 1_000, limit: 5_000, available: true });
    expect(usage.tokensUsedSince).toHaveBeenCalledWith(
      new Date(NOW.getTime() - AI_BUDGET_WINDOW_MS),
    );
  });

  it("n’est plus disponible une fois le plafond atteint", async () => {
    await expect(
      aiBudgetStatus(ledger(5_000), { env: { AI_DAILY_TOKEN_LIMIT: "5000" }, now: NOW }),
    ).resolves.toMatchObject({ available: false });
  });
});

describe("meterAiCall", () => {
  it("enregistre les jetons consommés par l’appel", async () => {
    const usage = ledger(0);

    const response = await meterAiCall(
      usage,
      META,
      async () => ({ output_text: "{}", usage: { input_tokens: 1_200, output_tokens: 300 } }),
      { env: {}, now: NOW },
    );

    expect(response.output_text).toBe("{}");
    expect(usage.recorded).toEqual([{ ...META, inputTokens: 1_200, outputTokens: 300 }]);
  });

  it("enregistre zéro jeton quand la réponse ne les indique pas", async () => {
    const usage = ledger(0);

    await meterAiCall(usage, META, async () => ({ output_text: "{}" }), { env: {}, now: NOW });

    expect(usage.recorded).toEqual([{ ...META, inputTokens: 0, outputTokens: 0 }]);
  });

  it("refuse l’appel, sans contacter OpenAI, quand le plafond est atteint", async () => {
    const usage = ledger(10_000);
    const call = vi.fn(async () => ({ output_text: "{}" }));

    await expect(
      meterAiCall(usage, META, call, { env: { AI_DAILY_TOKEN_LIMIT: "10000" }, now: NOW }),
    ).rejects.toThrow(AiBudgetExceededError);
    await expect(
      meterAiCall(usage, META, call, { env: { AI_DAILY_TOKEN_LIMIT: "10000" }, now: NOW }),
    ).rejects.toThrow(
      `Plafond de dépense OpenAI atteint : ${TEN_THOUSAND} jetons consommés sur les dernières 24 heures, pour un plafond de ${TEN_THOUSAND}. Aucun appel n’a été lancé.`,
    );
    expect(call).not.toHaveBeenCalled();
    expect(usage.recorded).toEqual([]);
  });

  it("n’enregistre rien quand l’appel échoue", async () => {
    const usage = ledger(0);

    await expect(
      meterAiCall(usage, META, async () => {
        throw new Error("délai dépassé");
      }, { env: {}, now: NOW }),
    ).rejects.toThrow("délai dépassé");
    expect(usage.recorded).toEqual([]);
  });
});
