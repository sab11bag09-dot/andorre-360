import Link from "next/link";
import { notFound } from "next/navigation";

import { excludeReferenceCaseAction, saveReferenceAnnotationAction } from "@/actions/reference-set";
import { Badge, Button, PageHeader, Textarea } from "@/components/admin/ui";
import { QUESTIONS, type QuestionKey } from "@/lib/article-engine/fiveQuestions";
import { REFERENCE_QUESTION_FIELDS } from "@/lib/article-engine/referenceSet";
import { loadReferenceCase } from "@/lib/article-engine/referenceSetReport";

import { organizationTypeLabel } from "../labels";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Andorra",
});

const QUESTION_HELP: Record<QuestionKey, string> = {
  who: "La personne, l’organisme ou la chose dont parle l’article.",
  where: "Le lieu : commune, bâtiment, pays.",
  when: "La date, le jour, l’heure ou la période.",
  how: "Ce qui se passe concrètement : chiffres, étapes, moyens.",
  why: "La raison ou le but, si la source le donne.",
};

const STATUS_STYLE = {
  répond: "border-emerald-500/30 text-emerald-300",
  manque: "border-amber-500/30 text-amber-300",
  "sans objet": "border-zinc-800 text-zinc-500",
} as const;

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

            <p className="text-sm text-zinc-500">
              Pour chaque question, les mots clés français que l’article doit contenir, un fait par ligne : « 14 400 euros », « Xavier Espot ». Séparez les formulations équivalentes par « | » : « Govern | Gouvernement ». Laissez vide une question à laquelle la source ne répond pas.
            </p>

            {QUESTIONS.map(({ key, label, optional }) => {
              const field = REFERENCE_QUESTION_FIELDS[key];
              return (
                <label key={key} className="block text-sm font-semibold">
                  {label}
                  {optional && <span className="font-normal text-zinc-500"> (facultatif)</span>}
                  <span className="mt-1 block font-normal text-zinc-500">{QUESTION_HELP[key]}</span>
                  <Textarea name={field} rows={2} defaultValue={entry.annotation[field]} />
                </label>
              );
            })}

            <label className="block text-sm font-semibold">
              Erreurs interdites
              <span className="mt-1 block font-normal text-zinc-500">
                Une par ligne : ce que l’article ne doit pas affirmer (mauvais chiffre, mauvaise commune, confusion de personne).
              </span>
              <Textarea name="forbiddenErrors" rows={3} defaultValue={entry.annotation.forbiddenErrors} />
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
              <ul className="mt-4 space-y-2 text-sm">
                {entry.article.check.questions.map(({ key, facts, missing }) => {
                  const automatic = entry.article?.quality.questions.find((answer) => answer.key === key);
                  const status = facts.length > 0 ? (missing.length > 0 ? "manque" : "répond") : (automatic?.status ?? "sans objet");
                  return (
                    <li key={key} className={`rounded-md border px-3 py-2 ${STATUS_STYLE[status]}`}>
                      <span className="font-semibold">{QUESTIONS.find((question) => question.key === key)?.label}</span>{" "}
                      {status}
                      {missing.length > 0 && ` — absent : ${missing.join(" ; ")}`}
                      {facts.length === 0 && automatic && ` — ${automatic.detail}`}
                    </li>
                  );
                })}
              </ul>
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
