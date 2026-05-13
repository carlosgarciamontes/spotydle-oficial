import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Configuramos el transporte de Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!email || !password || !username) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Formato de correo inválido" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "El correo ya está en uso" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: hashedPassword,
        verifyToken: verificationToken,
      },
    });

    const verifyLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;

    // Enviamos el email usando Nodemailer
    await transporter.sendMail({
      from: `"Spotydle" <${process.env.EMAIL_USER}>`,
      to: email, // ¡Ahora puedes enviar a cualquier correo real!
      subject: "🎵 Verifica tu cuenta en Spotydle",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border-radius: 20px;">
          <h1 style="color: #E94096; font-style: italic; font-weight: 900;">SPOTYDLE</h1>
          <p style="font-size: 16px; color: #ccc;">¡Hola ${username}!</p>
          <p style="font-size: 16px; color: #ccc;">Estás a un solo paso de empezar a jugar y demostrar cuánto sabes de música. Haz clic en el botón de abajo para verificar tu cuenta:</p>
          <a href="${verifyLink}" style="display: inline-block; background-color: #E94096; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px; font-size: 16px;">Verificar mi cuenta</a>
          <p style="font-size: 12px; color: #666; margin-top: 40px;">Si no has creado esta cuenta, puedes ignorar este correo.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Cuenta creada. Por favor, revisa tu correo para verificarla." }, 
      { status: 201 }
    );

  } catch (error) {
    let errorMessage = "Error interno desconocido";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    console.error("🔴 EXPLOSIÓN EN EL REGISTRO:", errorMessage);
    
    return NextResponse.json(
      { message: "Error interno del servidor", detalle: errorMessage }, 
      { status: 500 }
    );
  }
}