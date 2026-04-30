import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Creamos el puente de conexión usando la URL de tu .env.local
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Le pasamos esa conexión al adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializamos Prisma pasándole el adaptador (¡Esto arregla el error rojo!)
const prisma = new PrismaClient({ adapter });

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // De momento lo dejamos vacío. 
        // Luego programaremos la lógica para verificar en Neon.
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    // Cuando acabemos la configuración, apuntaremos esto a tus formularios
    signIn: "/", 
  }
});

export { handler as GET, handler as POST };