"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

function PendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!email) return;

    // Configurar el Polling cada 3 segundos
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/check-verification?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            setIsVerified(true);
            clearInterval(interval);
            // Redirigimos al login tras 2 segundos para que el usuario vea el éxito
            setTimeout(() => {
              router.push("/login?verified=true");
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Error comprobando verificación:", error);
      }
    }, 3000);

    // Limpiar el intervalo si el componente se desmonta
    return () => clearInterval(interval);
  }, [email, router]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>No se ha proporcionado ningún correo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="text-center bg-[#1A1A1A] p-8 md:p-12 rounded-[2.5rem] border border-white/10 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {!isVerified ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-spotydle/20 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 border-4 border-spotydle rounded-full animate-ping opacity-20"></div>
              <svg className="w-10 h-10 text-spotydle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-black italic mb-2 tracking-wide">REVISA TU BANDEJA</h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Hemos enviado un enlace mágico a <br/>
              <strong className="text-white bg-white/10 px-2 py-1 rounded mt-1 inline-block">{email}</strong>
            </p>
            
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest animate-pulse">
              Esperando confirmación...
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-green-400 italic mb-2 tracking-wide">¡VERIFICADO!</h1>
            <p className="text-gray-400 text-sm mb-6">Redirigiendo para que inicies sesión...</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default function PendingVerificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <PendingContent />
    </Suspense>
  );
}