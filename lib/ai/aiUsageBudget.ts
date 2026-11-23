import { currentAiUsageContext } from "./aiUsageContext";

/**
 * Suivi de la consommation OpenAI et plafond de dépense.
 *
 * Chaque appel réel est enregistré avec ses jetons (`AiUsage`). Avant tout
 * appel, les jetons consommés sur les 24 dernières heures sont comparés au
 * plafond `AI_DAILY_TOKEN_LIMIT` : une fois le plafond atteint, aucun appel
 * n’est lancé.
 *
 * Le plafond est exprimé en jetons, pas en euros : le prix dépend du modèle
 * et peut changer, il se lit dans le tableau de bord OpenAI. Le plafond peut
 * être légèrement dépassé par le dernier appel, dont la taille n’est connue
 * qu’après coup.
 */

/** Plafond appliqué quand `AI_DAILY_TOKEN_LIMIT` est absent ou invalide. */
export const DEFAULT_DAILY_TOKEN_LIMIT = 500_000;
export const AI_BUDGET_WINDOW_MS = 24 * 60 * 60 * 1_000;

export type AiUsageEntry = {
  provider: string;
  model: string;
  /** Nature de l’appel, par exemple `article_fact_sheet` ou `article_translation`. */
  operation: string;
  inputTokens: number;
  outputTokens: number;
  /** Observation ou article traité, quand l’appel est lancé dans `withAiUsageContext`. */
  observationId?: number;
  articleId?: number;
};

export interface AiUsageLedger {
  tokensUsedSince(since: Date): Promise<number>;
  record(entry: AiUsageEntry): Promise<void>;
}

export type AiBudgetOptions = {
  env?: Record<string, string | undefined>;
  now?: Date;
};

export type AiBudgetStatus = { used: number; limit: number; available: boolean };

export class AiBudgetExceededError extends Error {
  constructor(status: AiBudgetStatus) {
    super(
      `Plafond de dépense OpenAI atteint : ${formatTokens(status.used)} jetons consommés sur les dernières 24 heures, pour un plafond de ${formatTokens(status.limit)}. Aucun appel n’a été lancé.`,
    );
    this.name = "AiBudgetExceededError";
  }
}

function formatTokens(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function readDailyTokenLimit(env: Record<string, string | undefined>): number {
  const raw = env.AI_DAILY_TOKEN_LIMIT?.trim();

  if (raw && /^\d+$/.test(raw)) {
    return Number(raw);
  }

  return DEFAULT_DAILY_TOKEN_LIMIT;
}

export async function aiBudgetStatus(
  ledger: AiUsageLedger,
  options: AiBudgetOptions = {},
): Promise<AiBudgetStatus> {
  const now = options.now ?? new Date();
  const limit = readDailyTokenLimit(options.env ?? process.env);
  const used = await ledger.tokensUsedSince(new Date(now.getTime() - AI_BUDGET_WINDOW_MS));

  return { used, limit, available: used < limit };
}

type ResponseWithUsage = {
  output_text: string;
  usage?: { input_tokens: number; output_tokens: number } | null;
};

/**
 * Vérifie le plafond, lance l’appel, puis enregistre ses jetons. Un appel
 * refusé ou en échec n’est pas enregistré.
 */
export async function meterAiCall<T extends ResponseWithUsage>(
  ledger: AiUsageLedger,
  meta: Pick<AiUsageEntry, "provider" | "model" | "operation">,
  call: () => Promise<T>,
  options: AiBudgetOptions = {},
): Promise<T> {
  const status = await aiBudgetStatus(ledger, options);

  if (!status.available) {
    throw new AiBudgetExceededError(status);
  }

  const response = await call();

  await ledger.record({
    ...currentAiUsageContext(),
    ...meta,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  });

  return response;
}
