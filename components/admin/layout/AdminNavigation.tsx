import Link from "next/link";
import { adminNavigation } from "./admin-navigation";

type AdminNavigationProps = {
  onNavigate?: () => void;
};

export function AdminNavigation({
  onNavigate,
}: AdminNavigationProps) {
  return (
    <nav className="space-y-1">
      {adminNavigation.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            <Icon className="h-4 w-4" />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}