import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { prisma } from "@/lib/prisma";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const authorizationError = await requireAdminApi();

  if (authorizationError) {
    return authorizationError;
  }

  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Le nom est obligatoire." },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        slug: createSlug(name),
        description: description || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Impossible de modifier la catégorie." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const authorizationError = await requireAdminApi();

  if (authorizationError) {
    return authorizationError;
  }

  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Impossible de supprimer la catégorie." },
      { status: 500 }
    );
  }
}
