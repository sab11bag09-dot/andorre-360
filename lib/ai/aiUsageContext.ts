import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Rattache les appels à l’IA lancés pendant une tâche à l’observation ou à
 * l’article qu’elle traite, sans faire passer l’identifiant à travers les
 * générateurs. Sert au coût par article du pilote.
 */
export type AiUsageContext = { observationId?: number; articleId?: number };

const storage = new AsyncLocalStorage<AiUsageContext>();

export function withAiUsageContext<T>(context: AiUsageContext, task: () => Promise<T>): Promise<T> {
  return storage.run({ ...storage.getStore(), ...context }, task);
}

export function currentAiUsageContext(): AiUsageContext {
  return storage.getStore() ?? {};
}
