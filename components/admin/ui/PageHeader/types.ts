import type { ReactNode } from "react";

export type PageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};
