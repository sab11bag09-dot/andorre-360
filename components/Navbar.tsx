import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-800 bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between px-8 py-6 md:flex-row md:items-center">
        <Link href="/">
          <div>
            <h1 className="text-3xl font-bold tracking-widest">
              ANDORRE 360
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              La Principauté autrement
            </p>
          </div>
        </Link>

        <div className="mt-6 flex flex-wrap gap-6 text-sm tracking-widest md:mt-0">
          <Link
            href="/actualite"
            className="transition-colors hover:text-yellow-500"
          >
            ACTUALITÉ
          </Link>

          <Link
            href="/fil-info"
            className="transition-colors hover:text-yellow-500"
          >
            FIL INFO
          </Link>

          <Link
            href="/economie"
            className="transition-colors hover:text-yellow-500"
          >
            ÉCONOMIE
          </Link>

          <Link
            href="/societe"
            className="transition-colors hover:text-yellow-500"
          >
            SOCIÉTÉ
          </Link>

          <Link
            href="/culture"
            className="transition-colors hover:text-yellow-500"
          >
            CULTURE
          </Link>

          <Link
            href="/sports"
            className="transition-colors hover:text-yellow-500"
          >
            SPORTS
          </Link>

          <Link
            href="/montagne"
            className="transition-colors hover:text-yellow-500"
          >
            MONTAGNE
          </Link>
        </div>
      </div>
    </nav>
  );
}