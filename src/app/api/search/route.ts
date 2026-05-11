import { NextResponse } from "next/server";
import { searchSongsGlobal } from "@/services/itunesService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchSongsGlobal(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Error en la búsqueda" }, { status: 500 });
  }
}