import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AdminAuthorizationResult =
  | { authorized: true; email: string }
  | { authorized: false; status: 401 | 403; message: string };

export class AdminAuthorizationError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminAuthorizationError";
    this.status = status;
  }
}

export async function getAdminAuthorization(): Promise<AdminAuthorizationResult> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return {
      authorized: false,
      status: 401,
      message: "Authentification requise.",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      role: true,
      active: true,
    },
  });

  if (!user || !user.active || user.role !== "ADMIN") {
    return {
      authorized: false,
      status: 403,
      message: "Accès administrateur requis.",
    };
  }

  return { authorized: true, email };
}

export async function requireAdmin(): Promise<void> {
  const authorization = await getAdminAuthorization();

  if (!authorization.authorized) {
    throw new AdminAuthorizationError(
      authorization.status,
      authorization.message,
    );
  }
}

export async function requireAdminApi() {
  const authorization = await getAdminAuthorization();

  if (!authorization.authorized) {
    return NextResponse.json(
      { error: authorization.message },
      { status: authorization.status },
    );
  }

  return null;
}
