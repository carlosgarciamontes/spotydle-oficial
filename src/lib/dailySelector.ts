import { PLAYLISTS } from "@/data/playlists";
import { getSongsByArtistId } from "@/services/itunesService";

export async function getDailyModeTrack(modeSlug: string) {
  const artists = PLAYLISTS[modeSlug as keyof typeof PLAYLISTS];
  
  if (!artists || artists.length === 0) return null;

  const today = new Date();
  
  let slugModifier = 0;
  for (let i = 0; i < modeSlug.length; i++) {
    slugModifier += modeSlug.charCodeAt(i);
  }

  const seed = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  ) + slugModifier;

  const artistIndex = seed % artists.length;
  const selectedArtistId = String(artists[artistIndex]);

  const tracks = await getSongsByArtistId(selectedArtistId);
  
  if (!tracks || tracks.length === 0) return null;

  const sortedTracks = [...tracks].sort((a, b) => 
    String(a.title).localeCompare(String(b.title))
  );

  const trackIndex = (seed * 7) % sortedTracks.length;
  
  return sortedTracks[trackIndex];
}