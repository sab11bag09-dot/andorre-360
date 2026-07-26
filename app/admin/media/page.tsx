import Image from "next/image";
import MediaDeleteButton from "@/components/admin/MediaDeleteButton";
import MediaMetadataForm from "@/components/admin/MediaMetadataForm";
import MediaUploadButton from "@/components/admin/MediaUploadButton";
import { prisma } from "@/lib/prisma";
import {
  EmptyState,
  PageHeader,
  SectionHeader,
} from "@/components/admin/ui";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <PageHeader
        backHref="/admin"
        backLabel="Retour au Studio"
        eyebrow="ANDORRE 360 Studio"
        title="Bibliothèque de médias"
        description="Téléverse, consulte et réutilise les images de ton journal."
      />

      <section className="py-8">
        <SectionHeader
          title="Images"
          description={`${media.length} média${media.length > 1 ? "s" : ""}`}
          actions={<MediaUploadButton />}
        />

        {media.length === 0 ? (
          <EmptyState
            title="Aucune image dans la bibliothèque"
            description="Clique sur Téléverser une image pour commencer."
            action={<MediaUploadButton />}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {media.map((item) => {
              const imageSrc = item.path.startsWith("/api/media/files/")
                ? item.path.replace(
                    "/api/media/files/originals/",
                    "/api/media/files/thumbnails/"
                  )
                : `/api/media/files/thumbnails/${item.filename}`;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-800 bg-zinc-950 transition hover:border-yellow-500"
                >
                  <div className="relative aspect-[4/3] bg-zinc-900">
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block h-full w-full cursor-zoom-in"
                      aria-label={`Ouvrir ${item.originalName}`}
                      title="Ouvrir l’image originale"
                    >
                      <Image
                        src={imageSrc}
                        alt={item.alt || item.originalName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </a>
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
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}