"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  Prisma,
  SourceCollectionMode,
  SourceOrganizationType,
  SourcePublicationMode,
  SourceTrustLevel,
} from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";
import { checkSource } from "@/lib/source-engine/checkSource";
import {
  COLLECTION_MODES,
  ORGANIZATION_TYPES,
  PUBLICATION_MODES,
  TRUST_LEVELS,
} from "@/lib/sources/constants";
import { collectSource } from "@/lib/source-engine/collectSource";

function getRequiredString(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Le champ « ${field} » est obligatoire.`);
  }

  return value.trim();
}

function getOptionalString(
  formData: FormData,
  field: string,
): string | null {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue === "" ? null : normalizedValue;
}

function isAllowedValue<T extends string>(
  value: string,
  options: readonly { value: T }[],
): value is T {
  return options.some((option) => option.value === value);
}

function validateSourceId(sourceId: number): void {
  if (!Number.isInteger(sourceId) || sourceId < 1) {
    throw new Error("Identifiant de source invalide.");
  }
}

function normalizeSourceUrl(value: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("L’URL de la source n’est pas valide.");
  }

  if (
    parsedUrl.protocol !== "http:" &&
    parsedUrl.protocol !== "https:"
  ) {
    throw new Error(
      "L’URL doit utiliser le protocole HTTP ou HTTPS.",
    );
  }

  parsedUrl.hash = "";

  const normalizedUrl = parsedUrl.toString();

  if (parsedUrl.pathname === "/" && parsedUrl.search === "") {
    return normalizedUrl.replace(/\/$/, "");
  }

  return normalizedUrl;
}

function readSourceForm(formData: FormData) {
  const name = getRequiredString(formData, "name");
  const url = normalizeSourceUrl(
    getRequiredString(formData, "url"),
  );
  const description = getOptionalString(
    formData,
    "description",
  );
  const category = getOptionalString(formData, "category");

  const organizationTypeValue = getRequiredString(
    formData,
    "organizationType",
  );
  const collectionModeValue = getRequiredString(
    formData,
    "collectionMode",
  );
  const publicationModeValue = getRequiredString(
    formData,
    "publicationMode",
  );
  const trustLevelValue = getRequiredString(
    formData,
    "trustLevel",
  );

  const intervalValue = Number(
    getRequiredString(formData, "checkIntervalMinutes"),
  );

  if (
    !isAllowedValue(
      organizationTypeValue,
      ORGANIZATION_TYPES,
    )
  ) {
    throw new Error(
      "Le type d’organisation n’est pas autorisé.",
    );
  }

  if (
    !isAllowedValue(collectionModeValue, COLLECTION_MODES)
  ) {
    throw new Error(
      "Le mode de collecte n’est pas autorisé.",
    );
  }

  if (
    !isAllowedValue(
      publicationModeValue,
      PUBLICATION_MODES,
    )
  ) {
    throw new Error(
      "Le mode de publication n’est pas autorisé.",
    );
  }

  if (!isAllowedValue(trustLevelValue, TRUST_LEVELS)) {
    throw new Error(
      "Le niveau de confiance n’est pas autorisé.",
    );
  }

  if (
    !Number.isInteger(intervalValue) ||
    intervalValue < 1 ||
    intervalValue > 1440
  ) {
    throw new Error(
      "La fréquence doit être comprise entre 1 et 1 440 minutes.",
    );
  }

  return {
    name,
    url,
    description,
    category,
    organizationType:
      organizationTypeValue as SourceOrganizationType,
    collectionMode:
      collectionModeValue as SourceCollectionMode,
    publicationMode:
      publicationModeValue as SourcePublicationMode,
    trustLevel: trustLevelValue as SourceTrustLevel,
    checkIntervalMinutes: intervalValue,
    active: formData.get("active") === "on",
  };
}

function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function revalidateSourcePages(sourceId?: number): void {
  revalidatePath("/admin");
  revalidatePath("/admin/sources");

  if (sourceId !== undefined) {
    revalidatePath(`/admin/sources/${sourceId}`);
  }
}

export async function createSource(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const data = readSourceForm(formData);

  const existingSource = await prisma.source.findUnique({
    where: {
      url: data.url,
    },
    select: {
      id: true,
    },
  });

  if (existingSource) {
    throw new Error(
      "Une source utilisant cette URL existe déjà.",
    );
  }

  try {
    await prisma.source.create({
      data,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error(
        "Une source utilisant cette URL existe déjà.",
      );
    }

    throw error;
  }

  revalidateSourcePages();
  redirect("/admin/sources");
}

export async function updateSource(
  sourceId: number,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  validateSourceId(sourceId);

  const data = readSourceForm(formData);

  const existingSource = await prisma.source.findFirst({
    where: {
      url: data.url,
      id: {
        not: sourceId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingSource) {
    throw new Error(
      "Une autre source utilise déjà cette URL.",
    );
  }

  try {
    await prisma.source.update({
      where: {
        id: sourceId,
      },
      data,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error(
        "Une autre source utilise déjà cette URL.",
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("Source introuvable.");
    }

    throw error;
  }

  revalidateSourcePages(sourceId);
  redirect("/admin/sources");
}

export async function toggleSource(
  sourceId: number,
): Promise<void> {
  await requireAdmin();

  validateSourceId(sourceId);

  const source = await prisma.source.findUnique({
    where: {
      id: sourceId,
    },
    select: {
      active: true,
    },
  });

  if (!source) {
    throw new Error("Source introuvable.");
  }

  await prisma.source.update({
    where: {
      id: sourceId,
    },
    data: {
      active: !source.active,
    },
  });

  revalidateSourcePages(sourceId);
}

export async function checkAllSources(): Promise<void> {
  await requireAdmin();

  const sources = await prisma.source.findMany({
    where: { active: true },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    sources.map(({ id }) => checkSource(id)),
  );

  const failed = results.filter((result) => result.status === "rejected").length;
  console.info("[Sources] Vérification globale terminée", {
    total: sources.length,
    failed,
    available: sources.length - failed,
  });

  revalidateSourcePages();
}

export async function checkSourceAvailability(
  sourceId: number,
): Promise<void> {
  await requireAdmin();

  validateSourceId(sourceId);

  await checkSource(sourceId);

  revalidateSourcePages(sourceId);

}
export async function collectSourceNow(
  sourceId: number,
): Promise<void> {
  await requireAdmin();

  validateSourceId(sourceId);

  await collectSource(sourceId);

  revalidateSourcePages(sourceId);
}


export async function deleteSource(
  sourceId: number,
): Promise<void> {
  await requireAdmin();

  validateSourceId(sourceId);

  try {
    await prisma.source.delete({
      where: {
        id: sourceId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("Source introuvable.");
    }

    throw error;
  }

  revalidateSourcePages(sourceId);
}
