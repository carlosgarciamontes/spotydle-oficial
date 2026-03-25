import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotydle",
  description: "El reto musical diario",
};

// 1. Añadimos 'children' dentro de las primeras llaves
export default function RootLayout({
  children, 
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} text-white bg-black min-h-screen`}>
        
        {/* 2. Metemos {children} dentro del main */}
        <main className="pb-20">
          {children}
        </main>
        
        <BottomNav />
      </body>
    </html>
  );
}