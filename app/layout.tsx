import "./globals.css";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
  title: "ANDORRE 360",
  description: "Actualités, économie et lifestyle en Andorre",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-black text-white">
        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}