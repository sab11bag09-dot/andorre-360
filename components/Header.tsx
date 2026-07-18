import Link from "next/link";

const navigationItems = [
  {
    label: "ACTUALITÉ",
    href: "/actualite",
  },
  {
    label: "ÉCONOMIE",
    href: "/economie",
  },
  {
    label: "SOCIÉTÉ",
    href: "/societe",
  },
  {
    label: "CULTURE",
    href: "/culture",
  },
  {
    label: "SPORTS",
    href: "/sports",
  },
  {
    label: "MONTAGNE",
    href: "/montagne",
  },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        {/* LOGO */}

        <Link href="/" className="shrink-0">
          <h1 className="font-serif text-2xl tracking-[0.25em] text-white">
            ANDORRE{" "}
            <span className="text-yellow-500">
              360
            </span>
          </h1>
        </Link>

        {/* MENU */}

        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-8 text-sm tracking-widest"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 transition-colors hover:text-yellow-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}