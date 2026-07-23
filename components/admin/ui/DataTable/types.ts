import type { ReactNode } from "react";

export type DataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
};

export type DataTableProps = {
  columns: DataTableColumn[];
  children: ReactNode;
  className?: string;
  gridTemplateColumns?: string;
};

export type DataTableRowProps = {
  children: ReactNode;
  className?: string;
  gridTemplateColumns?: string;
};