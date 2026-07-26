import { NextResponse } from "next/server";

import { uploadMedia } from "@/lib/media/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        {
          error: "Aucun fichier n’a été envoyé.",
        },
        {
          status: 400,
        },
      );
    }

    const media = await uploadMedia(uploadedFile);

    return NextResponse.json(
      {
        message: "Image téléversée avec succès.",
        media,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Erreur pendant le téléversement :", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue pendant le téléversement.",
      },
      {
        status: 500,
      },
    );
  }
}