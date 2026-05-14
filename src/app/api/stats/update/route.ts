import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Invitado" }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { modeSlug, gameState, guesses, guessDetails, targetSong, isGameEnd, totalAttempts, date } = body;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "No user" }, { status: 404 });

    const currentStats = await prisma.modeStat.findUnique({
      where: { userId_modeSlug: { userId: user.id, modeSlug } },
    });

    const isWin = gameState === "won";
    
    // Preparar datos de actualización
    let updateData: Prisma.ModeStatUpdateInput = {
      lastGameState: gameState,
      lastGuesses: guesses,
      lastGuessDetails: guessDetails,
      lastTargetSong: targetSong,
      lastPlayedDate: date,
    };

    if (isGameEnd) {
      const newStreak = isWin ? (currentStats?.currentStreak || 0) + 1 : 0;
      const newMaxStreak = Math.max(newStreak, currentStats?.maxStreak || 0);
      const newDistribution = [...(currentStats?.distribution || [0, 0, 0, 0, 0, 0])];

      if (isWin && totalAttempts) {
        newDistribution[Math.max(0, totalAttempts - 1)] += 1;
      }

      updateData = {
        ...updateData,
        gamesPlayed: { increment: 1 },
        gamesWon: { increment: isWin ? 1 : 0 },
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        distribution: newDistribution,
        lastCompletedDate: date,
      };
    }

    const updatedStats = await prisma.modeStat.upsert({
      where: { userId_modeSlug: { userId: user.id, modeSlug } },
      update: updateData,
      create: {
        userId: user.id,
        modeSlug,
        gamesPlayed: isGameEnd ? 1 : 0,
        gamesWon: isWin ? 1 : 0,
        currentStreak: isWin ? 1 : 0,
        maxStreak: isWin ? 1 : 0,
        distribution: (isWin && totalAttempts) ? 
          [0,0,0,0,0,0].map((v, i) => i === totalAttempts - 1 ? 1 : 0) : 
          [0,0,0,0,0,0],
        lastGameState: gameState,
        lastPlayedDate: date,
        lastCompletedDate: isGameEnd ? date : null,
        lastTargetSong: targetSong,
      },
    });

    return NextResponse.json(updatedStats);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}