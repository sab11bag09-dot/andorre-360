import { connection } from "next/server";

import AiUsagePanel from "@/components/admin/editorial/AiUsagePanel";
import ArticleOrchestrationPanel from "@/components/admin/editorial/ArticleOrchestrationPanel";
import { Button, PageHeader } from "@/components/admin/ui";
import { loadAiUsageSummary } from "@/lib/ai/summarizeAiUsage";
import { DEFAULT_ARTICLE_ORCHESTRATION_POLICY } from "@/lib/article-orchestrator/selectObservationsForArticles";
import { prisma } from "@/lib/prisma";

export default async function ArticleOrchestrationPage() {
  // La consommation dépend de l’heure de la requête : jamais précalculée.
  await connection();
  const usage = await loadAiUsageSummary(prisma);

  return (
    <>
      <PageHeader
        backHref="/admin/diffusion"
        backLabel="Retour à la diffusion"
        eyebrow="ANDORRE 360 Studio"
        title="Orchestrateur d’articles"
        description="Examinez les observations que l’orchestrateur transformerait en articles, puis lancez manuellement la génération lorsque les garde-fous sont ouverts."
        actions={
          <Button href="/admin/observations" variant="outline">
            Observations
          </Button>
        }
      />

      <section className="space-y-8 py-8">
        <AiUsagePanel summary={usage} />
        <ArticleOrchestrationPanel
          maxSelected={DEFAULT_ARTICLE_ORCHESTRATION_POLICY.maxSelected}
          maxPerSource={DEFAULT_ARTICLE_ORCHESTRATION_POLICY.maxPerSource}
          freshnessWindowHours={
            DEFAULT_ARTICLE_ORCHESTRATION_POLICY.freshnessWindowHours
          }
        />
      </section>
    </>
  );
}
