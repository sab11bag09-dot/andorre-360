import Image from "next/image";
import Link from "next/link";

import MediaDeleteButton from "@/components/admin/MediaDeleteButton";
import MediaMetadataForm from "@/components/admin/MediaMetadataForm";
import MediaUploadButton from "@/components/admin/MediaUploadButton";
import { prisma } from "@/lib/prisma";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-gray-800 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
              ANDORRE 360 Studio
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              Bibliothèque de médias
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Téléverse, consulte et réutilise les images de ton journal.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-yellow-500 hover:text-yellow-500"
          >
            Retour au Studio
          </Link>
        </header>

        <section className="py-8">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-2xl">Images</h2>

              <p className="mt-1 text-sm text-gray-500">
                {media.length} média{media.length > 1 ? "s" : ""}
              </p>
            </div>

            <MediaUploadButton />
          </div>

          {media.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 px-6 py-16 text-center">
              <p className="font-serif text-2xl text-gray-300">
                Aucune image dans la bibliothèque
              </p>

              <p className="mt-3 text-gray-500">
                Clique sur <strong>Téléverser une image</strong> pour commencer.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {media.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-800 bg-zinc-950 transition hover:border-yellow-500"
                >
                  <div className="relative aspect-[4/3] bg-zinc-900">
                    <Image
                      src={item.path}
                      alt={item.alt || item.originalName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <h3 className="truncate font-medium">
                        {item.originalName}
                      </h3>

                      <p
                        className="truncate text-xs text-gray-500"
                        title={item.path}
                      >
                        {item.path}
                      </p>

                      <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                        <span>{(item.size / 1024).toFixed(1)} Ko</span>

                        <span className="text-right">
                          {item.width && item.height
                            ? `${item.width} × ${item.height}`
                            : "Dimensions inconnues"}
                        </span>
                      </div>
                    </div>

                    <MediaMetadataForm
                      mediaId={item.id}
                      initialAlt={item.alt}
                      initialCaption={item.caption}
                    />

                    <MediaDeleteButton
                      mediaId={item.id}
                      mediaName={item.originalName}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}