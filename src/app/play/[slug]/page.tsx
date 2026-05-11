import { notFound } from "next/navigation";
import prisma from "@/lib/prisma"; 
import GameClient from "./GameClient";

interface GamePageProps {
 
  params: Promise<{
    slug: string;
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
 
  const { slug } = await params;


  const mode = await prisma.gameMode.findUnique({
    where: { 
      slug: slug 
    },
  });

  if (!mode) {
    notFound();
  }

  if (mode.isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Nivel Bloqueado 🔒</h1>
        <p className="text-spotydle/70 text-lg">Aún no tienes acceso a este modo de juego.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GameClient mode={mode} />
    </div>
  );
}