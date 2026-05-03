import { PLAYLISTS } from "@/data/playlists";
import { getArtistTopSongs } from "@/services/itunesService";

export async function getDailyTrack(playlistId: string = "test_collab") {
  console.log("--- INICIANDO SELECTOR DIARIO ---");
  console.log("Buscando en playlist:", playlistId);

  const artists = PLAYLISTS[playlistId];
  if (!artists || artists.length === 0) {
    console.log("❌ CABLE CORTADO: No se encontró la playlist en el archivo");
    return null;
  }

  const today = new Date();
  const seed = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  );

  const artistIndex = seed % artists.length;
  const selectedArtistId = String(artists[artistIndex]);
  console.log(`👤 ID Seleccionado de la lista: ${selectedArtistId}`);

  const tracks = await getArtistTopSongs(selectedArtistId);
  if (!tracks || tracks.length === 0) {
    console.log("❌ CABLE CORTADO: El servicio de iTunes devolvió un array vacío");
    return null;
  }

  const trackIndex = (seed * 7) % tracks.length;
  console.log(`✅ ¡ÉXITO! Canción seleccionada: ${tracks[trackIndex].title}`);
  
  return tracks[trackIndex];
}