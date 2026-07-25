import "./globals.css";

import type { ReactNode } from "react";
import { Geist } from "next/font/google";

import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "ANDORRE 360",
  description: "Actualités, économie et lifestyle en Andorre",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}