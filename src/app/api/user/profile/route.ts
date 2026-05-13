import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // Asegúrate de importar desde /next
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ajusta esta ruta a tu config de NextAuth

// 1. Interfaz para el Frontend (lo que espera tu ProfilePage)
interface FrontendModeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  lastCompletedDate: string | null;
}

// 2. Interfaz que mapea EXACTAMENTE tu modelo ModeStat de Prisma
interface PrismaModeStat {
  id: string;
  userId: string;
  modeSlug: string;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  lastCompletedDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Buscamos al usuario usando el nombre de la relación 'stats' que definiste
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        stats: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // 3. Objeto para formatear la respuesta
    const formattedStats: Record<string, FrontendModeStats> = {};
    
    // 4. Mapeo estricto
    if (user.stats && user.stats.length > 0) {
      user.stats.forEach((stat: PrismaModeStat) => {
        formattedStats[stat.modeSlug] = {
          gamesPlayed: stat.gamesPlayed,
          gamesWon: stat.gamesWon,
          currentStreak: stat.currentStreak,
          maxStreak: stat.maxStreak,
          distribution: stat.distribution,
          lastCompletedDate: stat.lastCompletedDate
        };
      });
    }

    return NextResponse.json({
      avatarId: user.avatarId,
      stats: formattedStats
    }, { status: 200 });

  } catch (error) {
    console.error("🔴 Error en API Profile:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}