"use client";

import { useMemo, useState } from "react";

import { createArticle } from "@/actions/articles";
import MediaPicker from "@/components/admin/MediaPicker";

const CONTENT_TYPES = [
  { value: "article", label: "Article" },
  { value: "editorial", label: "Éditorial" },
  { value: "video", label: "Vidéo" },
  { value: "interview", label: "Interview" },
  { value: "podcast", label: "Podcast" },
  { value: "gallery", label: "Galerie" },
] as const;

const CATEGORIES = [
  { value: "ACTUALITÉ", label: "Actualité" },
  { value: "ÉCONOMIE", label: "Économie" },
  { value: "SOCIÉTÉ", label: "Société" },
  { value: "CULTURE", label: "Culture" },
  { value: "SPORTS", label: "Sports" },
  { value: "MONTAGNE", label: "Montagne" },
  { value: "POLITIQUE", label: "Politique" },
  { value: "IMMOBILIER", label: "Immobilier" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "INTERNATIONAL", label: "International" },
  { value: "ÉDITORIAL", label: "Éditorial" },
] as const;

const EDITORIAL_PAGES = [
  { value: "home", label: "Page d’accueil" },
  { value: "category:ACTUALITÉ", label: "Rubrique Actualité" },
  { value: "category:ÉCONOMIE", label: "Rubrique Économie" },
  { value: "category:SOCIÉTÉ", label: "Rubrique Société" },
  { value: "category:CULTURE", label: "Rubrique Culture" },
  { value: "category:SPORTS", label: "Rubrique Sports" },
  { value: "category:MONTAGNE", label: "Rubrique Montagne" },
  { value: "category:ÉDITORIAL", label: "Rubrique Éditorial" },
    { value: "category:POLITIQUE", label: "Rubrique Politique" },
  { value: "category:IMMOBILIER", label: "Rubrique Immobilier" },
  { value: "category:LIFESTYLE", label: "Rubrique Lifestyle" },
  { value: "category:INTERNATIONAL", label: "Rubrique International" },
] as const;

const CHANNELS = [
  { value: "site", label: "Site ANDORRE 360" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "newsletter", label: "Newsletter" },
] as const;

const EDITORIAL_ZONES = [
  {
    value: "hero",
    label: "Une principale",
    description: "Le sujet dominant de la page.",
  },
  {
    value: "feature",
    label: "Grande Carte",
    description: "Le grand papier placé sous la Une.",
  },
  {
    value: "brief",
    label: "Brève",
    description: "Une information courte dans L’Essentiel.",
  },
  {
    value: "grand-format",
    label: "Grand Format",
    description: "Un récit long avec une forte présence visuelle.",
  },
  {
    value: "editorial",
    label: "Édito",
    description: "La voix de la rédaction.",
  },
  {
    value: "card",
    label: "Sélection",
    description: "Un article retenu par la rédaction.",
  },
  {
    value: "discover",
    label: "À découvrir",
    description: "Une recommandation pour poursuivre la lecture.",
  },
  {
    value: "standard",
    label: "Article standard",
    description: "Une publication normale dans sa rubrique.",
  },
] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ArticleForm() {
  const [contentType, setContentType] = useState("article");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ACTUALITÉ");
  const [author, setAuthor] = useState("Salah");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const [image, setImage] = useState("/images/global/hero.jpg");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [socialText, setSocialText] = useState("");

  const [pageKey, setPageKey] = useState("home");
  const [channel, setChannel] = useState("site");
  const [zone, setZone] = useState("standard");
  const [priority, setPriority] = useState("0");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [featured, setFeatured] = useState(false);

  const slug = useMemo(() => slugify(title), [title]);

  const wordCount = useMemo(() => {
    const cleanContent = content.trim();

    if (!cleanContent) {
      return 0;
    }

    return cleanContent.split(/\s+/).length;
  }, [content]);

  const readingTime = useMemo(
    () => Math.max(1, Math.ceil(wordCount / 220)),
    [wordCount]
  );

  const selectedZone = EDITORIAL_ZONES.find(
    (editorialZone) => editorialZone.value === zone
  );

  const inputClassName =
    "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10";

  const sectionClassName =
    "rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm";

  return (
    <form
      action={createArticle}
      className="mx-auto max-w-7xl text-zinc-100"
    >
      <header className="mb-10 border-b border-zinc-800 pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
              ANDORRE 360 Studio
            </p>

            <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
              Créer une publication
            </h1>

            <p className="mt-3 max-w-2xl leading-relaxed text-zinc-400">
              Rédigez le contenu, choisissez sa rubrique et définissez sa
              mission éditoriale.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-3 font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Enregistrer en brouillon
            </button>

            <button
              type="submit"
              className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Diffuser
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className={sectionClassName}>
            <div className="border-b border-zinc-800 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                Format
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Type de publication
              </h2>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CONTENT_TYPES.map((type) => {
                const isSelected = contentType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setContentType(type.value)}
                    className={`rounded-xl border px-4 py-4 text-left font-semibold transition ${
                      isSelected
                        ? "border-yellow-500 bg-yellow-500 text-black"
                        : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={`${sectionClassName} space-y-7`}>
            <div className="border-b border-zinc-800 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                Contenu
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Informations principales
              </h2>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="title" className="font-semibold text-zinc-200">
                  Titre
                </label>

                <span
                  className={`text-xs ${
                    title.length > 100 ? "text-red-400" : "text-zinc-500"
                  }`}
                >
                  {title.length} caractères
                </span>
              </div>

              <input
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={`${inputClassName} py-4 text-lg`}
                placeholder="Titre de la publication"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block font-semibold text-zinc-200"
                >
                  Rubrique
                </label>

                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={inputClassName}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="mb-2 block font-semibold text-zinc-200"
                >
                  Auteur
                </label>

                <input
                  id="author"
                  name="author"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className={inputClassName}
                  placeholder="Nom de l’auteur"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="description"
                  className="font-semibold text-zinc-200"
                >
                  Chapô
                </label>

                <span
                  className={`text-xs ${
                    description.length > 320
                      ? "text-red-400"
                      : "text-zinc-500"
                  }`}
                >
                  {description.length} caractères
                </span>
              </div>

              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className={inputClassName}
                placeholder="Présentez le sujet en quelques phrases claires."
                required
              />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <label
                  htmlFor="content"
                  className="font-semibold text-zinc-200"
                >
                  Article
                </label>

                <div className="flex gap-4 text-xs text-zinc-500">
                  <span>{wordCount} mots</span>
                  <span>{readingTime} min de lecture</span>
                </div>
              </div>

              <textarea
                id="content"
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={22}
                className={`${inputClassName} leading-relaxed`}
                placeholder="Rédigez ici le contenu complet…"
                required
              />
            </div>
          </section>

          <section className={`${sectionClassName} space-y-7`}>
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
              <div className="grid gap-5 border-t border-zinc-800 pt-6 md:grid-cols-2">
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

          <section className={`${sectionClassName} space-y-5`}>
            <div className="border-b border-zinc-800 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                Réseaux sociaux
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Texte de diffusion
              </h2>
            </div>

            <textarea
              id="socialText"
              name="socialText"
              value={socialText}
              onChange={(event) => setSocialText(event.target.value)}
              rows={7}
              className={`${inputClassName} leading-relaxed`}
              placeholder="Préparez une version courte pour les réseaux sociaux…"
            />
          </section>
        </div>

        <aside className="space-y-7">
          <section className="rounded-2xl border-2 border-yellow-500 bg-zinc-900 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Mission éditoriale
            </p>

            <h2 className="mt-2 font-serif text-2xl text-white">
              Mise en avant
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Choisissez la page, la place et la durée de diffusion.
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <label
                  htmlFor="pageKey"
                  className="mb-2 block text-sm font-semibold text-zinc-200"
                >
                  Page concernée
                </label>

                <select
                  id="pageKey"
                  name="pageKey"
                  value={pageKey}
                  onChange={(event) => setPageKey(event.target.value)}
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
                <label
                  htmlFor="zone"
                  className="mb-2 block text-sm font-semibold text-zinc-200"
                >
                  Mise en avant
                </label>

                <select
                  id="zone"
                  name="zone"
                  value={zone}
                  onChange={(event) => setZone(event.target.value)}
                  className={inputClassName}
                >
                  {EDITORIAL_ZONES.map((editorialZone) => (
                    <option
                      key={editorialZone.value}
                      value={editorialZone.value}
                    >
                      {editorialZone.label}
                    </option>
                  ))}
                </select>

                {selectedZone && (
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    {selectedZone.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-semibold text-zinc-200"
                >
                  Priorité
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className={inputClassName}
                >
                  <option value="0">Normale</option>
                  <option value="10">Importante</option>
                  <option value="20">Prioritaire</option>
                  <option value="30">Urgente</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="channel"
                  className="mb-2 block text-sm font-semibold text-zinc-200"
                >
                  Canal principal
                </label>

                <select
                  id="channel"
                  name="channel"
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
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
                <label
                  htmlFor="startsAt"
                  className="mb-2 block text-sm font-semibold text-zinc-200"
                >
                  Début de diffusion
                </label>

                <input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="endsAt"
                  className="mb-2 block text-sm font-semibold text-zinc-200"
                >
                  Fin de mise en avant
                </label>

                <input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <p className="mt-6 border-t border-zinc-800 pt-5 text-xs leading-relaxed text-zinc-500">
              Après la fin de la mise en avant, le contenu reste publié dans
              sa rubrique.
            </p>
          </section>

          <section className={sectionClassName}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Informations
            </p>

            <h2 className="mt-2 font-serif text-xl text-white">
              Aperçu technique
            </h2>

            <dl className="mt-6 divide-y divide-zinc-800">
              <div className="flex justify-between gap-4 py-4 first:pt-0">
                <dt className="text-sm text-zinc-500">Type</dt>
                <dd className="text-right text-sm font-semibold capitalize text-white">
                  {contentType}
                </dd>
              </div>

              <div className="py-4">
                <dt className="text-sm text-zinc-500">Slug</dt>
                <dd className="mt-2 break-words text-sm font-semibold text-white">
                  {slug || "—"}
                </dd>
              </div>

              <div className="flex justify-between gap-4 py-4">
                <dt className="text-sm text-zinc-500">Nombre de mots</dt>
                <dd className="text-sm font-semibold text-white">
                  {wordCount}
                </dd>
              </div>

              <div className="flex justify-between gap-4 py-4">
                <dt className="text-sm text-zinc-500">Temps de lecture</dt>
                <dd className="text-sm font-semibold text-white">
                  {readingTime} min
                </dd>
              </div>

              <div className="flex justify-between gap-4 py-4">
                <dt className="text-sm text-zinc-500">Page</dt>
                <dd className="max-w-[65%] text-right text-sm font-semibold text-white">
                  {pageKey}
                </dd>
              </div>

              <div className="flex justify-between gap-4 py-4 last:pb-0">
                <dt className="text-sm text-zinc-500">Mise en avant</dt>
                <dd className="max-w-[65%] text-right text-sm font-semibold text-white">
                  {selectedZone?.label ?? zone}
                </dd>
              </div>
            </dl>
          </section>

          <section className={sectionClassName}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Compatibilité
            </p>

            <label className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                className="mt-1 h-4 w-4 accent-yellow-500"
              />

              <span>
                <span className="block font-semibold text-white">
                  Contenu vedette
                </span>

                <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
                  Réglage temporaire conservé pour les anciennes parties du
                  projet.
                </span>
              </span>
            </label>
          </section>
        </aside>
      </div>

      <input type="hidden" name="contentType" value={contentType} />
      <input type="hidden" name="slug" value={slug} />
      <input
        type="hidden"
        name="readingTime"
        value={`${readingTime} min`}
      />

      <div className="mt-10 flex flex-col items-stretch justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center">
        <p className="text-sm text-zinc-500">
          Vérifiez le contenu et sa mission éditoriale avant diffusion.
        </p>

        <button
          type="submit"
          className="rounded-lg bg-yellow-500 px-8 py-4 font-semibold text-black transition hover:bg-yellow-400"
        >
          Diffuser la publication
        </button>
      </div>
    </form>
  );
}