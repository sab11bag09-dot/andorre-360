import type { AiUsageSummary } from "@/lib/ai/summarizeAiUsage";

const fr = (value: number) => value.toLocaleString("fr-FR");

function barColor(percent: number, reached: boolean): string {
  if (reached) return "bg-red-600";
  if (percent >= 80) return "bg-yellow-500";
  return "bg-emerald-600";
}

/**
 * Consommation OpenAI : les 24 dernières heures face au plafond
 * `AI_DAILY_TOKEN_LIMIT`, le détail par type d’appel et les 7 derniers jours.
 * Le montant en euros se lit dans le tableau de bord OpenAI.
 */
export default function AiUsagePanel({ summary }: { summary: AiUsageSummary }) {
  const { window, byOperation, byDay } = summary;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
        Dépense
      </p>
      <h2 className="mt-2 font-serif text-2xl text-gray-950">Consommation OpenAI</h2>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-3xl font-semibold text-gray-950">{fr(window.used)} jetons</p>
        <p className="text-sm text-gray-600">
          sur {fr(window.limit)} autorisés sur les dernières 24 heures ({window.percent} %)
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-label="Part du plafond de dépense utilisée"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={window.percent}
      >
        <div
          className={`h-full ${barColor(window.percent, window.reached)}`}
          style={{ width: `${window.percent}%` }}
        />
      </div>

      {window.reached ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Plafond atteint : aucun nouvel appel à OpenAI ne part tant que la consommation des
          24 dernières heures reste au-dessus du plafond (AI_DAILY_TOKEN_LIMIT).
        </p>
      ) : (
        <p className="mt-3 text-sm text-gray-600">
          Reste disponible : {fr(window.remaining)} jetons. Le montant en euros se lit dans le
          tableau de bord OpenAI.
        </p>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">Dernières 24 heures, par type d’appel</h3>
          {byOperation.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">Aucun appel à OpenAI sur les dernières 24 heures.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-1 font-normal">Type</th>
                  <th className="py-1 text-right font-normal">Appels</th>
                  <th className="py-1 text-right font-normal">Jetons</th>
                </tr>
              </thead>
              <tbody>
                {byOperation.map((entry) => (
                  <tr key={entry.operation} className="border-t border-gray-100 text-gray-900">
                    <td className="py-1.5">{entry.label}</td>
                    <td className="py-1.5 text-right tabular-nums">{fr(entry.calls)}</td>
                    <td className="py-1.5 text-right tabular-nums">{fr(entry.tokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-950">7 derniers jours</h3>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1 font-normal">Jour</th>
                <th className="py-1 text-right font-normal">Appels</th>
                <th className="py-1 text-right font-normal">Jetons</th>
              </tr>
            </thead>
            <tbody>
              {byDay.map((entry) => (
                <tr key={entry.day} className="border-t border-gray-100 text-gray-900">
                  <td className="py-1.5 first-letter:uppercase">{entry.label}</td>
                  <td className="py-1.5 text-right tabular-nums">{fr(entry.calls)}</td>
                  <td className="py-1.5 text-right tabular-nums">{fr(entry.tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
