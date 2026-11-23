import Link from "next/link";

import { completeReferenceSetAction } from "@/actions/reference-set";
import { Badge, Button, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { REFERENCE_SET_SIZE, REFERENCE_SET_TARGET_RATIO } from "@/lib/article-engine/referenceSet";
import { loadReferenceSet, summarizeReferenceSet } from "@/lib/article-engine/referenceSetReport";

import { organizationTypeLabel } from "./labels";

export const dynamic = "force-dynamic";

const TARGET = `${Math.round(REFERENCE_SET_TARGET_RATIO * 10)} sur 10`;

/**
 * Jeu de référence (étape 1 de la feuille de route) : une trentaine
 * d’observations réelles, choisies automatiquement et annotées par
 * l’utilisateur, contre lesquelles les articles de l’IA sont contrôlés.
 */
export default async function ReferenceSetPage() {
  const entries = await loadReferenceSet();
  const summary = summarizeReferenceSet(entries);

  return (
    <>
      <PageHeader
        backHref="/admin/qualite"
        backLabel="Retour à la qualité"
        title="Jeu de référence"
        description={`Pour chaque observation, notez ce qu’un bon article doit dire et les erreurs qu’il ne doit pas commettre. Les articles de l’IA rédigés à partir de ces observations sont contrôlés automatiquement. Objectif : ${TARGET} publiables en l’état.`}
      />

      <section className="grid gap-4 border-b border-zinc-800 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Observations" value={`${summary.total}/${REFERENCE_SET_SIZE}`} description="choisies par rubrique et type de source" />
        <StatCard title="Annotées" value={summary.annotated} description="au moins un fait obligatoire" />
        <StatCard title="Avec un article de l’IA" value={summary.evaluated} description="parmi les observations annotées" />
        <StatCard
          title="Conformes"
          value={summary.evaluated === 0 ? "—" : `${summary.passing}/${summary.evaluated}`}
          valueClassName={summary.targetReached ? "text-emerald-400" : undefined}
          description={`publiables et fidèles à l’annotation — objectif ${TARGET}`}
        />
      </section>

      <section className="py-8" aria-labelledby="reference-list-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 id="reference-list-title" className="font-serif text-2xl">
            Observations du jeu
          </h2>
          {summary.total < REFERENCE_SET_SIZE && (
            <form action={completeReferenceSetAction}>
              <Button type="submit">
                {summary.total === 0 ? "Composer le jeu" : "Compléter le jeu"}
              </Button>
            </form>
          )}
        </div>

        {entries.length === 0 ? (
          <EmptyState
            title="Le jeu de référence est vide"
            description={`« Composer le jeu » choisit ${REFERENCE_SET_SIZE} observations récentes, réparties entre les rubriques et les types de source. Aucun appel à l’IA.`}
          />
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-950">
            {entries.map((entry) => (
              <li key={entry.id} className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{entry.category}</span>
                    <span>·</span>
                    <span>{organizationTypeLabel(entry.organizationType)}</span>
                    <span>·</span>
                    <span>{entry.sourceName}</span>
                  </div>
                  <Link
                    href={`/admin/qualite/reference/${entry.id}`}
                    className="mt-2 block font-serif text-lg leading-snug hover:text-yellow-500"
                  >
                    {entry.observationTitle}
                  </Link>
                  {entry.article && entry.article.check.missingFacts.length > 0 && (
                    <p className="mt-2 text-sm text-amber-300">
                      Faits absents de l’article : {entry.article.check.missingFacts.join(" ; ")}
                    </p>
                  )}
                  {entry.article && entry.article.check.forbiddenFound.length > 0 && (
                    <p className="mt-2 text-sm text-red-400">
                      Erreurs présentes : {entry.article.check.forbiddenFound.join(" ; ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  <Badge variant={entry.annotated ? "success" : "default"}>
                    {entry.annotated ? "annotée" : "à annoter"}
                  </Badge>
                  {entry.article && entry.annotated && (
                    <Badge variant={entry.article.passes ? "success" : "danger"}>
                      {entry.article.passes ? "article conforme" : "article non conforme"}
                    </Badge>
                  )}
                  {entry.article && (
                    <Badge variant="info">note {entry.article.quality.score}</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
