import Link from "next/link";

import type { PageHeaderProps } from "./types";

/**
 * PageHeader
 *
 * En-tête standard des pages du Studio.
 * Il ne contient aucune logique métier.
 */
export default function PageHeader({
  backHref,
  backLabel = "Retour",
  eyebrow = "ANDORRE 360 Studio",
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="text-sm font-semibold text-zinc-500 transition hover:text-yellow-500"
          >
            ← {backLabel}
          </Link>
        )}

        <p
          className={
            backHref
              ? "mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500"
              : "text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500"
          }
        >
          {eyebrow}
        </p>

        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {actions}
        </div>
      )}
    </header>
  );
}
