import type { EmptyStateProps } from "./types";

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 px-6 py-14 text-center">
      <h3 className="font-serif text-2xl text-zinc-300">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm text-zinc-500">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}