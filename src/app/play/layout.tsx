import React from "react";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <TopNav />

      <main className="flex-grow">{children}</main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
