const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

/*
 Función central para obtener el Token de Acceso.
 Este token funciona como un "Pase VIP" temporal que dura 1 hora.
 */
export async function getSpotifyToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("⚠️ Faltan las credenciales de Spotify en el .env.local");
  }

  // Preparamos el cuerpo de la petición según la documentación de Spotify
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      // TRUCO NEXT.JS: Como el token dura 1 hora (3600 segundos), 
      // le decimos a Next.js que guarde la respuesta en caché ese tiempo
      // para no bombardear a la API de Spotify con peticiones inútiles.
      next: { revalidate: 3600 } 
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