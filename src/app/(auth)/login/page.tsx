import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
      <div className="mb-8 text-center flex flex-col items-center">
        
        <Image 
          src="/assets/Spotydle.png"
          alt="Spotydle Logo" 
          width={200} 
          height={60} 
          className="object-contain"
          priority
        />

        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight mb-5 uppercase">
          Spotydle
        </h1>
        
        <p className="text-gray-400 font-medium">¡Inicia sesión para continuar jugando!</p>
      </div>
      <LoginForm />
    </div>
  );
}