"use client";

type ImageBlockValue = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
};

type Props = ImageBlockValue & {
  onChange: (value: ImageBlockValue) => void;
};

export default function ImageBlockEditor({
  src,
  alt,
  caption,
  credit,
  onChange,
}: Props) {
  function updateField<K extends keyof ImageBlockValue>(
    field: K,
    value: ImageBlockValue[K]
  ) {
    onChange({
      src,
      alt,
      caption,
      credit,
      [field]: value,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="image-src"
          className="mb-2 block text-sm font-semibold text-zinc-200"
        >
          Adresse de l’image
        </label>

        <input
          id="image-src"
          type="text"
          value={src}
          onChange={(event) =>
            updateField("src", event.target.value)
          }
          placeholder="/uploads/mon-image.jpg ou https://…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
        />
      </div>

      {src.trim() && (
        <div
          className="aspect-video w-full rounded-xl border border-zinc-800 bg-zinc-950 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${src.replace(
              /["\\]/g,
              "\\$&"
            )}")`,
          }}
          role="img"
          aria-label={
            alt.trim() || "Aperçu de l’image"
          }
        />
      )}

      <div>
        <label
          htmlFor="image-alt"
          className="mb-2 block text-sm font-semibold text-zinc-200"
        >
          Texte alternatif
        </label>

        <input
          id="image-alt"
          type="text"
          value={alt}
          onChange={(event) =>
            updateField("alt", event.target.value)
          }
          placeholder="Décrivez l’image pour l’accessibilité"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Décrivez brièvement ce que montre l’image.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="image-caption"
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            Légende
          </label>

          <input
            id="image-caption"
            type="text"
            value={caption}
            onChange={(event) =>
              updateField(
                "caption",
                event.target.value
              )
            }
            placeholder="Légende facultative"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>

        <div>
          <label
            htmlFor="image-credit"
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            Crédit photo
          </label>

          <input
            id="image-credit"
            type="text"
            value={credit}
            onChange={(event) =>
              updateField(
                "credit",
                event.target.value
              )
            }
            placeholder="Photographe ou source"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}