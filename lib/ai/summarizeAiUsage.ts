import type { PrismaClient } from "@/lib/generated/prisma/client";

import { AI_BUDGET_WINDOW_MS, readDailyTokenLimit } from "./aiUsageBudget";

/**
 * Résumé de la consommation OpenAI pour l’administration : les 24 dernières
 * heures face au plafond (même fenêtre que le plafond lui-même), le détail
 * par type d’appel, et les 7 derniers jours, découpés à l’heure d’Andorre.
 */

export const USAGE_DAYS = 7;
const TIME_ZONE = "Europe/Andorra";
const DAY_MS = 24 * 60 * 60 * 1_000;

export const AI_OPERATION_LABELS: Record<string, string> = {
  article_fact_sheet: "Extraction des faits",
  article_from_facts: "Rédaction",
  article_title: "Raccourcissement du titre",
  article_translation: "Traduction",
  home_candidate_assessment: "Évaluation de la page d’accueil",
};

export type AiUsageRow = { createdAt: Date; operation: string; totalTokens: number };

export type AiUsageSummary = {
  window: { used: number; limit: number; remaining: number; percent: number; reached: boolean };
  byOperation: Array<{ operation: string; label: string; calls: number; tokens: number }>;
  byDay: Array<{ day: string; label: string; calls: number; tokens: number }>;
};

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayLabelFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function summarizeAiUsage(
  rows: readonly AiUsageRow[],
  options: { now: Date; limit: number },
): AiUsageSummary {
  const { now, limit } = options;
  const windowStart = now.getTime() - AI_BUDGET_WINDOW_MS;
  const inWindow = rows.filter((row) => row.createdAt.getTime() >= windowStart);

  const used = inWindow.reduce((sum, row) => sum + row.totalTokens, 0);
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100;

  const operations = new Map<string, { calls: number; tokens: number }>();
  for (const row of inWindow) {
    const entry = operations.get(row.operation) ?? { calls: 0, tokens: 0 };
    entry.calls += 1;
    entry.tokens += row.totalTokens;
    operations.set(row.operation, entry);
  }

  // On part du jour d’aujourd’hui à Andorre et on recule d’un jour civil, à
  // midi UTC : la date reste juste quel que soit le changement d’heure.
  const [year, month, day] = dayKeyFormat.format(now).split("-").map(Number);
  const byDay = Array.from({ length: USAGE_DAYS }, (_, index) => {
    const reference = new Date(Date.UTC(year, month - 1, day - index, 12));
    return {
      day: dayKeyFormat.format(reference),
      label: dayLabelFormat.format(reference),
      calls: 0,
      tokens: 0,
    };
  });
  const days = new Map(byDay.map((entry) => [entry.day, entry]));
  for (const row of rows) {
    const entry = days.get(dayKeyFormat.format(row.createdAt));
    if (!entry) continue;
    entry.calls += 1;
    entry.tokens += row.totalTokens;
  }

  return {
    window: {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      percent,
      reached: used >= limit,
    },
    byOperation: [...operations]
      .map(([operation, { calls, tokens }]) => ({
        operation,
        label: AI_OPERATION_LABELS[operation] ?? operation,
        calls,
        tokens,
      }))
      .sort((left, right) => right.tokens - left.tokens || left.operation.localeCompare(right.operation)),
    byDay,
  };
}

export async function loadAiUsageSummary(
  client: Pick<PrismaClient, "aiUsage">,
  options: { now?: Date; env?: Record<string, string | undefined> } = {},
): Promise<AiUsageSummary> {
  const now = options.now ?? new Date();
  // Un jour de marge : le plus ancien jour affiché commence avant `now - 7 × 24 h`.
  const rows = await client.aiUsage.findMany({
    where: { createdAt: { gte: new Date(now.getTime() - (USAGE_DAYS + 1) * DAY_MS) } },
    select: { createdAt: true, operation: true, totalTokens: true },
  });

  return summarizeAiUsage(rows, {
    now,
    limit: readDailyTokenLimit(options.env ?? process.env),
  });
}
