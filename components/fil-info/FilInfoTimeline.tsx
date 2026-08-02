import Link from "next/link";

import {
  getFilInfoFormatLabel,
  normalizeFilInfoFormat,
  type FilInfoFormat,
} from "@/lib/fil-info-format";

export type FilInfoTimelineEntry = {
  id: number;
  slug: string;
  title: string;
  description: string;
  filInfoFormat: FilInfoFormat;
  publicationDate: Date;
};

function formatHour(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Andorra",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Andorra",
  }).format(value);
}

function getDateKey(value: Date) {
  return new Intl.DateTimeFormat("fr-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Andorra",
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
          </div>

          <div aria-hidden="true" className="h-12 w-1 bg-yellow-500" />
        </div>
      </header>

      {entries.length > 0 ? (
        <ol className="divide-y divide-gray-800" aria-label="Publications chronologiques">
          {entries.map((entry, index) => {
            const format = normalizeFilInfoFormat(entry.filInfoFormat);
            const isAlert = format === "ALERT";
            const isBrief = format === "BRIEF";
            const previousEntry = entries[index - 1];
            const startsNewDay =
              !previousEntry ||
              getDateKey(previousEntry.publicationDate) !==
                getDateKey(entry.publicationDate);

            return (
              <li key={entry.id}>
                {startsNewDay && (
                  <h3 className="border-b border-gray-800 bg-black/70 px-5 py-3 text-[10px] font-bold capitalize tracking-[0.18em] text-gray-500 sm:px-7">
                    {formatDate(entry.publicationDate)}
                  </h3>
                )}
                <Link
                  href={`/article/${entry.slug}`}
                  className={`group grid grid-cols-[64px_1fr] gap-4 px-5 py-5 transition-colors duration-300 motion-reduce:transition-none sm:grid-cols-[76px_1fr] sm:px-7 sm:py-6 ${
                    isAlert
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <time
                    dateTime={entry.publicationDate.toISOString()}
                    className={`pt-0.5 text-base font-black tabular-nums tracking-[-0.02em] ${
                      isAlert ? "text-black" : "text-yellow-500"
                    }`}
                  >
                    {formatHour(entry.publicationDate)}
                  </time>

                  <div
                    className={`relative border-l pl-5 sm:pl-6 ${
                      isAlert ? "border-black/40" : "border-gray-700/90"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
                        isAlert
                          ? "border-yellow-500 bg-black"
                          : "border-neutral-950 bg-yellow-500 ring-1 ring-yellow-500/40"
                      }`}
                    />

                    <p
                      className={`text-[8px] font-bold uppercase tracking-[0.22em] ${
                        isAlert ? "text-black/65" : "text-gray-600"
                      }`}
                    >
                      {getFilInfoFormatLabel(format)} · {String(index + 1).padStart(2, "0")}
                    </p>

                    <h4
                      className={`mt-2 font-serif leading-[1.3] transition-colors duration-300 ${
                        isAlert
                          ? "text-xl font-semibold text-black sm:text-2xl"
                          : "text-lg group-hover:text-yellow-500 sm:text-xl"
                      }`}
                    >
                      {entry.title}
                    </h4>

                    {isBrief && entry.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-400">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
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
