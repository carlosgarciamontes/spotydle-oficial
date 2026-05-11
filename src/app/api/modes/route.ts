import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { searchSongsGlobal } from "@/services/itunesService"; 

// ==========================================
// CONFIGURACIÓN EXACTA DE PRISMA
// ==========================================
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // 1. Buscamos si ya existen modos en la base de datos
    let modes = await prisma.gameMode.findMany({
      orderBy: { id: 'asc' },
    });

    // 2. Si la tabla está vacía, la poblamos automáticamente
    if (modes.length === 0) {
      console.log("Base de datos vacía. Generando modos desde Apple Music...");

      // Lista inicial basada en tu maquetación anterior
      const initialModes = [
        { title: "Daily Challenge", slug: "daily", query: "Top Hits", isLocked: false },
        { title: "Urbano España", slug: "urbano", query: "Hoke", isLocked: false },
        { title: "90's Hits", slug: "90s", query: "Michael Jackson", isLocked: false },
        { title: "Reggaeton Antiguo", slug: "reggaeton", query: "Daddy Yankee", isLocked: false },
        { title: "Hip Hop", slug: "hiphop", query: "50 Cent", isLocked: false },
        { title: "Flow 2000", slug: "flow-2000", query: "Melendi", isLocked: false },
        { title: "Rock Anthems", slug: "rock", query: "Queen", isLocked: false },
        { title: "Flamenkito", slug: "flamenkito", query: "Camarón de la Isla", isLocked: false },
      ];

      for (const mode of initialModes) {
        // Buscamos en Apple Music a través de tu servicio
        const results = await searchSongsGlobal(mode.query);
        
        // Obtenemos la portada (600x600) si hay resultados válidos
        const coverUrl = results.length > 0 ? results[0].coverUrl : "";

        // Lo guardamos en PostgreSQL
        await prisma.gameMode.create({
          data: {
            title: mode.title,
            slug: mode.slug,
            query: mode.query,
            imageUrl: coverUrl,
            isLocked: mode.isLocked,
          },
        });
      }

      // Volvemos a leer la base de datos, ahora con los datos inyectados
      modes = await prisma.gameMode.findMany({
        orderBy: { id: 'asc' },
      });
      
      console.log("¡Nuevos modos guardados en la BD!");
    }

    // 3. Devolvemos los datos al Frontend
    return NextResponse.json(modes);

  } catch (error) {
    // 🔴 NUESTRO CHIVATO (Tipado correctamente, igual que en el Auth)
    let errorMessage = "Error interno desconocido";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    console.error("🔴 EXPLOSIÓN EN LOS MODOS:", errorMessage);
    
    return NextResponse.json(
      { message: "Error interno del servidor", detalle: errorMessage }, 
      { status: 500 }
    );
  }
}