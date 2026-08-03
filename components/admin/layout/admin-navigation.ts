import type { LucideIcon } from "lucide-react";
import {
  Images,
  History,
  LayoutDashboard,
  LayoutGrid,
  Newspaper,
  Radio,
  Send,
  Settings,
  Star,
  Tags,
  Users,
} from "lucide-react";

export type AdminNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavigation: AdminNavigationItem[] = [
  {
    label: "Tableau de bord",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: Newspaper,
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: LayoutGrid,
  },
  {
    label: "Tags",
    href: "/admin/tags",
    icon: Tags,
  },
  {
    label: "Auteurs",
    href: "/admin/authors",
    icon: Users,
  },
  {
    label: "Sources",
    href: "/admin/sources",
    icon: Radio,
  },
  {
    label: "Médiathèque",
    href: "/admin/media",
    icon: Images,
  },
  {
    label: "Éditorial",
    href: "/admin/editorial",
    icon: Star,
  },
  {
    label: "Diffusion",
    href: "/admin/diffusion",
    icon: Send,
  },
  {
    label: "Historique",
    href: "/admin/history",
    icon: History,
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];
