import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import AuthProvider from "@/components/auth/AuthProvider";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotydle",
  description: "El reto musical diario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} text-white bg-black min-h-screen`}>
        <AuthProvider>
          <GameProvider>
            {/* Solo visible en escritorio (desde 768px hacia arriba) */}
            <div className="hidden md:block">
              <TopNav />
            </div>

            <main>
              {children}
            </main>

            {/* Solo visible en móvil (desaparece a partir de 768px) */}
            <div className="block md:hidden">
              <BottomNav />
            </div>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}