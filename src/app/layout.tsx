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
  icons: {
    icon: "/assets/Spotydle.png",
    shortcut: "/assets/Spotydle.png",
    apple: "/assets/Spotydle.png",
  },
  openGraph: {
    title: "Spotydle",
    description: "El reto musical diario",
    url: "https://spotydle-oficial.vercel.app/",
    siteName: "Spotydle",
    images: [
      {
        url: "/assets/Spotydle.png",
        width: 800,
        height: 800,
        alt: "Spotydle Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
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
            <div className="hidden md:block">
              <TopNav />
            </div>

            <main>
              {children}
            </main>

            <div className="block md:hidden">
              <BottomNav />
            </div>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}