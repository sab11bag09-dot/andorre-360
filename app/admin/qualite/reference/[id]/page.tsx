import Link from "next/link";
import { notFound } from "next/navigation";

import { excludeReferenceCaseAction, saveReferenceAnnotationAction } from "@/actions/reference-set";
import { Badge, Button, PageHeader, Textarea } from "@/components/admin/ui";
import { loadReferenceCase } from "@/lib/article-engine/referenceSetReport";

import { organizationTypeLabel } from "../labels";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Andorra",
});

/** Annotation d’une observation du jeu de référence. */
export default async function ReferenceCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseId = Number(id);
  const entry = Number.isInteger(caseId) && caseId > 0 ? await loadReferenceCase(caseId) : null;
  if (!entry) notFound();

  return (
    <>
      <PageHeader
        backHref="/admin/qualite/reference"
        backLabel="Retour au jeu de référence"
        title={entry.observationTitle}
        description={`${entry.category} · ${organizationTypeLabel(entry.organizationType)} · ${entry.sourceName}${entry.publishedAt ? ` · ${dateFormat.format(entry.publishedAt)}` : ""}`}
      />

      <div className="grid gap-8 py-8 xl:grid-cols-2">
        <section aria-labelledby="source-title">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="source-title" className="font-serif text-2xl">
              Texte de la source
            </h2>
            <a href={entry.observationUrl} target="_blank" rel="noreferrer" className="text-sm text-yellow-500 hover:underline">
              Ouvrir l’original
            </a>
          </div>
          <div className="max-h-[70vh] overflow-y-auto whitespace-pre-line rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm leading-relaxed text-zinc-300">
            {entry.observationContent || "Aucun texte collecté."}
          </div>
        </section>

        <section aria-labelledby="annotation-title">
          <h2 id="annotation-title" className="mb-3 font-serif text-2xl">
            Ce qu’un bon article doit dire
          </h2>

          <form action={saveReferenceAnnotationAction} className="space-y-5">
            <input type="hidden" name="id" value={entry.id} />

            <label className="block text-sm font-semibold">
              Faits obligatoires
              <span className="mt-1 block font-normal text-zinc-500">
                Un fait par ligne, en quelques mots clés français : « 14 400 euros », « Xavier Espot ». Séparez les formulations équivalentes par « | » : « Govern | Gouvernement ».
              </span>
              <Textarea name="requiredFacts" rows={8} defaultValue={entry.requiredFacts} />
            </label>

            <label className="block text-sm font-semibold">
              Erreurs interdites
              <span className="mt-1 block font-normal text-zinc-500">
                Une par ligne : ce que l’article ne doit pas affirmer (mauvais chiffre, mauvaise commune, confusion de personne).
              </span>
              <Textarea name="forbiddenErrors" rows={5} defaultValue={entry.forbiddenErrors} />
            </label>

            <label className="block text-sm font-semibold">
              Remarques
              <Textarea name="notes" rows={3} defaultValue={entry.notes} />
            </label>

            <Button type="submit">Enregistrer l’annotation</Button>
          </form>

          {entry.article && (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-lg">Article de l’IA</h3>
                <Badge variant="info">note {entry.article.quality.score}</Badge>
                <Badge variant={entry.article.passes ? "success" : "danger"}>
                  {entry.article.passes ? "conforme" : "non conforme"}
                </Badge>
              </div>
              <Link href={`/admin/articles/${entry.article.id}`} className="mt-2 block hover:text-yellow-500">
                {entry.article.title}
              </Link>
              {entry.article.check.missingFacts.length > 0 && (
                <p className="mt-2 text-sm text-amber-300">
                  Faits absents : {entry.article.check.missingFacts.join(" ; ")}
                </p>
              )}
              {entry.article.check.forbiddenFound.length > 0 && (
                <p className="mt-2 text-sm text-red-400">
                  Erreurs présentes : {entry.article.check.forbiddenFound.join(" ; ")}
                </p>
              )}
              {entry.article.quality.blockers.length > 0 && (
                <p className="mt-2 text-sm text-red-400">
                  Bloquant : {entry.article.quality.blockers.join(" ; ")}
                </p>
              )}
            </div>
          )}

          <form action={excludeReferenceCaseAction} className="mt-8 border-t border-zinc-800 pt-6">
            <input type="hidden" name="id" value={entry.id} />
            <p className="mb-3 text-sm text-zinc-500">
              Observation peu représentative ? Écartez-la : elle ne sera plus proposée, et « Compléter le jeu » en choisira une autre.
            </p>
            <Button type="submit" variant="outline">
              Écarter cette observation
            </Button>
          </form>
        </section>
      </div>
    </>
  );
}
