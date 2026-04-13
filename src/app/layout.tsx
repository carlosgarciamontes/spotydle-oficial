import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import RegisterForm from "@/components/auth/RegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import GameFooter from "@/components/game/GameFooter"

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
        <main className="pb-20">
          {children}
          <RegisterForm />
          <LoginForm />
        </main>
        
        
        <BottomNav />
        <GameFooter />
      </body>
    </html>
  );
}