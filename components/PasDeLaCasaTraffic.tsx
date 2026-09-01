const TRAFFIC_LINKS = [
  {
    title: "Routes d’Andorre",
    description:
      "CG-2, port d’Envalira, frontière, incidents et circulation en temps réel.",
    href: "https://www.mobilitat.ad/",
    source: "Mobilitat Andorra",
  },
  {
    title: "Accès depuis la France",
    description:
      "RN20, RN320 et RN22 : travaux, fermetures et conditions hivernales.",
    href: "https://www.bison-fute.gouv.fr/rn-20.html",
    source: "Bison Futé",
  },
  {
    title: "Webcams routières",
    description:
      "Vérifier visuellement les conditions avant de prendre la route.",
    href: "https://www.mobilitat.ad/totes-les-cameres",
    source: "Mobilitat Andorra",
  },
] as const;

export default function PasDeLaCasaTraffic() {
  return (
    <section
      aria-labelledby="pas-de-la-casa-traffic-title"
      className="border-y border-gray-800 bg-zinc-950"
    >
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
            Accès au Pas-de-la-Case
          </p>

          <h2
            id="pas-de-la-casa-traffic-title"
            className="mt-2 font-serif text-3xl"
          >
            Trafic et état des routes
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
            Consultez les conditions officielles avant de rejoindre le
            Pas-de-la-Case ou de poursuivre votre trajet vers la France.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TRAFFIC_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-44 flex-col rounded-xl border border-gray-800 p-5 transition hover:border-yellow-500 hover:bg-zinc-900"
            >
              <h3 className="font-serif text-xl">{item.title}</h3>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                {item.description}
              </p>

              <p className="mt-auto pt-5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                Consulter en direct →
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Source officielle : {item.source}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
