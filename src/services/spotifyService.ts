"use server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// ==========================================
// INTERFACES PARA TIPAR LA API DE SPOTIFY
// ==========================================
interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
}

interface SpotifyAlbum {
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

// ==========================================
// FUNCIONES DEL SERVICIO
// ==========================================

export async function getSpotifyToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("⚠️ Faltan las credenciales de Spotify en el .env.local");
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Error de Spotify: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error obteniendo el token de Spotify:", error);
    throw error;
  }
}

/*
 Busca canciones en Spotify y devuelve solo lo que necesitamos.
 */
export async function searchSongs(query: string) {
  if (!query || query.trim() === "") return [];

  try {
    const token = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=$?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Fallo al buscar en Spotify");

    const data = (await response.json()) as SpotifySearchResponse;

    return data.tracks.items.map((track) => ({
      id: track.id,
      artist: track.artists.map((a) => a.name).join(", "),
      title: track.name,
      previewUrl: track.preview_url,
      coverUrl: track.album.images[0]?.url,
    }));
  } catch (error) {
    console.error("Error en searchSongs:", error);
    return [];
  }
}
