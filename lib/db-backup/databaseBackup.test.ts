import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  backupFileName,
  createVerifiedBackup,
  sqlitePathFromUrl,
  verifyBackup,
} from "./databaseBackup";

let dir: string;
let sourcePath: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "andorre-360-sauvegarde-test-"));
  sourcePath = path.join(dir, "source.db");
  const db = new Database(sourcePath);
  db.exec(`
    CREATE TABLE _prisma_migrations (migration_name TEXT, finished_at TEXT);
    INSERT INTO _prisma_migrations VALUES ('20261101000000_init', 'x'), ('20261123140000_ai_usage', 'x');
    CREATE TABLE Article (id INTEGER PRIMARY KEY, title TEXT);
    INSERT INTO Article (title) VALUES ('Un'), ('Deux'), ('Trois');
  `);
  db.close();
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("sauvegarde de la base", () => {
  it("lit le chemin d’une URL SQLite et refuse les autres bases", () => {
    expect(sqlitePathFromUrl("file:./dev.db", "/projet")).toBe("/projet/dev.db");
    expect(sqlitePathFromUrl("file:/srv/base.db?mode=ro", "/projet")).toBe("/srv/base.db");
    expect(() => sqlitePathFromUrl("postgresql://hote/base")).toThrow("SQLite");
  });

  it("date le fichier en UTC", () => {
    expect(backupFileName(new Date("2026-11-23T21:05:09.123Z"))).toBe("andorre-360-20261123T210509Z.db");
  });

  it("crée une copie vérifiée, restaurée à l’essai, identique à la base", async () => {
    const backupDir = path.join(dir, "sauvegardes");
    const report = await createVerifiedBackup({
      sourcePath,
      backupDir,
      now: new Date("2026-11-23T21:00:00Z"),
    });

    expect(path.basename(report.path)).toBe("andorre-360-20261123T210000Z.db");
    expect(report.lastMigration).toBe("20261123140000_ai_usage");
    expect(report.tables).toEqual([
      { name: "Article", rows: 3 },
      { name: "_prisma_migrations", rows: 2 },
    ]);
    // Aucun fichier partiel ne reste.
    expect(await readdir(backupDir)).toEqual(["andorre-360-20261123T210000Z.db"]);
    expect(verifyBackup(report.path).integrity).toBe("ok");
  });

  it("ne garde que les plus récentes et ne touche à aucun autre fichier", async () => {
    const backupDir = path.join(dir, "sauvegardes");
    for (const day of ["20", "21", "22"]) {
      await createVerifiedBackup({ sourcePath, backupDir, keep: 2, now: new Date(`2026-11-${day}T03:00:00Z`) });
    }
    await writeFile(path.join(backupDir, "notes.txt"), "à garder");
    const report = await createVerifiedBackup({
      sourcePath,
      backupDir,
      keep: 2,
      now: new Date("2026-11-23T03:00:00Z"),
    });

    expect(report.removed).toEqual(["andorre-360-20261121T030000Z.db"]);
    expect((await readdir(backupDir)).sort()).toEqual([
      "andorre-360-20261122T030000Z.db",
      "andorre-360-20261123T030000Z.db",
      "notes.txt",
    ]);
  });

  it("refuse une sauvegarde corrompue", async () => {
    const broken = path.join(dir, "andorre-360-20261123T000000Z.db");
    await writeFile(broken, "ceci n’est pas une base SQLite");
    expect(() => verifyBackup(broken)).toThrow();
  });

  it("refuse de ne rien garder", async () => {
    await expect(createVerifiedBackup({ sourcePath, backupDir: path.join(dir, "s"), keep: 0 })).rejects.toThrow(
      "au moins une",
    );
  });
});
