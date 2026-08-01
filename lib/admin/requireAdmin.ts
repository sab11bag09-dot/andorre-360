import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin(): Promise<void> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error("Action administrateur non autorisée.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    select: {
      role: true,
      active: true,
    },
  });

  if (!user || !user.active || user.role !== "ADMIN") {
    throw new Error("Action administrateur non autorisée.");
  }
}
