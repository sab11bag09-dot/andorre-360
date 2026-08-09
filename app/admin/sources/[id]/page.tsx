import { notFound } from "next/navigation";

import { updateSource } from "@/app/admin/sources/actions";
import SourceForm from "@/components/admin/sources/SourceForm";
import { PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function EditSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sourceId = Number(id);

  if (!Number.isInteger(sourceId)) {
    notFound();
  }

  const source = await prisma.source.findUnique({
    where: {
      id: sourceId,
    },
  });

  if (!source) {
    notFound();
  }

  const action = updateSource.bind(null, source.id);

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          backHref="/admin/sources"
          backLabel="Retour aux sources"
          eyebrow="ANDORRA 360 Studio"
          title="Modifier la source"
          description={source.name}
        />

        <SourceForm
          action={action}
          mode="update"
          initialValues={source}
        />
      </div>
    </main>
  );
}