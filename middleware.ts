export { default } from "next-auth/middleware";

// Protegemos la ruta del juego y las futuras rutas privadas
export const config = {
  matcher: [
    "/play/:path*", 
    "/profile/:path*",
    "/leaderboard/:path*"
  ],
};