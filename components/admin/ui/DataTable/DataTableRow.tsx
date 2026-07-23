import type { DataTableRowProps } from "./types";

export function DataTableRow({
  children,
  className = "",
  gridTemplateColumns,
}: DataTableRowProps) {
  const resolvedGridTemplate =
    gridTemplateColumns ??
    "var(--data-table-grid-template)";

  return (
    <div
      className={`grid items-center gap-5 px-5 py-4 ${className}`}
      style={{
        gridTemplateColumns: resolvedGridTemplate,
      }}
    >
      {children}
    </div>
  );
}