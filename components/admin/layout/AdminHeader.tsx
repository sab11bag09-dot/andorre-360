import Link from "next/link";
import { signOut } from "next-auth/react";

import { MobileMenu } from "./MobileMenu";

type AdminHeaderProps = {
  userName?: string | null;
  onToggleMobileMenu: () => void;
};

export function AdminHeader({
  userName,
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
            ANDORRA 360 Studio
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-zinc-400 lg:block">
              {userName}
            </span>
          )}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold transition hover:bg-zinc-900 sm:px-4 sm:text-sm"
          >
            Déconnexion
          </button>

          <Link
            href="/admin/articles/nouveau"
            className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-yellow-400 sm:px-4 sm:text-sm"
          >
            <span className="sm:hidden">Créer</span>
            <span className="hidden sm:inline">Créer un article</span>
          </Link>
        </div>
      </div>
    </header>
  );
}