import type { LucideIcon } from "lucide-react";
import {
  Images,
  LayoutDashboard,
  Newspaper,
  Radio,
  Send,
  Settings,
  Star,
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
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];