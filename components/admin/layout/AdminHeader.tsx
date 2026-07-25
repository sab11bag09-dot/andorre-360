import Link from "next/link";

import { MobileMenu } from "./MobileMenu";

type AdminHeaderProps = {
  onToggleMobileMenu: () => void;
};

export function AdminHeader({
  onToggleMobileMenu,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="flex h-16 min-w-0 items-center justify-between gap-3 px-4 sm:px-6 md:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenu onClick={onToggleMobileMenu} />

          <Link
            href="/admin"
            className="min-w-0 truncate font-serif text-base font-semibold sm:text-lg"
          >
            ANDORRE 360 Studio
          </Link>
        </div>

        <Link
          href="/admin/articles/nouveau"
          className="shrink-0 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-yellow-400 sm:px-4 sm:text-sm"
        >
          <span className="sm:hidden">Créer</span>
          <span className="hidden sm:inline">Créer un article</span>
        </Link>
      </div>
    </header>
  );
}