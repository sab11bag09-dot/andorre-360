import path from "node:path";

import type { LayoutDatasetName } from "./dataset";

/**
 * Bases SQLite propres au test de mise en page, une par jeu de données,
 * recréées à chaque exécution et servies chacune par son propre serveur.
 * Elles sont séparées de `./dev.db`, qui n’est jamais lu ni modifié ici.
 */
export const LAYOUT_SERVERS = {
  complet: { port: 3100 },
  clairseme: { port: 3101 },
} as const satisfies Record<LayoutDatasetName, { port: number }>;

export function layoutDatabaseUrl(name: LayoutDatasetName): string {
  return `file:${path.resolve(__dirname, `../../.playwright/mise-en-page-${name}.db`)}`;
}

export function layoutServerUrl(name: LayoutDatasetName): string {
  return `http://127.0.0.1:${LAYOUT_SERVERS[name].port}`;
}
