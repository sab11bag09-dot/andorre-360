import type { CSSProperties } from "react";

import type { DataTableProps } from "./types";

const DEFAULT_GRID_TEMPLATE =
  "minmax(0, 2fr) 150px 140px 100px 110px 120px";

function getAlignmentClass(
  align: "left" | "center" | "right" = "left",
) {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
}

export function DataTable({
  columns,
  children,
  className = "",
  gridTemplateColumns,
}: DataTableProps) {
  const resolvedGridTemplate =
    gridTemplateColumns ?? DEFAULT_GRID_TEMPLATE;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 ${className}`}
      style={
        {
          "--data-table-grid-template": resolvedGridTemplate,
        } as CSSProperties
      }
    >
      <div
        className="hidden border-b border-zinc-800 bg-zinc-900/60 px-5 py-3 xl:grid xl:items-center xl:gap-5"
        style={{
          gridTemplateColumns: "var(--data-table-grid-template)",
        }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={`text-xs font-semibold uppercase tracking-wider text-zinc-500 ${getAlignmentClass(
              column.align,
            )} ${column.className ?? ""}`}
          >
            {column.label}
          </div>
        ))}
      </div>

      <div className="divide-y divide-zinc-800">
        {children}
      </div>
    </div>
  );
}