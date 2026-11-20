import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Les tests d’intégration créent une base SQLite temporaire et y
    // appliquent toutes les migrations avant de démarrer : sur une machine
    // d’intégration continue chargée, cela dépasse parfois le délai par
    // défaut de 10 s (échec du 20 novembre 2026, réussi à la relance).
    hookTimeout: 60_000,
  },
});
