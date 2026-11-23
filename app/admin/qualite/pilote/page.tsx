import { connection } from "next/server";

import { Button, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import { loadPilotMeasures } from "@/lib/ai/loadPilotMeasures";
import { PILOT_DAYS, type PilotCounts } from "@/lib/ai/pilotMeasures";
import { categoryLabel } from "@/lib/article-engine/categoryLabels";

const usd = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 3 });
const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function cost(value: number | null, incomplete = false): string {
  if (value === null) return "—";
  return `${usd.format(value)}${incomplete ? " *" : ""}`;
}

function delay(hours: number | null): string {
  if (hours === null) return "—";
  return hours < 48 ? `${decimal.format(hours)} h` : `${decimal.format(hours / 24)} j`;
}

function share(part: number, whole: number): string {
  return whole === 0 ? "—" : `${part} sur ${whole}`;
}

const COLUMNS: Array<{ label: string; value: (counts: PilotCounts) => string }> = [
  { label: "Rédigés", value: (counts) => String(counts.produced) },
  { label: "Publiables", value: (counts) => share(counts.publishable, counts.produced) },
  { label: "Publiés", value: (counts) => String(counts.published) },
  { label: "Sans retouche", value: (counts) => share(counts.publishedUnedited, counts.published) },
  { label: "Noms à vérifier", value: (counts) => String(counts.withNamesToCheck) },
  { label: "Refusés", value: (counts) => String(counts.refusedGenerations) },
  { label: "Coût du jour", value: (counts) => cost(counts.costUsd, counts.costIncomplete) },
  { label: "Délai médian", value: (counts) => delay(counts.medianDelayHours) },
];

/**
 * Mesures quotidiennes du pilote (étape 3 de la feuille de route) : volume,
 * qualité, erreurs, coût et délai des articles de l’IA, sans appel à l’IA.
 */
export default async function PilotMeasuresPage() {
  // Les mesures dépendent du jour de la requête : jamais précalculées.
  await connection();
  const { days, total } = await loadPilotMeasures();

  return (
    <>
      <PageHeader
        backHref="/admin/qualite"
        backLabel="Retour à la qualité"
        title="Mesures du pilote"
        description={`Les ${PILOT_DAYS} derniers jours, à l’heure d’Andorre. Coûts estimés à partir des jetons enregistrés ; la facture se lit dans le tableau de bord OpenAI.`}
        actions={
          <Button href="/admin/diffusion/orchestrateur" variant="outline">
            Orchestrateur
          </Button>
        }
      />

      <section className="grid gap-4 border-b border-zinc-800 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Articles rédigés"
          value={total.produced}
          description={`${share(total.publishable, total.produced)} publiables selon la note`}
        />
        <StatCard
          title="Publiés sans retouche"
          value={share(total.publishedUnedited, total.published)}
          description="Texte publié tel que l’IA l’a rédigé"
        />
        <StatCard
          title="Coût moyen d’un article"
          value={cost(total.costPerArticleUsd)}
          description={`Rédaction et traductions · période : ${cost(total.costUsd, total.costIncomplete)}`}
        />
        <StatCard
          title="Délai médian"
          value={delay(total.medianDelayHours)}
          description="De la publication de la source à celle du site"
        />
        <StatCard
          title="Noms à vérifier"
          value={total.withNamesToCheck}
          description="Articles citant un nom absent de la liste de faits"
          valueClassName={total.withNamesToCheck > 0 ? "text-amber-400" : undefined}
        />
        <StatCard
          title="Générations refusées"
          value={total.refusedGenerations}
          description="Chiffre inventé, texte trop proche de la source…"
          valueClassName={total.refusedGenerations > 0 ? "text-red-400" : undefined}
        />
      </section>

      <section className="border-b border-zinc-800 py-8" aria-labelledby="pilot-days-title">
        <h2 id="pilot-days-title" className="mb-5 font-serif text-2xl">
          Jour par jour
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                <th className="px-4 py-3 font-normal">Jour</th>
                {COLUMNS.map((column) => (
                  <th key={column.label} className="px-4 py-3 text-right font-normal">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {days.map((day) => (
                <tr key={day.day}>
                  <td className="px-4 py-3 first-letter:uppercase">{day.label}</td>
                  {COLUMNS.map((column) => (
                    <td key={column.label} className="px-4 py-3 text-right tabular-nums">
                      {column.value(day)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total.costIncomplete && (
          <p className="mt-3 text-xs text-zinc-500">* Une partie des appels vient d’un modèle sans prix connu.</p>
        )}
      </section>

      <section className="py-8" aria-labelledby="pilot-categories-title">
        <h2 id="pilot-categories-title" className="mb-5 font-serif text-2xl">
          Articles rédigés par rubrique
        </h2>

        {total.byCategory.length === 0 ? (
          <EmptyState
            title="Aucun article rédigé sur la période"
            description="Les articles produits pendant le pilote apparaîtront ici, rubrique par rubrique."
          />
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-950">
            {total.byCategory.map((entry) => (
              <li key={entry.category} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{categoryLabel(entry.category, "fr")}</span>
                <span className="tabular-nums">{entry.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
