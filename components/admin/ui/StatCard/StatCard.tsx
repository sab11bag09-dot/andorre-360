import Link from "next/link";
import clsx from "clsx";

import type { StatCardProps } from "./types";

/**
 * StatCard
 *
 * Carte de statistique réutilisable du Studio.
 * Ne contient aucune logique métier.
 */
export default function StatCard({
  title,
  value,
  description,
  valueClassName,
  href,
}: StatCardProps) {
  const content = (
    <article className="h-full rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-700">
      <p className="text-sm text-zinc-500">{title}</p>

      <p
        className={clsx(
          "mt-3 font-serif text-4xl",
          valueClassName
        )}
      >
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-zinc-600">
          {description}
        </p>
      )}
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}