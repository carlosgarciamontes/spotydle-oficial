import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma"; // <-- La misma ruta de tu singleton
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Verificamos quién es el usuario
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Invitado: Stats no guardadas en DB" },
      { status: 200 },
    );
  }

  try {
    const { modeSlug, finalState, totalAttempts } = await req.json();

    // 2. Buscamos el ID del usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user)
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );

    // 3. Buscamos las estadísticas actuales para este modo específico
    const currentStats = await prisma.modeStat.findUnique({
      where: {
        userId_modeSlug: { userId: user.id, modeSlug },
      },
    });

    const isWin = finalState === "won";
    const newStreak = isWin ? (currentStats?.currentStreak || 0) + 1 : 0;
    const newMaxStreak = Math.max(newStreak, currentStats?.maxStreak || 0);

    const newDistribution = [
      ...(currentStats?.distribution || [0, 0, 0, 0, 0, 0]),
    ];

    if (isWin) {
      const index = Math.max(0, totalAttempts - 1);
      newDistribution[index] += 1;
    }

    // 4. UPSERT: Actualiza si existe, crea si no existe
    const updatedStats = await prisma.modeStat.upsert({
      where: {
        userId_modeSlug: { userId: user.id, modeSlug },
      },
      update: {
        gamesPlayed: { increment: 1 },
        gamesWon: { increment: isWin ? 1 : 0 },
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        distribution: newDistribution,
        lastCompletedDate: new Date().toISOString().split("T")[0],
      },
      create: {
        userId: user.id,
        modeSlug,
        gamesPlayed: 1,
        gamesWon: isWin ? 1 : 0,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        distribution: newDistribution,
        lastCompletedDate: new Date().toISOString().split("T")[0],
      },
    });

    return NextResponse.json(updatedStats);
  } catch (error) {
    console.error("Error updating stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
