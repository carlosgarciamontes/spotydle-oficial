import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

interface GamePageProps {
  params: {
    slug: string;
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = params;

  const mode = await prisma.gameMode.findUnique({
    where: {
      slug: slug,
    },
  });

  if (!mode) {
    notFound();
  }

  if (mode.isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">
          Nivel Bloqueado 🔒
        </h1>
        <p className="text-spotydle/70 text-lg">
          Aún no tienes acceso a este modo de juego.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto mt-8 px-4">
      <div className="w-full bg-black/40 border border-spotydle/30 rounded-2xl p-6 mb-8 text-center backdrop-blur-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {mode.title}
        </h1>
        <p className="text-spotydle/80 text-sm font-semibold tracking-wider uppercase">
          Artista/Género base: {mode.query}
        </p>
      </div>

      <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center text-gray-400 bg-black/20">
        <p>
          🎮 Aquí cargaremos el reproductor para el modo:{" "}
          <span className="font-bold text-white">{mode.title}</span>
        </p>
      </div>
    </div>
  );
}
