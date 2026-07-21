"use client";

import MediaPicker from "@/components/admin/MediaPicker";

type Props = {
  image: string;
  setImage: (value: string) => void;

  contentType: string;

  videoUrl: string;
  setVideoUrl: (value: string) => void;

  videoDuration: string;
  setVideoDuration: (value: string) => void;
};

export default function ArticleMedia({
  image,
  setImage,
  contentType,
  videoUrl,
  setVideoUrl,
  videoDuration,
  setVideoDuration,
}: Props) {
  const inputClassName =
    "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10";

  return (
    <section className="space-y-7 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="border-b border-zinc-800 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
          Médias
        </p>

        <h2 className="mt-2 font-serif text-2xl text-white">
          Image et vidéo
        </h2>
      </div>

      <div>
        <label
          htmlFor="image"
          className="mb-2 block font-semibold text-zinc-200"
        >
          Image de couverture
        </label>

        <input
          id="image"
          name="image"
          type="hidden"
          value={image}
        />

        <MediaPicker
          value={image}
          onChange={setImage}
        />

        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          {image ? (
            <img
              src={image}
              alt="Aperçu de la couverture"
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-zinc-600">
              Aucune image sélectionnée
            </div>
          )}
        </div>
      </div>

      {contentType === "video" && (
        <div className="grid gap-5 border-t border-zinc-800 pt-6">
          <div>
            <label
              htmlFor="videoUrl"
              className="mb-2 block font-semibold text-zinc-200"
            >
              URL de la vidéo
            </label>

            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              className={inputClassName}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label
              htmlFor="videoDuration"
              className="mb-2 block font-semibold text-zinc-200"
            >
              Durée
            </label>

            <input
              id="videoDuration"
              name="videoDuration"
              value={videoDuration}
              onChange={(event) => setVideoDuration(event.target.value)}
              className={inputClassName}
              placeholder="Exemple : 3 min 45"
            />
          </div>
        </div>
      )}
    </section>
  );
}