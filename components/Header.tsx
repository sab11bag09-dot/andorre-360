import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">


        {/* LOGO */}

        <Link href="/" className="shrink-0">

          <h1 className="text-2xl font-serif tracking-[0.25em] text-white">
            ANDORRE{" "}
            <span className="text-yellow-500">
              360
            </span>
          </h1>

        </Link>



        {/* MENU */}

        <nav className="flex items-center gap-8 text-sm tracking-widest">


          <Link
            href="/actualite"
            className="text-gray-300 hover:text-yellow-500 transition-colors"
          >
            ACTUALITÉ
          </Link>


          <Link
            href="/economie"
            className="text-gray-300 hover:text-yellow-500 transition-colors"
          >
            ÉCONOMIE
          </Link>


          <Link
            href="/societe"
            className="text-gray-300 hover:text-yellow-500 transition-colors"
          >
            SOCIÉTÉ
          </Link>


          <Link
            href="/culture"
            className="text-gray-300 hover:text-yellow-500 transition-colors"
          >
            CULTURE
          </Link>


          <Link
            href="/montagne"
            className="text-gray-300 hover:text-yellow-500 transition-colors"
          >
            MONTAGNE
          </Link>


        </nav>


      </div>


    </header>
  );
}