import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

// Forzamos la carga de las variables desde .env.local
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Apuntamos a la variable que tienes configurada para Neon
    url: process.env.DATABASE_URL, 
  },
});