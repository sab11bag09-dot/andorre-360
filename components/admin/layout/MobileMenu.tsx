"use client";

import { Menu } from "lucide-react";

type MobileMenuProps = {
  onClick: () => void;
};

export function MobileMenu({ onClick }: MobileMenuProps) {
  return (
    <button
      type="button"
      aria-label="Ouvrir la navigation"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white md:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}