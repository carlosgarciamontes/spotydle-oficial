"use server";

export interface iTunesTrack {
  artistName: string;
  trackName: string;
  previewUrl: string;
  artworkUrl100: string;
  trackId: number;
  primaryGenreName?: string;
  releaseDate?: string;
  trackExplicitness?: string;
}

interface iTunesResponse {
  resultCount: number;
  results: iTunesTrack[];
}

export async function searchSongsGlobal(query: string) {
  if (!query || query.trim() === "") return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&country=ES&limit=50`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fallo en iTunes Search");

    const data: iTunesResponse = await response.json();

    const uniqueSongs = new Map();

    data.results.forEach((track) => {
      const artist = track.artistName;
      const rawTitle = track.trackName;

      const uniqueKey = `${artist.toLowerCase()}-${rawTitle.toLowerCase()}`;

      if (!uniqueSongs.has(uniqueKey)) {
        uniqueSongs.set(uniqueKey, {
          id: track.trackId.toString(),
          artist: artist,
          title: rawTitle, 
          previewUrl: track.previewUrl,
          coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg") : "",
        });
      }
    });

    return Array.from(uniqueSongs.values()).slice(0, 50);
  } catch (error) {
    console.error("Error en searchSongsGlobal:", error);
    return [];
  }
}

export async function getSongsByArtistId(artistId: string) {
  const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=200&country=ES`;

  try {
    const response = await fetch(url, { cache: "no-store" }); 
    if (!response.ok) throw new Error("Fallo en iTunes Search Artist");

    const data: iTunesResponse = await response.json();
    
    const validTracks = data.results.filter((track) => track.previewUrl);

    return validTracks.map((track) => ({
      artist: track.artistName,
      title: track.trackName,
      previewUrl: track.previewUrl,
      coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg") : "",
      releaseYear: track.releaseDate ? new Date(track.releaseDate).getFullYear() : 2024,
      genre: track.primaryGenreName || "Music",
      isExplicit: track.trackExplicitness === "explicit"
    }));
  } catch (error) {
    console.error("Error en getSongsByArtistId:", error);
    return [];
  }
}

export async function getRandomTrackGlobal() {
  const terms = ["Pop", "Rock", "Top Hits", "Latino", "Urban", "Hits España"];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(randomTerm)}&media=music&limit=100`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Fallo en iTunes Random");

    const data: iTunesResponse = await response.json();
    const validTracks = data.results.filter((track) => track.previewUrl);

    if (validTracks.length === 0) return null;

    const selected = validTracks[Math.floor(Math.random() * validTracks.length)];

    return {
      artist: selected.artistName,
      title: selected.trackName,
      previewUrl: selected.previewUrl,
      coverUrl: selected.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg"),
      releaseYear: selected.releaseDate ? new Date(selected.releaseDate).getFullYear() : 2024,
      genre: selected.primaryGenreName || "Music",
      isExplicit: selected.trackExplicitness === "explicit"
    };
  } catch (error) {
    console.error("Error en getRandomTrackGlobal:", error);
    return null;
  }
}