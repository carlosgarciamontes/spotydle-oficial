import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface FrontendModeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  lastCompletedDate: string | null;
  lastGameState: string | null;
  lastTargetSong: unknown | null;
  lastGuesses: unknown | null;
  lastGuessDetails: unknown | null;
  lastPlayedDate: string | null;
}

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
  lastGameState: string | null;
  lastTargetSong: unknown | null;
  lastGuesses: unknown | null;
  lastGuessDetails: unknown | null;
  lastPlayedDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        stats: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const formattedStats: Record<string, FrontendModeStats> = {};
    
    if (user.stats && user.stats.length > 0) {
      user.stats.forEach((stat: PrismaModeStat) => {
        formattedStats[stat.modeSlug] = {
          gamesPlayed: stat.gamesPlayed,
          gamesWon: stat.gamesWon,
          currentStreak: stat.currentStreak,
          maxStreak: stat.maxStreak,
          distribution: stat.distribution,
          lastCompletedDate: stat.lastCompletedDate,
          lastGameState: stat.lastGameState,
          lastTargetSong: stat.lastTargetSong,
          lastGuesses: stat.lastGuesses,
          lastGuessDetails: stat.lastGuessDetails,
          lastPlayedDate: stat.lastPlayedDate
        };
      });
    }

    return NextResponse.json({
      avatarId: user.avatarId,
      stats: formattedStats
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}