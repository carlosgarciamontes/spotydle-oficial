import { PLAYLISTS } from "@/data/playlists";
import { getSongsByArtistId } from "@/services/itunesService";

export async function getDailyTrack() {
  // 1. Cargamos tu lista de IDs específicos para el modo Daily
  const artists = PLAYLISTS["daily" as keyof typeof PLAYLISTS];
  
  if (!artists || artists.length === 0) {
    return null;
  }

  // 2. Generamos la semilla numérica basada en el día de hoy (ej: 20260512)
  const today = new Date();
  const seed = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  );

  // 3. Elegimos al artista matemáticamente (hoy será X, mañana Y)
  const artistIndex = seed % artists.length;
  const selectedArtistId = String(artists[artistIndex]);

  // 4. Traemos su top de canciones desde nuestra API optimizada
  const tracks = await getSongsByArtistId(selectedArtistId);
  
  if (!tracks || tracks.length === 0) {
    return null;
  }

  // 5. Elegimos la canción de ese artista (el * 7 aporta dispersión matemática)
  const trackIndex = (seed * 7) % tracks.length;
  
  return tracks[trackIndex];
}