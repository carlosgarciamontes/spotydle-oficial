import { withAuth } from "next-auth/middleware";

// Usamos la versión más simple y directa que Next-Auth garantiza como función
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    "/play/:path*", 
    "/profile/:path*", 
    "/ranking/:path*"
  ],
};