import Link from "next/link";

const firstRow = [
  { label: "UNE", href: "/" },
  { label: "ACTUALITÉ", href: "/actualite" },
  { label: "FIL INFO", href: "/fil-info" },
  { label: "ÉCONOMIE", href: "/economie" },
  { label: "SOCIÉTÉ", href: "/societe" },
  { label: "POLITIQUE", href: "/politique" },
];

const secondRow = [
  { label: "IMMOBILIER", href: "/immobilier" },
  { label: "INTERNATIONAL", href: "/international" },
  { label: "SPORTS", href: "/sports" },
  { label: "CULTURE", href: "/culture" },
  { label: "MONTAGNE", href: "/montagne" },
  { label: "LOISIRS", href: "/loisirs" },
];

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300 transition-colors duration-300 hover:text-yellow-500"
    >
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-10 md:py-16">
        <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.34em] text-yellow-500">
          Rubriques
        </h2>

        <nav
          aria-label="Rubriques du site"
          className="mt-8 flex flex-col items-center gap-5"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            {firstRow.map((item) => (
              <FooterLink key={item.href} {...item} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
            {secondRow.map((item) => (
              <FooterLink key={item.href} {...item} />
            ))}
          </div>
        </nav>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
            © ANDORRA 360 Studio
          </p>

          <p className="mt-2 font-serif text-lg text-gray-500">
            La Principauté autrement
          </p>
        </div>
      </div>
    </footer>
  );
}