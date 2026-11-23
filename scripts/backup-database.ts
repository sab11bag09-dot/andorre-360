/**
 * Sauvegarde vérifiée de la base : `npm run db:backup`.
 *
 * - `DATABASE_URL` : la base à sauvegarder (par défaut `file:./dev.db`) ;
 * - `BACKUP_DIR` : dossier des sauvegardes (par défaut `./backups`). En
 *   production, un dossier hors du serveur (volume monté, stockage distant) ;
 * - `BACKUP_KEEP` : nombre de sauvegardes gardées (par défaut 14).
 *
 * Avec un chemin en argument, vérifie seulement cette sauvegarde :
 * `npm run db:backup -- backups/andorre-360-20261123T210000Z.db`.
 *
 * Code de sortie 1 en cas d’échec : un planificateur (cron, launchd) peut alerter.
 */
import "dotenv/config";

import {
  createVerifiedBackup,
  DEFAULT_BACKUP_KEEP,
  sqlitePathFromUrl,
  verifyBackup,
} from "../lib/db-backup/databaseBackup";

function readKeep(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return DEFAULT_BACKUP_KEEP;
  if (!/^\d+$/u.test(raw.trim())) throw new Error("BACKUP_KEEP doit être un nombre entier.");
  return Number(raw.trim());
}

async function main() {
  const file = process.argv[2];
  if (file) {
    const snapshot = verifyBackup(file);
    console.log(`Sauvegarde intègre : ${file}`);
    console.log(`Dernière migration : ${snapshot.lastMigration ?? "aucune"}`);
    console.log(`${snapshot.tables.length} tables relues.`);
    return;
  }

  const report = await createVerifiedBackup({
    sourcePath: sqlitePathFromUrl(process.env.DATABASE_URL ?? "file:./dev.db"),
    backupDir: process.env.BACKUP_DIR?.trim() || "backups",
    keep: readKeep(process.env.BACKUP_KEEP),
  });

  const rows = (name: string) => report.tables.find((table) => table.name === name)?.rows ?? 0;
  console.log(`Sauvegarde vérifiée et restaurée à l’essai : ${report.path}`);
  console.log(`${(report.sizeBytes / 1_048_576).toFixed(1)} Mo · dernière migration ${report.lastMigration ?? "aucune"}`);
  console.log(`${rows("Article")} articles · ${rows("Observation")} observations · ${rows("Source")} sources`);
  if (report.removed.length > 0) console.log(`Anciennes sauvegardes supprimées : ${report.removed.join(", ")}`);
}

main().catch((error: unknown) => {
  console.error(`Échec de la sauvegarde : ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
