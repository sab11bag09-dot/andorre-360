import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}