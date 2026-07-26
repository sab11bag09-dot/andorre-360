"use client";

import MediaPicker from "@/components/admin/MediaPicker";
import {
  Input,
  SectionHeader,
} from "@/components/admin/ui";

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
  return (
    <section className="space-y-7 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <SectionHeader
        eyebrow="Médias"
        title="Image et vidéo"
      />

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
  type="image"
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

            <>
  <MediaPicker
    value={videoUrl}
    onChange={setVideoUrl}
    type="video"
  />

  <Input
    id="videoUrl"
    name="videoUrl"
    type="url"
    value={videoUrl}
    onChange={(event) =>
      setVideoUrl(event.target.value)
    }
    className="mt-4"
    placeholder="...ou collez directement une URL"
  />
</>
          </div>

          <div>
            <label
              htmlFor="videoDuration"
              className="mb-2 block font-semibold text-zinc-200"
            >
              Durée
            </label>

            <Input
              id="videoDuration"
              name="videoDuration"
              value={videoDuration}
              onChange={(event) =>
                setVideoDuration(event.target.value)
              }
              className="mt-0"
              placeholder="Exemple : 3 min 45"
            />
          </div>
        </div>
      )}
    </section>
  );
}