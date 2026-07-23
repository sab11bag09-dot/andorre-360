import Link from "next/link";
import clsx from "clsx";

import type { ButtonProps } from "./types";

/**
 * Button
 *
 * Bouton standard du Studio.
 * Peut être rendu comme un bouton HTML ou comme un lien Next.js.
 * Ne contient aucune logique métier.
 */
export default function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  disabled = false,
  className,
  target,
  rel,
  onClick,
}: ButtonProps) {
  const classes = clsx(
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition",
    {
      "bg-yellow-500 text-black hover:bg-yellow-400":
        variant === "primary",
      "bg-zinc-800 text-white hover:bg-zinc-700":
        variant === "secondary",
      "border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900":
        variant === "outline",
      "bg-red-600 text-white hover:bg-red-500":
        variant === "danger",
      "cursor-not-allowed opacity-50": disabled,
    },
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={target}
        rel={rel}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      onClick={onClick}
    >
      {children}
    </button>
  );
}