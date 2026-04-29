"use server";

// ==========================================
// INTERFACES ESTRICTAS
// ==========================================
export interface iTunesTrack {
  artistName: string;
  trackName: string;
  previewUrl: string;
  artworkUrl100: string;
  trackId: number;
  primaryGenreName?: string;
  releaseDate?: string;
}

interface iTunesResponse {
  resultCount: number;
  results: iTunesTrack[];
}

// ==========================================
// FUNCIONES DEL SERVICIO
// ==========================================

/**
 * Busca canciones en iTunes según lo que escriba el usuario
 */
export async function searchSongsGlobal(query: string) {
  if (!query || query.trim() === "") return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fallo en iTunes Search");

    const data: iTunesResponse = await response.json();

    return data.results.map((track) => ({
      id: track.trackId.toString(),
      artist: track.artistName,
      title: track.trackName,
      previewUrl: track.previewUrl,
      // Cambiamos el tamaño de la imagen de 100x100 a 600x600 para que no se vea pixelada
      coverUrl: track.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg"),
    }));
  } catch (error) {
    console.error("Error en searchSongsGlobal (iTunes):", error);
    return [];
  }
}

/**
 * Obtiene una canción aleatoria de una lista de términos populares
 */
export async function getRandomTrackGlobal() {
  const terms = ["Pop", "Rock", "Top Hits", "Latino", "Urban"];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  
  const url = `https://itunes.apple.com/search?term=${randomTerm}&media=music&limit=50`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fallo en iTunes Random");

    const data: iTunesResponse = await response.json();
    
    // Filtramos las que tengan previewUrl (iTunes suele tener casi todas)
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
    };
  } catch (error) {
    console.error("Error en getRandomTrackGlobal (iTunes):", error);
    return null;
  }
}