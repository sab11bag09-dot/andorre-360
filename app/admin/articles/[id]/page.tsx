import Link from "next/link";
import { notFound } from "next/navigation";

import { updateArticle } from "@/actions/articles";
import { prisma } from "@/lib/prisma";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);

  if (!Number.isInteger(articleId)) {
    notFound();
  }

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    notFound();
  }

  const updateCurrentArticle = updateArticle.bind(
    null,
    article.id
  );

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 text-gray-900">
      <form
        action={updateCurrentArticle}
        className="mx-auto max-w-7xl"
      >
        {/* EN-TÊTE */}

        <div className="flex flex-col gap-6 border-b border-gray-300 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-yellow-700 hover:text-yellow-600"
            >
              ← Retour au tableau de bord
            </Link>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-600">
              ANDORRE 360 Studio
            </p>

            <h1 className="mt-2 font-serif text-4xl md:text-5xl">
              Modifier le contenu
            </h1>

            <p className="mt-3 text-gray-600">
              Modifiez les informations puis enregistrez.
            </p>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-yellow-600"
          >
            Enregistrer les modifications
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* COLONNE PRINCIPALE */}

          <div className="space-y-6 lg:col-span-2">
            <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block font-semibold text-gray-700"
                >
                  Titre
                </label>

                <input
                  id="title"
                  name="title"
                  defaultValue={article.title}
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 text-lg outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block font-semibold text-gray-700"
                  >
                    Rubrique
                  </label>

                  <select
                    id="category"
                    name="category"
                    defaultValue={article.category}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
                  >
                    <option value="ACTUALITÉ">Actualité</option>
                    <option value="ÉCONOMIE">Économie</option>
                    <option value="SOCIÉTÉ">Société</option>
                    <option value="CULTURE">Culture</option>
                    <option value="MONTAGNE">Montagne</option>
                    <option value="ÉDITORIAL">Éditorial</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="author"
                    className="mb-2 block font-semibold text-gray-700"
                  >
                    Auteur
                  </label>

                  <input
                    id="author"
                    name="author"
                    defaultValue={article.author}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block font-semibold text-gray-700"
                >
                  Chapô
                </label>

                <textarea
                  id="description"
                  name="description"
                  defaultValue={article.description}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block font-semibold text-gray-700"
                >
                  Contenu
                </label>

                <textarea
                  id="content"
                  name="content"
                  defaultValue={article.content}
                  rows={20}
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 leading-relaxed outline-none focus:border-yellow-500"
                  required
                />
              </div>
            </section>

            {/* VIDÉO ET RÉSEAUX */}

            <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl">
                Média et réseaux sociaux
              </h2>

              <div>
                <label
                  htmlFor="videoUrl"
                  className="mb-2 block font-semibold text-gray-700"
                >
                  URL vidéo
                </label>

                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  defaultValue={article.videoUrl ?? ""}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="videoDuration"
                  className="mb-2 block font-semibold text-gray-700"
                >
                  Durée de la vidéo
                </label>

                <input
                  id="videoDuration"
                  name="videoDuration"
                  defaultValue={article.videoDuration ?? ""}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="socialText"
                  className="mb-2 block font-semibold text-gray-700"
                >
                  Texte Facebook et WhatsApp
                </label>

                <textarea
                  id="socialText"
                  name="socialText"
                  defaultValue={article.socialText ?? ""}
                  rows={6}
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:border-yellow-500"
                />
              </div>
            </section>
          </div>

          {/* COLONNE DROITE */}

          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl">
                Publication
              </h2>

              <label className="mt-5 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={article.published}
                />

                <span>Contenu publié</span>
              </label>

              <label className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={article.featured}
                />

                <span>Mettre à la Une</span>
              </label>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl">
                Type de contenu
              </h2>

              <select
                name="contentType"
                defaultValue={article.contentType}
                className="mt-5 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
              >
                <option value="article">Article</option>
                <option value="editorial">Éditorial</option>
                <option value="video">Vidéo</option>
                <option value="interview">Interview</option>
                <option value="podcast">Podcast</option>
                <option value="gallery">Galerie</option>
              </select>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl">
                Image de couverture
              </h2>

              <input
                name="image"
                defaultValue={article.image}
                className="mt-5 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
                required
              />

              <img
                src={article.image}
                alt=""
                className="mt-5 h-48 w-full rounded-xl object-cover"
              />
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl">
                Informations
              </h2>

              <p className="mt-5 text-sm text-gray-500">
                Slug
              </p>

              <p className="mt-1 break-words font-semibold">
                {article.slug}
              </p>

              <label
                htmlFor="readingTime"
                className="mt-5 block text-sm text-gray-500"
              >
                Temps de lecture
              </label>

              <input
                id="readingTime"
                name="readingTime"
                defaultValue={article.readingTime}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500"
              />
            </section>
          </aside>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-black px-7 py-4 font-semibold text-white transition hover:bg-yellow-600"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </main>
  );
}