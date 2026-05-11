"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import LevelCard from "@/components/ui/LevelCard";

// Asegúrate de que esta interfaz coincida exactamente con lo que devuelve tu Prisma/API
interface GameMode {
  id: string;
  title: string;
  imageUrl: string; 
  isLocked: boolean;
}

export default function PlayMenuPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [modes, setModes] = useState<GameMode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGameModes = async () => {
      try {
        // Llamada REAL a tu endpoint. 
        // Cambia '/api/modes' por la ruta exacta que hayas creado en tu backend.
        const response = await fetch('/api/modes'); 
        
        if (!response.ok) {
          throw new Error('Fallo al obtener los modos de juego');
        }

        const data = await response.json();
        setModes(data);
      } catch (err) {
        console.error("Error de conexión:", err);
        setError("No se han podido cargar los modos de juego.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameModes();
  }, []);

  return (
    <div className="px-6 pb-24 pt-12 md:pt-[130px] font-sans">
      <div className="max-w-4xl mx-auto relative">
        
        {/* --- HEADER MÓVIL --- */}
        {/* ... (Tu código del header y logo de Spotydle se queda igual) ... */}

        {/* --- BIENVENIDA Y LOG OUT --- */}
        <div className="relative text-center mb-12 animate-fade-in-down">
          <h2 className="text-3xl md:text-[40px] md:leading-tight font-bold text-white">
            Welcome <br />
            <span className="text-spotydle">{session?.user?.name || "Player"}!</span>
          </h2>
          <p className="text-white font-bold text-sm md:text-lg pt-4 md:pt-6">
            Choose your mode!
          </p>

          <div className="hidden md:block absolute top-0 right-4">
            <Button 
              intent="outline"
              size="default"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="shadow-[0_0_15px_rgba(233,64,150,0.3)]"
            >
              Log Out
            </Button>
          </div>
        </div>

        {/* --- GRID DE MODOS DE JUEGO (DATOS REALES) --- */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-spotydle border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 font-bold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {modes.map((mode) => (
            <LevelCard
              key={mode.id}
              title={mode.title}
              imageUrl={mode.imageUrl} 
              isLocked={mode.isLocked}
              onClick={() => router.push(`/play/${mode.slug}`)}
            />
          ))}
        </div>
        )}

      </div>
    </div>
  );
}