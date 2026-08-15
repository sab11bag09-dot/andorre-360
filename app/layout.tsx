import "./globals.css";

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000",
  ),
  title: "ANDORRA 360",
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
