import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
      
      <div className="text-center flex flex-col items-center w-full max-w-xs">
        
        {/* Logo */}
        <Image 
          src="/assets/Spotydle.png" 
          alt="Spotydle Logo" 
          width={280} 
          height={90} 
          className="mb-3 object-contain"
          priority 
        />
        
        {/* Nombre de la marca */}
        <h1 className="text-3xl font-bold text-white tracking-wide mb-2">
          Spotydle
        </h1>
        
        {/* Frase gancho */}
        <p className="text-sm font-medium text-gray-400 mb-10">
          Adivina la canción diaria en 1 segundo.
        </p>

        {/* Contenedor de los botones */}
        <div className="flex flex-col gap-3 w-full">
          <Link href="/register" className="w-full">
            <Button intent="primary" size="lgRounded" className="w-full text-lg font-bold py-5">
              Crear cuenta
            </Button>
          </Link>
          
          <Link href="/login" className="w-full">
            <Button intent="outline" size="lgRounded" className="w-full text-lg font-bold py-5">
              Iniciar sesión
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}