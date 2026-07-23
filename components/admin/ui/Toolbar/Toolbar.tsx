import type { ToolbarProps } from "./types";

export default function Toolbar({
  search,
  filters,
  actions,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {search && <div className="flex-1">{search}</div>}

        {filters && (
          <div className="flex flex-wrap gap-2">
            {filters}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}