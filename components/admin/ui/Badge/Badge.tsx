import clsx from "clsx";

import type { BadgeProps } from "./types";

/**
 * Badge
 *
 * Badge visuel réutilisable du Studio.
 * Ne contient aucune logique métier.
 */
export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        {
          "border-zinc-700 bg-zinc-800/60 text-zinc-300":
            variant === "default",

          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400":
            variant === "success",

          "border-amber-500/30 bg-amber-500/10 text-amber-400":
            variant === "warning",

          "border-sky-500/40 bg-sky-500/10 text-sky-400":
            variant === "info",

          "border-yellow-500/40 bg-yellow-500/10 text-yellow-500":
            variant === "highlight",

          "border-red-500/30 bg-red-500/10 text-red-400":
            variant === "danger",
        },
        className
      )}
    >
      {children}
    </span>
  );
}