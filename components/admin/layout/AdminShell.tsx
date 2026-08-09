"use client";

import { useState, type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { AdminContent } from "./AdminContent";
import { AdminHeader } from "./AdminHeader";
import { AdminNavigation } from "./AdminNavigation";
import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
  userName?: string | null;
};

export function AdminShell({
  children,
  userName,
}: AdminShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <AdminHeader
        userName={userName}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <Sheet
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      >
        <SheetContent
          side="left"
          className="w-72 border-zinc-800 bg-black p-0 text-white"
        >
          <SheetHeader className="border-b border-zinc-800 p-5 text-left">
            <SheetTitle className="font-serif text-lg text-white">
              ANDORRA 360 Studio
            </SheetTitle>

            <SheetDescription className="sr-only">
              Navigation de l’espace d’administration
            </SheetDescription>
          </SheetHeader>

          <div className="p-4">
            <AdminNavigation
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0">
        <AdminSidebar />

        <AdminContent>{children}</AdminContent>
      </div>
    </div>
  );
}