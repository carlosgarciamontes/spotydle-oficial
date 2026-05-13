import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "total";

  try {
    let fullRanking;

    if (mode === "total") {
      const users = await prisma.user.findMany({
        include: { stats: true },
      });

      fullRanking = users
        .map((user) => {
          const totalWins = user.stats.reduce((acc, s) => acc + s.gamesWon, 0);
          const totalPlayed = user.stats.reduce((acc, s) => acc + s.gamesPlayed, 0);
          const winRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;

          return {
            id: user.id,
            name: user.name || "Anónimo",
            avatarId: user.avatarId,
            gamesWon: totalWins,
            winRate,
          };
        })
        .filter(u => u.gamesWon > 0)
        .sort((a, b) => {
          if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
          return b.winRate - a.winRate; 
        })
        .map((user, index) => ({ ...user, rank: index + 1 }));
    } else {
      const stats = await prisma.modeStat.findMany({
        where: { modeSlug: mode },
        include: { user: true },
      });

      fullRanking = stats
        .map((s) => ({
          id: s.user.id,
          name: s.user.name || "Anónimo",
          avatarId: s.user.avatarId,
          gamesWon: s.gamesWon,
          winRate: s.gamesPlayed > 0 ? Math.round((s.gamesWon / s.gamesPlayed) * 100) : 0,
        }))
        .filter(u => u.gamesWon > 0)
        .sort((a, b) => {
          if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
          return b.winRate - a.winRate;
        })
        .map((user, index) => ({ ...user, rank: index + 1 }));
    }

    const leaderboard = fullRanking.slice(0, 50);
    let currentUserRank = null;

    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (currentUser) {
        currentUserRank = fullRanking.find(u => u.id === currentUser.id) || null;
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserRank,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el ranking" }, { status: 500 });
  }
}