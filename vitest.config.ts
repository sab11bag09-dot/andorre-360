import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Le test de mise en page dans le navigateur relève de Playwright (`e2e/`).
    exclude: [...configDefaults.exclude, "e2e/**"],
    // Les tests d’intégration créent une base SQLite temporaire et y
    // appliquent toutes les migrations avant de démarrer : sur une machine
    // d’intégration continue chargée, cela dépasse parfois le délai par
    // défaut de 10 s (échec du 20 novembre 2026, réussi à la relance).
    hookTimeout: 60_000,
  },
});
