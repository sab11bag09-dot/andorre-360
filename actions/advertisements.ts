"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";

const PAGE_KEY = "actualite";

function getText(formData: FormData, name: string): string {
  return formData.get(name)?.toString().trim() ?? "";
}

function getOptionalDate(
  formData: FormData,
  name: string,
): Date | null {
  const value = getText(formData, name);
  return value ? new Date(value) : null;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function revalidateAdvertisementPages() {
  revalidatePath("/admin/publicites");
  revalidatePath("/actualite");
}

export async function createAdvertisementAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const imagePath = getText(formData, "imagePath");
  const targetUrl = getText(formData, "targetUrl");
  const format = getText(formData, "format");
  const startsAt = getOptionalDate(formData, "startsAt");
  const endsAt = getOptionalDate(formData, "endsAt");

  if (!imagePath) {
    throw new Error("Une image est obligatoire.");
  }

  if (!isValidUrl(targetUrl)) {
    throw new Error("Le lien publicitaire est invalide.");
  }

  if (
    format !== "FOUR_COLUMNS" &&
    format !== "TWO_COLUMNS_WITH_CARD"
  ) {
    throw new Error("Le format publicitaire est invalide.");
  }

  if (startsAt && Number.isNaN(startsAt.getTime())) {
    throw new Error("La date de début est invalide.");
  }

  if (endsAt && Number.isNaN(endsAt.getTime())) {
    throw new Error("La date de fin est invalide.");
  }

  if (startsAt && endsAt && endsAt < startsAt) {
    throw new Error(
      "La date de fin doit être postérieure à la date de début.",
    );
  }

  await prisma.advertisement.create({
    data: {
      imagePath,
      targetUrl,
      format,
      pageKey: PAGE_KEY,
      active: false,
      startsAt,
      endsAt,
    },
  });

  revalidateAdvertisementPages();
}

export async function setAdvertisementActiveAction(
  id: number,
  active: boolean,
): Promise<void> {
  await requireAdmin();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Publicité invalide.");
  }

  await prisma.advertisement.update({
    where: { id },
    data: { active },
  });

  revalidateAdvertisementPages();
}

export async function deleteAdvertisementAction(
  id: number,
): Promise<void> {
  await requireAdmin();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Publicité invalide.");
  }

  await prisma.advertisement.delete({
    where: { id },
  });

  revalidateAdvertisementPages();
}