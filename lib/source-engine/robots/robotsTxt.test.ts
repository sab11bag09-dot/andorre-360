import { describe, expect, it } from "vitest";

import { RobotsPolicy } from "./robotsPolicy";
import { parseRobotsTxt, robotsAllows, robotsRefusesAiInput } from "./robotsTxt";

const WORDPRESS = `
# Commentaire
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /*?s=
Disallow: /*.pdf$

User-agent: GPTBot
Disallow: /
`;

describe("robots.txt", () => {
  it("applique les règles du groupe « * » quand la collecte n’est pas nommée", () => {
    const robots = parseRobotsTxt(WORDPRESS);
    expect(robotsAllows(robots, "/actualitat/una-noticia")).toBe(true);
    expect(robotsAllows(robots, "/wp-admin/options.php")).toBe(false);
    expect(robotsAllows(robots, "/wp-admin/admin-ajax.php")).toBe(true);
    expect(robotsAllows(robots, "/?s=andorra")).toBe(false);
    expect(robotsAllows(robots, "/docs/informe.pdf")).toBe(false);
    expect(robotsAllows(robots, "/docs/informe.pdf?v=2")).toBe(true);
  });

  it("préfère le groupe qui nomme la collecte", () => {
    const robots = parseRobotsTxt("User-agent: *\nDisallow:\n\nUser-agent: ANDORRE-360\nDisallow: /premium/\n");
    expect(robotsAllows(robots, "/premium/article")).toBe(false);
    expect(robotsAllows(robots, "/actualitat")).toBe(true);
  });

  it("regroupe plusieurs lignes User-agent qui se suivent", () => {
    const robots = parseRobotsTxt("User-agent: Googlebot\nUser-agent: *\nDisallow: /privat/\n");
    expect(robotsAllows(robots, "/privat/x")).toBe(false);
  });

  it("autorise tout sans fichier, sans groupe ou avec « Disallow: » vide", () => {
    expect(robotsAllows(parseRobotsTxt(""), "/")).toBe(true);
    expect(robotsAllows(parseRobotsTxt("User-agent: *\nDisallow:\n"), "/x")).toBe(true);
    expect(robotsAllows(parseRobotsTxt("User-agent: *\nDisallow: /\n"), "/x")).toBe(false);
  });

  it("lit le signal d’usage par l’IA de Cloudflare", () => {
    const refuses = parseRobotsTxt("User-agent: *\nContent-Signal: search=yes, ai-train=no, ai-input=no\nAllow: /\n");
    expect(robotsRefusesAiInput(refuses)).toBe(true);

    const trainOnly = parseRobotsTxt("User-agent: *\nContent-Signal: search=yes, ai-train=no\nAllow: /\n");
    expect(robotsRefusesAiInput(trainOnly)).toBe(false);
    expect(robotsRefusesAiInput(parseRobotsTxt(WORDPRESS))).toBe(false);
  });
});

function policy(response: () => Promise<Response>) {
  let calls = 0;
  const instance = new RobotsPolicy({
    fetch: async () => {
      calls += 1;
      return response();
    },
  });
  return { instance, calls: () => calls };
}

describe("politique robots.txt", () => {
  it("refuse une page interdite et garde le fichier en mémoire", async () => {
    const { instance, calls } = policy(async () => new Response("User-agent: *\nDisallow: /privat/\n"));

    await expect(instance.assertAllowed("https://www.exemple.ad/noticies/1")).resolves.toBeUndefined();
    await expect(instance.assertAllowed("https://www.exemple.ad/privat/2")).rejects.toThrow(
      "robots.txt de www.exemple.ad interdit la collecte de /privat/2",
    );
    expect(calls()).toBe(1);
  });

  it("autorise tout quand le fichier n’existe pas", async () => {
    const { instance } = policy(async () => new Response("", { status: 404 }));
    await expect(instance.assertAllowed("https://www.exemple.ad/privat/2")).resolves.toBeUndefined();
  });

  it("suspend la collecte quand le site ne répond pas", async () => {
    const down = policy(async () => new Response("", { status: 503 }));
    await expect(down.instance.assertAllowed("https://www.exemple.ad/")).rejects.toThrow("injoignable");

    const offline = policy(async () => {
      throw new Error("ECONNRESET");
    });
    await expect(offline.instance.assertAllowed("https://www.exemple.ad/")).rejects.toThrow("injoignable");
  });

  it("refuse l’usage par l’IA quand le site l’interdit", async () => {
    const { instance } = policy(async () => new Response("User-agent: *\nContent-Signal: ai-input=no\nAllow: /\n"));
    await expect(instance.assertAllowed("https://www.exemple.ad/noticies/1")).resolves.toBeUndefined();
    await expect(instance.assertAiInputAllowed("https://www.exemple.ad/noticies/1")).rejects.toThrow("ai-input=no");
  });
});
