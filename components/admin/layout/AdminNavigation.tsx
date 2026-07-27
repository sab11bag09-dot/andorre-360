"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "./admin-navigation";

type AdminNavigationProps = {
  onNavigate?: () => void;
};

export function AdminNavigation({
  onNavigate,
}: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {adminNavigation.map((item) => {
        const Icon = item.icon;

        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-white text-black"
                : "text-zinc-300 hover:bg-zinc-900 hover:text-white",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}