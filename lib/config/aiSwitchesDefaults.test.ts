import { describe, expect, it } from "vitest";

import { readAutoPublicationRuntimeConfig } from "@/lib/article-engine/autoPublicationRuntime";
import {
  isArticleOrchestratorEnabled,
  readArticleOrchestrationMode,
} from "@/lib/article-orchestrator/executeArticleOrchestration";
import { readDailyTokenLimit } from "@/lib/ai/aiUsageBudget";
import { isMultilingualPublicationEnabled } from "@/lib/config/multilingualPublication";
import { readHomeCompositionApplicationRuntime } from "@/lib/editorial/applyAutomatedHomeComposition";

/**
 * Préparation de la production : sur un serveur sans fichier `.env`, aucun
 * interrupteur de l’IA n’est actif. Chacun ne s’allume que sur la valeur
 * exacte « true » ; toute autre valeur (vide, « 1 », « yes », faute de
 * frappe) le laisse coupé.
 */
describe("interrupteurs de l’IA sans .env", () => {
  const noEnv: Record<string, string | undefined> = {};

  it("coupe la publication automatique, l’orchestrateur et la composition de la une", () => {
    expect(readAutoPublicationRuntimeConfig(noEnv)).toEqual({ enabled: false, emergencyStop: false, sourceIds: [] });
    expect(isArticleOrchestratorEnabled(noEnv)).toBe(false);
    expect(readArticleOrchestrationMode(noEnv)).toBe("DRAFTS_ONLY");
    expect(readHomeCompositionApplicationRuntime(noEnv).enabled).toBe(false);
    expect(isMultilingualPublicationEnabled(undefined)).toBe(false);
  });

  it.each(["1", "yes", "TRUE ", "vrai", ""])("reste coupé avec la valeur « %s »", (value) => {
    const env = {
      AI_AUTO_PUBLICATION_ENABLED: value,
      AI_ARTICLE_ORCHESTRATOR_ENABLED: value,
      AI_ARTICLE_ORCHESTRATOR_PUBLISH: value,
      AI_HOME_COMPOSITION_APPLY_ENABLED: value,
    };
    expect(readAutoPublicationRuntimeConfig(env).enabled).toBe(false);
    expect(isArticleOrchestratorEnabled(env)).toBe(false);
    expect(readArticleOrchestrationMode(env)).toBe("DRAFTS_ONLY");
    expect(readHomeCompositionApplicationRuntime(env).enabled).toBe(false);
  });

  it("garde un plafond de dépense quotidien même sans réglage", () => {
    expect(readDailyTokenLimit(noEnv)).toBeGreaterThan(0);
  });
});
