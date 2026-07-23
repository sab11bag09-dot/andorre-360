"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  COLLECTION_MODES,
  ORGANIZATION_TYPES,
  PUBLICATION_MODES,
  TRUST_LEVELS,
} from "@/lib/sources/constants";

function getRequiredString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Le champ « ${field} » est obligatoire.`);
  }

  return value.trim();
}

function getOptionalString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

function isAllowedValue(
  value: string,
  options: readonly { value: string }[],
) {
  return options.some((option) => option.value === value);
}

function readSourceForm(formData: FormData) {
  const name = getRequiredString(formData, "name");
  const url = getRequiredString(formData, "url");
  const description = getOptionalString(formData, "description");
  const category = getOptionalString(formData, "category");

  const organizationType = getRequiredString(
    formData,
    "organizationType",
  );

  const collectionMode = getRequiredString(
    formData,
    "collectionMode",
  );

  const publicationMode = getRequiredString(
    formData,
    "publicationMode",
  );

  const trustLevel = getRequiredString(formData, "trustLevel");

  const intervalValue = Number(
    getRequiredString(formData, "checkIntervalMinutes"),
  );

  if (!URL.canParse(url)) {
    throw new Error("L’URL de la source n’est pas valide.");
  }

  if (
    !isAllowedValue(organizationType, ORGANIZATION_TYPES) ||
    !isAllowedValue(collectionMode, COLLECTION_MODES) ||
    !isAllowedValue(publicationMode, PUBLICATION_MODES) ||
    !isAllowedValue(trustLevel, TRUST_LEVELS)
  ) {
    throw new Error("Une valeur du formulaire n’est pas autorisée.");
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
    organizationType,
    collectionMode,
    publicationMode,
    trustLevel,
    checkIntervalMinutes: intervalValue,
    active: formData.get("active") === "on",
  };
}

export async function createSource(formData: FormData) {
  const data = readSourceForm(formData);

  await prisma.source.create({
    data,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/sources");
  redirect("/admin/sources");
}

export async function updateSource(
  sourceId: number,
  formData: FormData,
) {
  if (!Number.isInteger(sourceId)) {
    throw new Error("Identifiant de source invalide.");
  }

  const data = readSourceForm(formData);

  await prisma.source.update({
    where: {
      id: sourceId,
    },
    data,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/sources");
  revalidatePath(`/admin/sources/${sourceId}`);

  redirect("/admin/sources");
}

export async function toggleSource(sourceId: number) {
  if (!Number.isInteger(sourceId)) {
    throw new Error("Identifiant de source invalide.");
  }

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

  revalidatePath("/admin");
  revalidatePath("/admin/sources");
}