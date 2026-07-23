import clsx from "clsx";

import type { SectionHeaderProps } from "./types";

/**
 * SectionHeader
 *
 * En-tête standard des sections du Studio.
 * Ne contient aucune logique métier.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
            {eyebrow}
          </p>
        )}

        <h2
          className={clsx(
            "font-serif text-3xl",
            eyebrow && "mt-2"
          )}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {actions}
        </div>
      )}
    </div>
  );
}