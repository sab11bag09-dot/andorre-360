import ArticleOrchestrationPanel from "@/components/admin/editorial/ArticleOrchestrationPanel";
import { Button, PageHeader } from "@/components/admin/ui";
import { DEFAULT_ARTICLE_ORCHESTRATION_POLICY } from "@/lib/article-orchestrator/selectObservationsForArticles";

export default function ArticleOrchestrationPage() {
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

      <section className="py-8">
        <ArticleOrchestrationPanel
          maxSelected={DEFAULT_ARTICLE_ORCHESTRATION_POLICY.maxSelected}
          freshnessWindowHours={
            DEFAULT_ARTICLE_ORCHESTRATION_POLICY.freshnessWindowHours
          }
        />
      </section>
    </>
  );
}
