import type { ReactNode } from "react";

type MediaCardProps = {
  children: ReactNode;
};

export default function MediaCard({
  children,
}: MediaCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition hover:border-yellow-500">
      {children}
    </article>
  );
}