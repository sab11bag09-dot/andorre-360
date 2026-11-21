import { defineConfig, devices } from "@playwright/test";

import { LAYOUT_SERVERS, layoutDatabaseUrl, layoutServerUrl } from "./e2e/layout/database";
import type { LayoutDatasetName } from "./e2e/layout/dataset";

/**
 * Test de la mise en page dans un vrai navigateur (Chromium).
 *
 * Deux serveurs de production (`next start`, après `npm run build`), chacun
 * sur sa base de test recréée à chaque exécution et remplie par un jeu de
 * données déterministe (`e2e/layout`) : `complet`, où toutes les zones sont
 * remplies, et `clairseme`, où la plupart sont vides. `./dev.db` n’est jamais
 * utilisé.
 */
function layoutServer(name: LayoutDatasetName) {
  const url = layoutServerUrl(name);

  return {
    command: `npx tsx e2e/layout/prepare-database.ts && npx next start --hostname 127.0.0.1 --port ${LAYOUT_SERVERS[name].port}`,
    url,
    // Toujours un serveur neuf sur la base de test, jamais un serveur déjà lancé.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      LAYOUT_DATASET: name,
      DATABASE_URL: layoutDatabaseUrl(name),
      AUTH_SECRET: process.env.AUTH_SECRET ?? "secret-du-test-de-mise-en-page",
      // En production, Auth.js n’accepte que l’hôte déclaré (AUTH_URL) ou, comme
      // ici derrière 127.0.0.1, un hôte explicitement approuvé.
      AUTH_URL: url,
      NEXT_PUBLIC_SITE_URL: url,
      MULTILINGUAL_PUBLICATION_ENABLED: "false",
    },
  };
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 90_000,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: layoutServerUrl("complet"),
    locale: "fr-FR",
    timezoneId: "Europe/Andorra",
    // Les animations au survol ou au chargement ne doivent pas fausser les mesures.
    reducedMotion: "reduce",
  },
  webServer: [layoutServer("complet"), layoutServer("clairseme")],
});
