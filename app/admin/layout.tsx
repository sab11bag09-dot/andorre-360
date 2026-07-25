import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { prisma } from "@/lib/prisma";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
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
    redirect("/login");
  }

  return <AdminShell>{children}</AdminShell>;
}