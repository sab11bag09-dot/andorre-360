import { createSource } from "@/app/admin/sources/actions";
import SourceForm from "@/components/admin/sources/SourceForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewSourcePage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          backHref="/admin/sources"
          backLabel="Retour aux sources"
          eyebrow="ANDORRA 360 Studio"
          title="Nouvelle source"
          description="Enregistre un organisme ou un flux que la Veille pourra surveiller."
        />

        <SourceForm action={createSource} mode="create" />
      </div>
    </main>
  );
}