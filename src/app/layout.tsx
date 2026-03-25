import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import LevelCard from "@/components/ui/LevelCard";

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
        <LevelCard
         title="Adivina la Canción" 
  imageUrl="/assets/Spotydle.png"/>
        <BottomNav />
      </body>
    </html>
  );
}
