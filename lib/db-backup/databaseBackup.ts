import { copyFile, mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import Database from "better-sqlite3";

/**
 * Sauvegarde de la base SQLite (étape 5 de la feuille de route) :
 * 1. copie à chaud par l’API de sauvegarde de SQLite, cohérente même si le
 *    site écrit pendant la copie ;
 * 2. vérification de la copie (`PRAGMA integrity_check`, dernière migration) ;
 * 3. essai de restauration : la copie est rouverte ailleurs, chaque table relue ;
 * 4. la copie n’est datée et gardée qu’une fois tout vérifié ; les plus
 *    anciennes sauvegardes au-delà de `keep` sont supprimées.
 *
 * Seuls les fichiers nommés `andorre-360-AAAAMMJJTHHMMSSZ.db` du dossier de
 * sauvegarde sont concernés par la rotation : rien d’autre n’est supprimé.
 */

export const BACKUP_FILE_PATTERN = /^andorre-360-\d{8}T\d{6}Z\.db$/u;
export const DEFAULT_BACKUP_KEEP = 14;

export type BackupReport = {
  path: string;
  sizeBytes: number;
  lastMigration: string | null;
  tables: Array<{ name: string; rows: number }>;
  removed: string[];
};

/** Chemin du fichier d’une URL `file:` de SQLite, relatif au dossier courant. */
export function sqlitePathFromUrl(url: string, cwd = process.cwd()): string {
  if (!url.startsWith("file:")) {
    throw new Error("La sauvegarde ne connaît que les bases SQLite (URL « file: »).");
  }
  const file = url.slice("file:".length).split("?")[0];
  if (!file) throw new Error("L’URL de la base ne donne pas de fichier.");
  return path.resolve(cwd, file);
}

/** Nom daté en UTC, sans ambiguïté au changement d’heure. */
export function backupFileName(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/gu, "").replace(/\.\d{3}Z$/u, "Z");
  return `andorre-360-${stamp}.db`;
}

type Snapshot = { integrity: string; lastMigration: string | null; tables: BackupReport["tables"] };

function lastMigration(db: Database.Database): string | null {
  const exists = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '_prisma_migrations'")
    .get();
  if (!exists) return null;
  const row = db
    .prepare(
      "SELECT migration_name AS name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY migration_name DESC LIMIT 1",
    )
    .get() as { name: string } | undefined;
  return row?.name ?? null;
}

function inspect(file: string, options: { readonly: boolean }): Snapshot {
  const db = new Database(file, { readonly: options.readonly, fileMustExist: true });
  try {
    const integrity = (db.pragma("integrity_check") as Array<{ integrity_check: string }>)
      .map((row) => row.integrity_check)
      .join("; ");
    const names = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all() as Array<{ name: string }>;
    const tables = names.map(({ name }) => ({
      name,
      rows: (db.prepare(`SELECT count(*) AS rows FROM "${name.replace(/"/gu, '""')}"`).get() as { rows: number }).rows,
    }));
    return { integrity, lastMigration: lastMigration(db), tables };
  } finally {
    db.close();
  }
}

/** Vérifie une sauvegarde existante : intégrité et lecture de chaque table. */
export function verifyBackup(file: string): Snapshot {
  const snapshot = inspect(file, { readonly: true });
  if (snapshot.integrity !== "ok") {
    throw new Error(`Sauvegarde corrompue (${path.basename(file)}) : ${snapshot.integrity}`);
  }
  return snapshot;
}

/** Essai de restauration : la copie rouverte ailleurs doit redonner la même base. */
async function rehearseRestore(file: string, expected: Snapshot): Promise<void> {
  const restored = path.join(tmpdir(), `andorre-360-restauration-${process.pid}-${Date.now()}.db`);
  try {
    await copyFile(file, restored);
    const snapshot = inspect(restored, { readonly: false });
    if (snapshot.integrity !== "ok") {
      throw new Error(`Restauration impossible : ${snapshot.integrity}`);
    }
    if (JSON.stringify(snapshot.tables) !== JSON.stringify(expected.tables)) {
      throw new Error("Restauration incomplète : les tables restaurées diffèrent de la sauvegarde.");
    }
  } finally {
    await rm(restored, { force: true });
    await rm(`${restored}-wal`, { force: true });
    await rm(`${restored}-shm`, { force: true });
  }
}

async function rotate(backupDir: string, keep: number): Promise<string[]> {
  const files = (await readdir(backupDir)).filter((name) => BACKUP_FILE_PATTERN.test(name)).sort();
  const removed = files.slice(0, Math.max(0, files.length - keep));
  for (const name of removed) await rm(path.join(backupDir, name));
  return removed;
}

export async function createVerifiedBackup(options: {
  sourcePath: string;
  backupDir: string;
  keep?: number;
  now?: Date;
}): Promise<BackupReport> {
  const keep = options.keep ?? DEFAULT_BACKUP_KEEP;
  if (!Number.isInteger(keep) || keep < 1) {
    throw new Error("Il faut garder au moins une sauvegarde.");
  }

  const sourcePath = path.resolve(options.sourcePath);
  const backupDir = path.resolve(options.backupDir);
  await mkdir(backupDir, { recursive: true });

  const finalPath = path.join(backupDir, backupFileName(options.now ?? new Date()));
  const partialPath = `${finalPath}.partial`;

  const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
  const sourceMigration = lastMigration(source);
  try {
    await source.backup(partialPath);
  } catch (error) {
    await rm(partialPath, { force: true });
    throw error;
  } finally {
    source.close();
  }

  try {
    const snapshot = verifyBackup(partialPath);
    if (snapshot.lastMigration !== sourceMigration) {
      throw new Error(
        `La sauvegarde ne s’arrête pas à la même migration que la base (${snapshot.lastMigration ?? "aucune"} au lieu de ${sourceMigration ?? "aucune"}).`,
      );
    }
    await rehearseRestore(partialPath, snapshot);
    await rename(partialPath, finalPath);

    const removed = await rotate(backupDir, keep);
    return {
      path: finalPath,
      sizeBytes: (await stat(finalPath)).size,
      lastMigration: snapshot.lastMigration,
      tables: snapshot.tables,
      removed,
    };
  } catch (error) {
    await rm(partialPath, { force: true });
    throw error;
  }
}
