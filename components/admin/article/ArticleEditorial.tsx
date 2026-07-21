"use client";

import {
  CHANNELS,
  EDITORIAL_PAGES,
  EDITORIAL_ZONES,
} from "./types";

type Props = {
  pageKey: string;
  setPageKey: (value: string) => void;

  zone: string;
  setZone: (value: string) => void;

  priority: string;
  setPriority: (value: string) => void;

  channel: string;
  setChannel: (value: string) => void;

  startsAt: string;
  setStartsAt: (value: string) => void;

  endsAt: string;
  setEndsAt: (value: string) => void;
};

export default function ArticleEditorial({
  pageKey,
  setPageKey,
  zone,
  setZone,
  priority,
  setPriority,
  channel,
  setChannel,
  startsAt,
  setStartsAt,
  endsAt,
  setEndsAt,
}: Props) {
  const inputClassName =
    "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10";

  const selectedZone = EDITORIAL_ZONES.find(
    (editorialZone) => editorialZone.value === zone
  );

  return (
    <section className="space-y-6 rounded-2xl border-2 border-yellow-500 bg-zinc-900 p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
          Mission éditoriale
        </p>

        <h2 className="mt-2 font-serif text-2xl text-white">
          Mise en avant
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Choisissez la page, la place et la durée de diffusion.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Page concernée
        </label>

        <select
          value={pageKey}
          onChange={(e) => setPageKey(e.target.value)}
          className={inputClassName}
        >
          {EDITORIAL_PAGES.map((page) => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Mise en avant
        </label>

        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className={inputClassName}
        >
          {EDITORIAL_ZONES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        {selectedZone && (
          <p className="mt-2 text-xs text-zinc-500">
            {selectedZone.description}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Priorité
        </label>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={inputClassName}
        >
          <option value="0">Normale</option>
          <option value="10">Importante</option>
          <option value="20">Prioritaire</option>
          <option value="30">Urgente</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Canal principal
        </label>

        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className={inputClassName}
        >
          {CHANNELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Début de diffusion
        </label>

        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Fin de mise en avant
        </label>

        <input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className={inputClassName}
        />
      </div>

      <p className="border-t border-zinc-800 pt-5 text-xs leading-relaxed text-zinc-500">
        Après la fin de la mise en avant, le contenu reste publié dans sa
        rubrique.
      </p>
    </section>
  );
}