"use client";

import {
  Input,
  SectionHeader,
  Select,
} from "@/components/admin/ui";

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
  const selectedZone = EDITORIAL_ZONES.find(
    (editorialZone) => editorialZone.value === zone
  );

  return (
    <section className="space-y-6 rounded-2xl border-2 border-yellow-500 bg-zinc-900 p-6 shadow-sm">
      <SectionHeader
        eyebrow="Mission éditoriale"
        title="Mise en avant"
        description="Choisissez la page, la place et la durée de diffusion."
      />

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Page concernée
        </label>

        <Select
          value={pageKey}
          onChange={(event) =>
            setPageKey(event.target.value)
          }
          className="mt-0"
        >
          {EDITORIAL_PAGES.map((page) => (
            <option
              key={page.value}
              value={page.value}
            >
              {page.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Mise en avant
        </label>

        <Select
          value={zone}
          onChange={(event) =>
            setZone(event.target.value)
          }
          className="mt-0"
        >
          {EDITORIAL_ZONES.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </Select>

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

        <Select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value)
          }
          className="mt-0"
        >
          <option value="0">Normale</option>
          <option value="10">Importante</option>
          <option value="20">Prioritaire</option>
          <option value="30">Urgente</option>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Canal principal
        </label>

        <Select
          value={channel}
          onChange={(event) =>
            setChannel(event.target.value)
          }
          className="mt-0"
        >
          {CHANNELS.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Début de diffusion
        </label>

        <Input
          type="datetime-local"
          value={startsAt}
          onChange={(event) =>
            setStartsAt(event.target.value)
          }
          className="mt-0"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">
          Fin de mise en avant
        </label>

        <Input
          type="datetime-local"
          value={endsAt}
          onChange={(event) =>
            setEndsAt(event.target.value)
          }
          className="mt-0"
        />
      </div>

      <p className="border-t border-zinc-800 pt-5 text-xs leading-relaxed text-zinc-500">
        Après la fin de la mise en avant, le contenu reste publié dans sa
        rubrique.
      </p>
    </section>
  );
}