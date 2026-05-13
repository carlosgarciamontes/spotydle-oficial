import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    // Devuelve true si existe y la fecha no es nula
    return NextResponse.json({ verified: !!user?.emailVerified });
  } catch (error) {
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}