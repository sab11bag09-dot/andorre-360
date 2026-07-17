import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black px-8 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-2xl">
            ANDORRE 360
          </p>

          <p className="mt-2 max-w-md text-sm text-gray-400">
            Actualités, économie, société, culture et montagne en Andorre.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-300">
          <Link href="/">Accueil</Link>
          <Link href="/actualite">Actualité</Link>
          <Link href="/economie">Économie</Link>
          <Link href="/societe">Société</Link>
          <Link href="/culture">Culture</Link>
          <Link href="/montagne">Montagne</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-gray-900 pt-5">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <Link href="/equipe">L'équipe</Link>
          <Link href="/publicite">Publicité</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </nav>

        <p className="mt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} ANDORRE 360 — Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}