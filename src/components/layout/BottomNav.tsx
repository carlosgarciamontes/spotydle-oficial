'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva } from 'class-variance-authority';
import { Trophy, User, Gamepad2, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItemVariants = cva(
  "flex flex-col items-center justify-center w-full h-full transition-all duration-300 select-none",
  {
    variants: {
      isActive: {
        true: [
          "text-spotydle",
          "drop-shadow-[0_0_8px_rgba(226,79,156,0.8)]",
          "scale-110"
        ],
        false: [
          "text-white/50",
          "hover:text-white",
          "scale-100"
        ],
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
);

interface NavTab {
  id: string;
  href: string;
  icon: React.ElementType;
  label: string;
}

const BottomNav: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  // Mismo filtro de rutas para consistencia
  const hideNavRoutes = ["/", "/login", "/register", "/verify", "/pending-verification"];

  if (hideNavRoutes.includes(pathname) || pathname.startsWith('/play/')) {
    return null;
  }

  const tabs: NavTab[] = [
    { id: 'play', href: '/play', icon: Music, label: 'Jugar' },
    { id: 'ranking', href: '/ranking', icon: Trophy, label: 'Ranking' },
    { id: 'profile', href: '/profile', icon: User, label: 'Mi Perfil' },
  ];

  return (
    <nav 
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 h-20",
        "bg-black/90 backdrop-blur-md",
        "border-t border-white/10",
        "flex justify-around items-center px-4 pb-safe",
        "z-50",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(navItemVariants({ isActive }))}
            aria-label={tab.label}
          >
            <Icon 
              size={28} 
              strokeWidth={isActive ? 2.5 : 2} 
              className="transition-all duration-300"
            />
            <span className="text-[10px] font-bold uppercase mt-1 tracking-tighter">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;