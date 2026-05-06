import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";


export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center flex flex-col items-center">
        
        {/* Logo de Spotydle */}
        <Image 
          src="/assets/Spotydle.png"
          alt="Spotydle Logo" 
          width={200} 
          height={60} 
          className="object-contain"
          priority
        />

        <h1 className="text-3xl font-bold text-spotydle mb-5">Spotydle</h1>
        <p className="text-gray-400">Inicia sesión para continuar jugando</p>
      </div>
      <LoginForm />
    </div>
  );
}