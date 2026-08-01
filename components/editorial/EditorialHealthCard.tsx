type EditorialHealthCardProps = {
  scheduledPublicationsCount: number;
};

export default function EditorialHealthCard({
  scheduledPublicationsCount,
}: EditorialHealthCardProps) {
  return (
    <section className="mt-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white shadow-xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
            Santé du journal
          </p>

          <h2 className="mt-3 font-serif text-4xl">
            Indice éditorial global
          </h2>

          <p className="mt-3 max-w-xl text-emerald-100">
            Une première représentation visuelle de la santé
            éditoriale. Les valeurs seront ensuite calculées à partir
            des vraies statistiques.
          </p>
        </div>

        <div className="text-center">
          <div className="text-7xl font-black">84</div>

          <p className="mt-2 text-xl font-semibold">/100</p>

          <div className="mt-5 inline-flex rounded-full bg-white/20 px-5 py-2 text-sm font-bold">
            🟢 Excellent
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-5">
          <p className="text-3xl font-bold">3</p>

          <p className="mt-2 text-sm">
            Contenus très performants
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-5">
          <p className="text-3xl font-bold">1</p>

          <p className="mt-2 text-sm">
            Contenu à surveiller
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-5">
          <p className="text-3xl font-bold">
            {scheduledPublicationsCount}
          </p>

          <p className="mt-2 text-sm">
            Publications programmées
          </p>
        </div>
      </div>
    </section>
  );
}