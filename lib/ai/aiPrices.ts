/**
 * Prix des modèles OpenAI, en dollars par million de jetons, pour estimer le
 * coût des appels enregistrés (`AiUsage`). Estimation seulement : la facture
 * fait foi et se lit dans le tableau de bord OpenAI. Un modèle absent du
 * tableau n’a pas de coût estimé.
 */
export const AI_PRICES_USD_PER_MILLION: Record<string, { input: number; output: number }> = {
  // Tarif relevé le 23 novembre 2026 sur des sources tierces.
  "gpt-5.6-terra": { input: 2, output: 12 },
};

export function aiCallCostUsd(model: string, inputTokens: number, outputTokens: number): number | null {
  const price = AI_PRICES_USD_PER_MILLION[model];
  if (!price) return null;
  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}
