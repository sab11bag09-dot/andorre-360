import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Garde-fou contre les fichiers morts : chaque module du projet doit être
 * atteint, par ses imports, depuis une page ou une route de `app/`, un script,
 * un fichier de configuration à la racine ou un test.
 *
 * Un module que seuls des tests importent est signalé à part : c’est le plus
 * souvent du code abandonné qui garde son test. Les exceptions voulues sont
 * listées dans `TEST_ONLY_MODULES`, avec leur raison.
 */

const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIRS = ["actions", "app", "components", "data", "lib", "scripts", "types"];
const IGNORED_DIRS = new Set(["node_modules", "generated"]);
const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs", ".css"];
const RESOLVE_SUFFIXES = ["", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".css", "/index.tsx", "/index.ts"];

const TEST_ONLY_MODULES: Readonly<Record<string, string>> = {
  "lib/editorial/testUtils.ts": "outils partagés par les tests",
  "lib/source-engine/backfillObservationDates.ts":
    "outil de redatage lancé à la main (guide du chantier, lot sources)",
};

const APP_ENTRY =
  /^app\/.*\/?(page|layout|route|loading|error|not-found|template|default|global-error|sitemap|robots|manifest|opengraph-image|icon)\.(tsx?|js)$|^app\/globals\.css$/;

function listSourceFiles(): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const relative = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) walk(relative);
      } else if (EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(relative);
      }
    }
  };
  for (const dir of SOURCE_DIRS) walk(dir);
  for (const entry of fs.readdirSync(ROOT)) {
    if (EXTENSIONS.includes(path.extname(entry))) files.push(entry);
  }
  return files;
}

const IMPORT_PATTERN =
  /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]|vi\.mock\(\s*['"]([^'"]+)['"]|@import\s+['"]([^'"]+)['"]/g;

function buildGraph(files: string[]): Map<string, string[]> {
  const known = new Set(files);
  const resolve = (from: string, specifier: string): string | null => {
    let base: string;
    if (specifier.startsWith("@/")) base = specifier.slice(2);
    else if (specifier.startsWith(".")) base = path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
    else return null;
    for (const suffix of RESOLVE_SUFFIXES) {
      if (known.has(base + suffix)) return base + suffix;
    }
    return null;
  };

  const graph = new Map<string, string[]>();
  for (const file of files) {
    const source = fs.readFileSync(path.join(ROOT, file), "utf8");
    const dependencies: string[] = [];
    for (const match of source.matchAll(IMPORT_PATTERN)) {
      const specifier = match.slice(1).find(Boolean);
      const resolved = specifier ? resolve(file, specifier) : null;
      if (resolved) dependencies.push(resolved);
    }
    graph.set(file, dependencies);
  }
  return graph;
}

function reachableFrom(graph: Map<string, string[]>, entries: string[]): Set<string> {
  const seen = new Set<string>();
  const stack = [...entries];
  while (stack.length > 0) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    stack.push(...(graph.get(file) ?? []));
  }
  return seen;
}

const isTest = (file: string) => /\.test\.tsx?$/.test(file) || file.includes("/__tests__/");
const isRuntimeEntry = (file: string) =>
  APP_ENTRY.test(file) || file.startsWith("scripts/") || !file.includes("/");

describe("modules orphelins", () => {
  const files = listSourceFiles();
  const graph = buildGraph(files);
  const runtime = reachableFrom(graph, files.filter(isRuntimeEntry));
  const everything = reachableFrom(graph, files.filter((file) => isRuntimeEntry(file) || isTest(file)));

  it("n’a aucun module que rien n’importe", () => {
    expect(files.filter((file) => !everything.has(file))).toEqual([]);
  });

  it("n’a aucun module importé seulement par des tests, hors exceptions voulues", () => {
    const testOnly = files.filter(
      (file) => everything.has(file) && !runtime.has(file) && !isTest(file),
    );
    expect(testOnly.sort()).toEqual(Object.keys(TEST_ONLY_MODULES).sort());
  });
});
