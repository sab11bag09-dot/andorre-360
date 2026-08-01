import Link from "next/link";

type EditorialSocialCardProps = {
  facebookCount: number;
  whatsappCount: number;
  scheduledCount: number;
};

export default function EditorialSocialCard({
  facebookCount,
  whatsappCount,
  scheduledCount,
}: EditorialSocialCardProps) {
  return (
    <section className="rounded-3xl bg-[#161616] p-6 text-white shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-500">
        Diffusion sociale
      </p>

      <h3 className="mt-2 font-serif text-2xl">
        Réseaux sociaux
      </h3>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
          <span>Facebook</span>

          <strong className="text-yellow-400">
            {facebookCount}
          </strong>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
          <span>WhatsApp</span>

          <strong className="text-yellow-400">
            {whatsappCount}
          </strong>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
          <span>Programmées</span>

          <strong className="text-yellow-400">
            {scheduledCount}
          </strong>
        </div>
      </div>

      <Link
        href="/admin/diffusion"
        className="mt-6 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-yellow-400"
      >
        Piloter les diffusions
      </Link>
    </section>
  );
}