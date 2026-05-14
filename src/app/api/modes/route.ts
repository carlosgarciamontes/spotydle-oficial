import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { searchSongsGlobal } from "@/services/itunesService"; 

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    let modes = await prisma.gameMode.findMany({
      orderBy: { id: 'asc' },
    });

    if (modes.length === 0) {
      const initialModes = [
        { title: "Daily Challenge", slug: "daily", query: "Top Hits", isLocked: false },
        { title: "Urbano España", slug: "urbano", query: "Hoke", isLocked: false },
        { title: "90's Hits", slug: "90s", query: "Michael Jackson", isLocked: false },
        { title: "Reggaeton Antiguo", slug: "reggaeton", query: "Daddy Yankee", isLocked: false },
        { title: "Hip Hop", slug: "hiphop", query: "50 Cent", isLocked: false },
        { title: "Flow 2000", slug: "flow-2000", query: "Melendi", isLocked: false },
        { title: "Rock Anthems", slug: "rock", query: "Queen", isLocked: false },
        { title: "Pop Español", slug: "pop-esp", query: "Enol", isLocked: false },
      ];

      for (const mode of initialModes) {
        const results = await searchSongsGlobal(mode.query);
        const coverUrl = results.length > 0 ? results[0].coverUrl.replace("100x100bb", "600x600bb") : "";

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

      modes = await prisma.gameMode.findMany({ orderBy: { id: 'asc' } });
    }

    const needsUpdate = modes.filter(m => !m.imageUrl || m.imageUrl === "" || m.imageUrl === "(empty string)");

    if (needsUpdate.length > 0) {
      for (const mode of needsUpdate) {
        const results = await searchSongsGlobal(mode.query);
        if (results.length > 0) {
          const highResCover = results[0].coverUrl.replace("100x100bb", "600x600bb");
          await prisma.gameMode.update({
            where: { id: mode.id },
            data: { imageUrl: highResCover }
          });
        }
      }
      
      modes = await prisma.gameMode.findMany({ orderBy: { id: 'asc' } });
    }

    return NextResponse.json(modes);

  } catch (error) {
    let errorMessage = "Error interno desconocido";
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json(
      { message: "Error interno del servidor", detalle: errorMessage }, 
      { status: 500 }
    );
  }
}