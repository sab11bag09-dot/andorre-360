export default function FilInfoLoading() {
  return (
    <main
      className="min-h-screen bg-black text-white"
      aria-busy="true"
      aria-label="Chargement du Fil info"
    >
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-10 md:py-16">
        <div className="h-5 w-28 animate-pulse bg-yellow-500/30 motion-reduce:animate-none" />
        <div className="mt-5 h-14 max-w-2xl animate-pulse bg-neutral-800 motion-reduce:animate-none" />
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="h-[520px] animate-pulse border border-gray-800 bg-neutral-950 motion-reduce:animate-none" />
          <div className="h-[520px] animate-pulse bg-neutral-900 motion-reduce:animate-none" />
        </div>
        <p className="sr-only" role="status">Chargement du Fil info…</p>
      </section>
    </main>
  );
}
