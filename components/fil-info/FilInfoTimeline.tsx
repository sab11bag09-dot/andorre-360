import Link from "next/link";

export type FilInfoTimelineEntry = {
  id: number;
  slug: string;
  title: string;
  publicationDate: Date;
};

function formatHour(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(value);
}

export default function FilInfoTimeline({
  entries,
}: {
  entries: readonly FilInfoTimelineEntry[];
}) {
  return (
    <section
      aria-labelledby="fil-info-timeline-title"
      className="overflow-hidden border border-gray-800 bg-neutral-950/90"
    >
      <header className="border-b border-gray-800">
        <div className="bg-yellow-500 px-5 py-3 text-black sm:px-7">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Dernières publications
          </p>
        </div>

        <div className="flex items-end justify-between gap-6 px-5 py-6 sm:px-7 sm:py-8">
          <div>
            <h2
              id="fil-info-timeline-title"
              className="font-serif text-4xl leading-none sm:text-5xl"
            >
              Fil Info
            </h2>

            {entries[0] && (
              <time
                dateTime={entries[0].publicationDate.toISOString()}
                className="mt-4 block text-xs capitalize text-gray-500"
              >
                {formatDate(entries[0].publicationDate)}
              </time>
            )}
          </div>

          <div aria-hidden="true" className="h-12 w-1 bg-yellow-500" />
        </div>
      </header>

      {entries.length > 0 ? (
        <ol className="divide-y divide-gray-800">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <Link
                href={`/article/${entry.slug}`}
                className="group grid grid-cols-[64px_1fr] gap-4 px-5 py-5 transition-colors duration-300 hover:bg-white/[0.04] sm:grid-cols-[76px_1fr] sm:px-7 sm:py-6"
              >
                <time
                  dateTime={entry.publicationDate.toISOString()}
                  className="pt-0.5 text-base font-black tabular-nums tracking-[-0.02em] text-yellow-500"
                >
                  {formatHour(entry.publicationDate)}
                </time>

                <div className="relative border-l border-gray-700/90 pl-5 sm:pl-6">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-neutral-950 bg-yellow-500 ring-1 ring-yellow-500/40"
                  />

                  <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-gray-600">
                    Information {String(index + 1).padStart(2, "0")}
                  </p>

                  <h3 className="mt-2 font-serif text-lg leading-[1.3] transition-colors duration-300 group-hover:text-yellow-500 sm:text-xl">
                    {entry.title}
                  </h3>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-5 py-8 text-sm leading-7 text-gray-500 sm:px-7">
          Le fil se remplira avec les prochaines publications de la rubrique
          Actualité.
        </p>
      )}
    </section>
  );
}
