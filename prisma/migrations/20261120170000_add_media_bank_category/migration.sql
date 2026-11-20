-- Banque d’images de la rédaction, classée par rubrique.
ALTER TABLE "Media" ADD COLUMN "bankCategory" TEXT;
CREATE INDEX "Media_bankCategory_idx" ON "Media"("bankCategory");
