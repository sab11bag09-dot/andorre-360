import HomeEditorialSimulationPanel from "@/components/admin/editorial/HomeEditorialSimulationPanel";
import { Button, PageHeader } from "@/components/admin/ui";
import {
  evaluateHomeCompositionApplicationRuntime,
  readHomeCompositionApplicationRuntime,
} from "@/lib/editorial/applyAutomatedHomeComposition";
import { readHomeCompositionRollbackRuntime } from "@/lib/editorial/rollbackAutomatedHomeComposition";

export default function HomeEditorialSimulationPage() {
  const applicationDecision = evaluateHomeCompositionApplicationRuntime(
    readHomeCompositionApplicationRuntime(),
  );

  const rollbackRuntime = readHomeCompositionRollbackRuntime();

  const rollbackEnabled =
    rollbackRuntime.enabled && !rollbackRuntime.emergencyStop;

  return (
    <>
      <PageHeader
        backHref="/admin/diffusion"
        backLabel="Retour à la diffusion"
        eyebrow="ANDORRE 360 Studio"
        title="Simulation de l’accueil"
        description="Évaluez une proposition automatique, puis appliquez-la manuellement lorsque les garde-fous sont activés."
        actions={
          <Button href="/admin/diffusion" variant="outline">
            Missions éditoriales
          </Button>
        }
      />

      <section className="py-8">
        <HomeEditorialSimulationPanel
          applicationEnabled={applicationDecision.allowed}
          rollbackEnabled={rollbackEnabled}
        />
      </section>
    </>
  );
}
