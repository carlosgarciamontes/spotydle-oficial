import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { avatarId } = await req.json();

    if (!avatarId) {
      return NextResponse.json({ error: "Falta el ID del avatar" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { avatarId: String(avatarId) },
    });

    return NextResponse.json({ success: true, avatarId: updatedUser.avatarId });
  } catch (error) {
    console.error("Error al actualizar avatar:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}