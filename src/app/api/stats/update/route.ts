import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Invitado: Stats y progreso no guardados en DB" },
      { status: 200 }
    );
  }

  try {
    const body = await req.json();
    const {
      modeSlug,
      gameState,
      guesses,
      guessDetails,
      targetSong,
      isGameEnd,
      totalAttempts,
      date
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const currentStats = await prisma.modeStat.findUnique({
      where: {
        userId_modeSlug: { userId: user.id, modeSlug },
      },
    });

    const isWin = gameState === "won";

    let updateData: Prisma.ModeStatUpdateInput = {
      lastGameState: gameState,
      lastGuesses: guesses ?? null,
      lastGuessDetails: guessDetails ?? null,
      lastTargetSong: targetSong ?? null,
      lastPlayedDate: date,
    };

    let createData: Prisma.ModeStatUncheckedCreateInput = {
      userId: user.id,
      modeSlug,
      lastGameState: gameState,
      lastGuesses: guesses ?? null,
      lastGuessDetails: guessDetails ?? null,
      lastTargetSong: targetSong ?? null,
      lastPlayedDate: date,
    };

    if (isGameEnd) {
      const newStreak = isWin ? (currentStats?.currentStreak || 0) + 1 : 0;
      const newMaxStreak = Math.max(newStreak, currentStats?.maxStreak || 0);
      const newDistribution = [...(currentStats?.distribution || [0, 0, 0, 0, 0, 0])];

      if (isWin && totalAttempts) {
        const index = Math.max(0, totalAttempts - 1);
        newDistribution[index] += 1;
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

      createData = {
        ...createData,
        gamesPlayed: 1,
        gamesWon: isWin ? 1 : 0,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        distribution: newDistribution,
        lastCompletedDate: date,
      };
    }

    const updatedStats = await prisma.modeStat.upsert({
      where: {
        userId_modeSlug: { userId: user.id, modeSlug },
      },
      update: updateData,
      create: createData,
    });

    return NextResponse.json(updatedStats);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}