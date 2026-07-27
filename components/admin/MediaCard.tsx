import type { ReactNode } from "react";

type MediaCardProps = {
  children: ReactNode;
  compact?: boolean;
  onClick?: () => void;
};

export default function MediaCard({
  children,
  compact = false,
  onClick,
}: MediaCardProps) {
  return (
    <article
      onClick={onClick}
      className={[
        "overflow-hidden border border-zinc-800 bg-zinc-950 transition",
        "hover:border-yellow-500 hover:shadow-lg hover:shadow-black/20",
        compact ? "rounded-lg" : "rounded-xl",
        onClick ? "cursor-pointer" : "",
      ].join(" ")}
    >
      {children}
    </article>
  );
}