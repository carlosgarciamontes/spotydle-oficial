import { PLAYLISTS } from "@/data/playlists";
import { getArtistTopSongs } from "@/services/itunesService";

export async function getDailyTrack(playlistId: string = "test_collab") {
  const artists = PLAYLISTS[playlistId];
  if (!artists || artists.length === 0) return null;

  // 1. Semilla basada en la fecha de hoy
  const today = new Date();
  const seed = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  );

  // 2. Elegimos al artista
  const artistIndex = seed % artists.length;
  const selectedArtist = artists[artistIndex];

  // 3. Obtenemos sus canciones (hasta 200)
  const tracks = await getArtistTopSongs(selectedArtist);
  if (!tracks || tracks.length === 0) return null;

  // 4. Elegimos una canción del array usando la misma semilla
  const trackIndex = (seed * 7) % tracks.length;
  return tracks[trackIndex];
}
