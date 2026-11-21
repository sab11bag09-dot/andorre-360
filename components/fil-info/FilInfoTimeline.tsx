import Link from "next/link";

import {
  getFilInfoFormatLabel,
  normalizeFilInfoFormat,
  type FilInfoFormat,
} from "@/lib/fil-info-format";
import { getFilInfoArticlePath, type PublicFilInfoLocale } from "@/lib/fil-info-locale";

export type FilInfoTimelineEntry = {
  id: number;
  slug: string;
  title: string;
  description: string;
  filInfoFormat: FilInfoFormat;
  publicationDate: Date;
};

const localeNames = { fr: "fr-FR", ca: "ca-ES", es: "es-ES" } as const;
const copy = {
  fr: { latest: "Dernières publications", title: "Fil Info", empty: "Le fil se remplira avec les prochaines publications de la rubrique Actualité." },
  ca: { latest: "Últimes publicacions", title: "Fil informatiu", empty: "El fil s’omplirà amb les pròximes publicacions d’Actualitat." },
  es: { latest: "Últimas publicaciones", title: "Hilo informativo", empty: "El hilo se completará con las próximas publicaciones de Actualidad." },
} as const;

function formatHour(value: Date, locale: PublicFilInfoLocale) {
  return new Intl.DateTimeFormat(localeNames[locale], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Andorra",
  }).format(value);
}

/** Jour court affiché dans chaque ligne, au-dessus de l’heure : « 21 nov. ». */
export function formatFilInfoDay(value: Date, locale: PublicFilInfoLocale) {
  return new Intl.DateTimeFormat(localeNames[locale], {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Andorra",
  }).format(value);
}

/**
 * Sur grand écran, le fil garde ce nombre de lignes de même hauteur : une
 * publication manquante laisse sa ligne vide et le bloc ne change pas de
 * taille (voir la page Fil info).
 */
const FIXED_ROWS = { 8: "xl:grid xl:min-h-0 xl:flex-1 xl:grid-rows-8" } as const;

export default function FilInfoTimeline({
  entries,
  locale = "fr",
  fixedRows,
}: {
  entries: readonly FilInfoTimelineEntry[];
  locale?: PublicFilInfoLocale;
  fixedRows?: keyof typeof FIXED_ROWS;
}) {
  return (
    <section
      aria-labelledby="fil-info-timeline-title"
      {...(fixedRows ? { "data-layout-column": "fil", "data-layout-block": "fil" } : {})}
      className={`overflow-hidden border border-gray-800 bg-neutral-950/90 ${
        fixedRows ? "xl:flex xl:h-full xl:flex-col" : ""
      }`}
    >
      <header className="border-b border-gray-800">
        <div className="bg-yellow-500 px-5 py-3 text-black sm:px-7">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            {copy[locale].latest}
          </p>
        </div>

        <div className="flex items-end justify-between gap-6 px-5 py-6 sm:px-7 sm:py-8">
          <div>
            <h2
              id="fil-info-timeline-title"
              className="font-serif text-4xl leading-none sm:text-5xl"
            >
              {copy[locale].title}
            </h2>
          </div>

          <div aria-hidden="true" className="h-12 w-1 bg-yellow-500" />
        </div>
      </header>

      {entries.length > 0 ? (
        <ol
          className={`divide-y divide-gray-800 ${fixedRows ? FIXED_ROWS[fixedRows] : ""}`}
          aria-label="Publications chronologiques"
        >
          {entries.map((entry, index) => {
            const format = normalizeFilInfoFormat(entry.filInfoFormat);
            const isAlert = format === "ALERT";

            // La date figure dans chaque ligne : plus d’intertitre de jour, dont le
            // nombre variait avec la répartition des dates et changeait la hauteur
            // du fil.
            return (
              <li key={entry.id} className="xl:min-h-0">
                <Link
                  href={getFilInfoArticlePath(locale, entry.slug)}
                  className={`group grid h-full grid-cols-[64px_1fr] gap-4 overflow-hidden px-5 py-5 transition-colors duration-300 motion-reduce:transition-none sm:grid-cols-[76px_1fr] sm:px-7 sm:py-6 ${
                    isAlert
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <time
                    dateTime={entry.publicationDate.toISOString()}
                    className={`flex flex-col pt-0.5 ${isAlert ? "text-black" : "text-yellow-500"}`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                        isAlert ? "text-black/70" : "text-gray-500"
                      }`}
                    >
                      {formatFilInfoDay(entry.publicationDate, locale)}
                    </span>
                    <span className="mt-0.5 text-base font-black tabular-nums tracking-[-0.02em]">
                      {formatHour(entry.publicationDate, locale)}
                    </span>
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
                      {getFilInfoFormatLabel(format, locale)} · {String(index + 1).padStart(2, "0")}
                    </p>

                    {/* Une alerte, en plus gros caractères, tient sur deux lignes. */}
                    <h4
                      className={`mt-2 font-serif leading-[1.3] transition-colors duration-300 ${
                        isAlert
                          ? "line-clamp-2 min-h-[2lh] text-xl font-semibold text-black sm:text-2xl"
                          : "line-clamp-3 min-h-[3lh] text-lg group-hover:text-yellow-500 sm:text-xl"
                      }`}
                    >
                      {entry.title}
                    </h4>

                    {/*
                      Chaque publication montre son chapô sur deux lignes, quel que
                      soit son format : toutes les lignes du fil ont la même
                      structure et donc la même hauteur.
                    */}
                    <p
                      aria-hidden={entry.description ? undefined : true}
                      className={`mt-3 line-clamp-2 min-h-[2lh] text-sm leading-6 ${
                        isAlert ? "text-black/75" : "text-gray-400"
                      }`}
                    >
                      {entry.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="px-5 py-8 text-sm leading-7 text-gray-500 sm:px-7">
          {copy[locale].empty}
        </p>
      )}
    </section>
  );
}
