export default function AdminAuthorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Organisation
        </p>

        <h1 className="mt-2 font-serif text-3xl text-white">
          Auteurs
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Gérez les auteurs et les rédacteurs du média.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm text-zinc-400">
          La gestion des auteurs sera ajoutée ici.
        </p>
      </div>
    </div>
  );
}