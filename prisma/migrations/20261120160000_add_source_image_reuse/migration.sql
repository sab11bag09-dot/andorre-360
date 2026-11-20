-- Réutilisation des photos des sources : jamais par défaut.
ALTER TABLE "Source" ADD COLUMN "imageReuse" TEXT NOT NULL DEFAULT 'NONE';

-- Photos reprises d’une source : restriction aux essais et adresse d’origine.
ALTER TABLE "Media" ADD COLUMN "testOnly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Media" ADD COLUMN "sourceUrl" TEXT;
CREATE INDEX "Media_sourceUrl_idx" ON "Media"("sourceUrl");
