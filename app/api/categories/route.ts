import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({
    categories,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json(
      {
        error: "Le nom de la catégorie est obligatoire.",
      },
      {
        status: 400,
      }
    );
  }

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || null,
    },
  });

  return NextResponse.json(category, {
    status: 201,
  });
}