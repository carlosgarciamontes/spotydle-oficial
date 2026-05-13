import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ message: "Token requerido" }, { status: 400 });
    }

    // 1. Buscamos al usuario que tenga ese token
    const user = await prisma.user.findUnique({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: "Token inválido o expirado" }, { status: 400 });
    }

    // 2. Actualizamos al usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(), // Guardamos la fecha de verificación
        verifyToken: null,         // Limpiamos el token por seguridad
      },
    });

    return NextResponse.json({ message: "Email verificado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error en verify-email API:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}