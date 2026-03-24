'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva } from 'class-variance-authority';
import { Home, MessageSquare, Users, User } from 'lucide-react';
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
          "text-sp-base",
          "hover:text-sp-light",
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

interface BottomNavProps {
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const pathname = usePathname();

  const tabs: NavTab[] = [
    { id: 'home', href: '/', icon: Home, label: 'Home' },
    { id: 'crew', href: '/crew', icon: MessageSquare, label: 'Crew' },
    { id: 'add-friends', href: '/friends', icon: Users, label: 'Add Friends' },
    { id: 'profile', href: '/stats', icon: User, label: 'Stats' },
  ];

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 h-20",
        "bg-black backdrop-blur-md",
        "border-t border-white/10",
        "flex justify-around items-center px-4 pb-safe",
        "z-50",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

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
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;