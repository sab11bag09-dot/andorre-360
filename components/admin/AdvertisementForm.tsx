"use client";

import { useState } from "react";

import MediaPicker from "@/components/admin/MediaPicker";
import { createAdvertisementAction } from "@/actions/advertisements";

export default function AdvertisementForm() {
  const [imagePath, setImagePath] = useState("");

  return (
    <form
      action={createAdvertisementAction}
      className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-white">
          Nouvelle publicité
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Publicité limitée à la page Actualité.
        </p>
      </div>

      <input
        type="hidden"
        name="imagePath"
        value={imagePath}
      />

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-zinc-200">
          Image publicitaire
        </label>

        <MediaPicker
          value={imagePath}
          onChange={setImagePath}
          type="image"
        />

        {imagePath && (
          <p className="text-xs text-emerald-400">
            Image sélectionnée.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="targetUrl"
          className="block text-sm font-semibold text-zinc-200"
        >
          Lien de destination
        </label>

        <input
          id="targetUrl"
          name="targetUrl"
          type="url"
          required
          placeholder="https://www.exemple.com"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="format"
          className="block text-sm font-semibold text-zinc-200"
        >
          Format
        </label>

        <select
          id="format"
          name="format"
          defaultValue="FOUR_COLUMNS"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
        >
          <option value="FOUR_COLUMNS">
            Publicité 4 colonnes
          </option>
          <option value="TWO_COLUMNS_WITH_CARD">
            Publicité 2 colonnes + une carte
          </option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="startsAt"
            className="block text-sm font-semibold text-zinc-200"
          >
            Date de début
          </label>

          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="endsAt"
            className="block text-sm font-semibold text-zinc-200"
          >
            Date de fin
          </label>

          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
      >
        Enregistrer la publicité
      </button>
    </form>
  );
}