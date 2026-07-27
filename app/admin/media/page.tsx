import ExternalVideoButton from "@/components/admin/ExternalVideoButton";
import MediaLibrary from "@/components/admin/MediaLibrary";
import MediaSearch from "@/components/admin/MediaSearch";
import MediaUploadButton from "@/components/admin/MediaUploadButton";
import {
  EmptyState,
  PageHeader,
  SectionHeader,
  Toolbar,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

type AdminMediaPageProps = {
  searchParams: Promise<{
    recherche?: string;
  }>;
};

export default async function AdminMediaPage({
  searchParams,
}: AdminMediaPageProps) {
  const { recherche = "" } = await searchParams;
  const normalizedSearch = recherche.trim();
  const lowercaseSearch = normalizedSearch.toLowerCase();

  const [media, externalVideos] = await Promise.all([
    prisma.media.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.externalVideo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const totalMedia = media.length + externalVideos.length;

  const filteredMedia = normalizedSearch
    ? media.filter((item) => {
        return (
          item.originalName
            .toLowerCase()
            .includes(lowercaseSearch) ||
          item.filename.toLowerCase().includes(lowercaseSearch) ||
          item.path.toLowerCase().includes(lowercaseSearch) ||
          item.mimeType.toLowerCase().includes(lowercaseSearch) ||
          item.type.toLowerCase().includes(lowercaseSearch) ||
          (item.title ?? "")
            .toLowerCase()
            .includes(lowercaseSearch) ||
          (item.alt ?? "")
            .toLowerCase()
            .includes(lowercaseSearch) ||
          (item.caption ?? "")
            .toLowerCase()
            .includes(lowercaseSearch) ||
          (item.credit ?? "")
            .toLowerCase()
            .includes(lowercaseSearch) ||
          (item.copyright ?? "")
            .toLowerCase()
            .includes(lowercaseSearch)
        );
      })
    : media;

  const filteredExternalVideos = normalizedSearch
    ? externalVideos.filter((video) => {
        return (
          (video.title ?? "")
            .toLowerCase()
            .includes(lowercaseSearch) ||
          video.url.toLowerCase().includes(lowercaseSearch) ||
          video.provider.toLowerCase().includes(lowercaseSearch)
        );
      })
    : externalVideos;

  const filteredTotal =
    filteredMedia.length + filteredExternalVideos.length;

  const serializedMedia = filteredMedia.map((item) => ({
    id: item.id,
    type: item.type,
    filename: item.filename,
    originalName: item.originalName,
    path: item.path,
    mimeType: item.mimeType,
    size: item.size,
    width: item.width,
    height: item.height,
    title: item.title,
    alt: item.alt,
    caption: item.caption,
    credit: item.credit,
    copyright: item.copyright,
  }));

  const serializedExternalVideos =
    filteredExternalVideos.map((video) => ({
      id: video.id,
      url: video.url,
      provider: video.provider,
      title: video.title,
    }));

  return (
    <>
      <PageHeader
        backHref="/admin"
        backLabel="Retour au Studio"
        eyebrow="ANDORRE 360 Studio"
        title="Bibliothèque de médias"
        description="Téléverse, consulte et réutilise les images et vidéos de ton journal."
      />

      <section className="py-8">
        <SectionHeader
          title="Médias"
          description={`${filteredTotal} média${
            filteredTotal > 1 ? "s" : ""
          }`}
        />

        <Toolbar
          search={
            <MediaSearch initialQuery={normalizedSearch} />
          }
          actions={
            <>
              <MediaUploadButton />
              <ExternalVideoButton />
            </>
          }
        />

        {totalMedia === 0 ? (
          <EmptyState
            title="Aucun média dans la bibliothèque"
            description="Téléverse un fichier ou ajoute une vidéo externe pour commencer."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <MediaUploadButton />
                <ExternalVideoButton />
              </div>
            }
          />
        ) : filteredTotal === 0 ? (
          <EmptyState
            title="Aucun résultat"
            description={`Aucun média ne correspond à « ${normalizedSearch} ».`}
          />
        ) : (
          <MediaLibrary
            media={serializedMedia}
            externalVideos={serializedExternalVideos}
          />
        )}
      </section>
    </>
  );
}