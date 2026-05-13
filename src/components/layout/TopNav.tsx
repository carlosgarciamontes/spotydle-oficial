"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TopNavProps {
  className?: string;
}

const TopNav: React.FC<TopNavProps> = ({ className }) => {
  const pathname = usePathname();

  // Definimos las rutas donde NO queremos que aparezca el Nav
  const hideNavRoutes = ["/", "/login", "/register", "/verify", "/pending-verification"];
  
  if (hideNavRoutes.includes(pathname) || pathname.startsWith('/play/')) {
    return null;
  }

  const tabs = [
    { href: "/ranking", label: "Ranking" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header
      className={cn(
        "hidden md:flex fixed top-0 left-0 right-0 w-full h-[100px] bg-black/90 backdrop-blur-md items-center border-b border-white/10 z-[100]",
        className,
      )}
    >
      <nav className="w-full flex items-center justify-between px-12 lg:px-24">
        <Link
          href="/play"
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Image
              src="/assets/Spotydle.png"
              alt="Spotydle Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-white text-[28px] font-bold tracking-wide uppercase italic">
            Spotydle
          </span>
        </Link>

        <div className="flex gap-12">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "text-[20px] lg:text-[22px] font-bold transition-all duration-300",
                  isActive
                    ? "text-spotydle drop-shadow-[0_0_12px_rgba(226,79,156,0.6)] scale-105"
                    : "text-white hover:text-gray-300 hover:scale-105",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default TopNav;