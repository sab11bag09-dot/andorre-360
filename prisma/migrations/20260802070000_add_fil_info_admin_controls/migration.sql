ALTER TABLE "Article"
ADD COLUMN "filInfoVisible" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Article"
ADD COLUMN "filInfoPinned" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Article_filInfoPinned_idx"
ON "Article"("filInfoPinned");

CREATE UNIQUE INDEX "Article_single_fil_info_pin"
ON "Article"("filInfoPinned")
WHERE "filInfoPinned" = true;
