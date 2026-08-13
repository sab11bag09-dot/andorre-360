"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationFirstRow = [
  { label: "UNE", href: "/" },
  { label: "ACTUALITÉ", href: "/actualite" },
  { label: "FIL INFO", href: "/fil-info" },
  { label: "ÉCONOMIE", href: "/economie" },
  { label: "SOCIÉTÉ", href: "/societe" },
  { label: "POLITIQUE", href: "/politique" },
];

const navigationSecondRow = [
  { label: "ILS EN PARLENT", href: "/immobilier" },
  { label: "INTERNATIONAL", href: "/international" },
  { label: "SPORTS", href: "/sports" },
  { label: "CULTURE", href: "/culture" },
  { label: "MONTAGNE", href: "/montagne" },
  { label: "LOISIRS", href: "/loisirs" },
];

type NavigationItem = {
  label: string;
  href: string;
};

export default function Header() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function renderNavigationRow(items: NavigationItem[]) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {items.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                active
                  ? "text-yellow-500"
                  : "text-white hover:text-yellow-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 md:px-8">
        <div className="flex flex-col items-center gap-5">
          <Link href="/" className="shrink-0">
            <span className="font-serif text-2xl tracking-[0.25em] text-white">
              ANDORRA <span className="text-yellow-500">360</span>
            </span>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="w-full border-t border-gray-800 pt-4"
          >
            <div className="flex flex-col items-center">
              {renderNavigationRow(navigationFirstRow)}

              <div className="mt-4">
                {renderNavigationRow(navigationSecondRow)}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}