import HomeEditorialSimulationPanel from "@/components/admin/editorial/HomeEditorialSimulationPanel";
import { Button, PageHeader } from "@/components/admin/ui";

export default function HomeEditorialSimulationPage() {
  return (
    <>
      <PageHeader
        backHref="/admin/diffusion"
        backLabel="Retour à la diffusion"
        eyebrow="ANDORRE 360 Studio"
        title="Simulation de l’accueil"
        description="Évaluez une proposition de composition automatique sans modifier les missions éditoriales actuellement diffusées."
        actions={
          <Button href="/admin/diffusion" variant="outline">
            Missions éditoriales
          </Button>
        }
      />

      <section className="py-8">
        <HomeEditorialSimulationPanel />
      </section>
    </>
  );
}
