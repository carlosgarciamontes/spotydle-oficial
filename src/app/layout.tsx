import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GameFooter from "@/components/layout/GameFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotydle",
  description: "El reto musical diario",
};

export default function RootLayout({}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} text-white`}>
        <main className="pb-20"></main>
        <GameFooter />
      </body>
    </html>
  );
}
