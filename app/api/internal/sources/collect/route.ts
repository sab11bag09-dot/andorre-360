import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { collectDueSources } from "@/lib/source-engine/collectDueSources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValidSecret(request: NextRequest, secret: string): boolean {
  const authorization = request.headers.get("authorization");
  const expected = `Bearer ${secret}`;

  if (!authorization) {
    return false;
  }

  const receivedBuffer = Buffer.from(authorization);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

async function handleCollection(request: NextRequest) {
  const secret = process.env.SOURCE_COLLECTION_SECRET?.trim();

  if (!secret) {
    return NextResponse.json(
      { error: "La collecte planifiée n’est pas configurée." },
      { status: 503 },
    );
  }

  if (!hasValidSecret(request, secret)) {
    return NextResponse.json(
      { error: "Autorisation invalide." },
      { status: 401 },
    );
  }

  const batchSize = Number(
    process.env.SOURCE_COLLECTION_BATCH_SIZE ?? "10",
  );
  const result = await collectDueSources({ batchSize });

  return NextResponse.json(result);
}

export const GET = handleCollection;
export const POST = handleCollection;
