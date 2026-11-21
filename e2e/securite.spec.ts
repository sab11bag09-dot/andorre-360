import { expect, test } from "@playwright/test";

/**
 * Sécurité de production, vérifiée sur le serveur de test (`next start`, base
 * de test) : en-têtes envoyés avec les pages, et limite des tentatives de
 * connexion. L’adresse e-mail est inventée et n’existe pas dans la base.
 */

test("chaque page envoie les en-têtes de sécurité", async ({ request }) => {
  for (const path of ["/", "/fil-info", "/login"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const headers = response.headers();
    expect(headers["content-security-policy"], path).toContain("frame-ancestors 'self'");
    expect(headers["x-frame-options"], path).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"], path).toBe("nosniff");
    expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"], path).toContain("max-age=");
    expect(headers["x-powered-by"], path).toBeUndefined();
  }
});

test("la connexion est bloquée après 5 échecs pour une même adresse", async ({ page }) => {
  await page.goto("/login");
  const email = `essai-${Date.now()}@exemple.test`;

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(`mauvais-${attempt}`);
    // Attendre la réponse du serveur : le message des essais 1 à 5 est le même.
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("/api/auth/callback/credentials")),
      page.getByRole("button", { name: "Se connecter" }).click(),
    ]);

    const expected =
      attempt <= 5
        ? "E-mail ou mot de passe incorrect."
        : "Trop de tentatives de connexion. Réessayez dans 15 minutes.";
    await expect(page.getByText(expected)).toBeVisible();
  }
});
