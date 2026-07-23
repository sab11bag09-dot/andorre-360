import Link from "next/link";
import { notFound } from "next/navigation";

import SourceForm from "@/components/admin/sources/SourceForm";
import { updateSource } from "@/app/admin/sources/actions";
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
        <header className="border-b border-zinc-800 pb-8">
          <Link
            href="/admin/sources"
            className="text-sm font-semibold text-zinc-500 transition hover:text-yellow-500"
          >
            ← Retour aux sources
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
            ANDORRE 360 Studio
          </p>

          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
            Modifier la source
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            {source.name}
          </p>
        </header>

        <SourceForm
          action={action}
          mode="update"
          initialValues={source}
        />
      </div>
    </main>
  );
}