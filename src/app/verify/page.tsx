"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      // Si no hay token, marcamos error y salimos
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus("success");
          // Redirigimos al login tras 3 segundos de éxito
          setTimeout(() => router.push("/"), 3000); 
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error verificando:", error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="text-center bg-[#1A1A1A] p-8 rounded-[2.5rem] border border-white/10 max-w-sm w-full shadow-2xl">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-spotydle border-t-transparent rounded-full animate-spin" />
            <p className="text-spotydle font-bold tracking-widest uppercase text-xs">Verificando cuenta...</p>
          </div>
        )}

        {status === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h1 className="text-2xl font-black text-green-400 mb-2 italic">¡LISTO!</h1>
            <p className="text-gray-400 text-sm mb-6 font-medium">Tu correo ha sido verificado. Prepárate para jugar...</p>
            <div className="text-xs text-gray-500 animate-pulse">Redirigiendo al inicio...</div>
          </motion.div>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-black text-red-500 mb-2 italic">ERROR</h1>
            <p className="text-gray-400 text-sm mb-8 font-medium">El enlace no es válido o ha expirado.</p>
            <Link 
              href="/" 
              className="inline-block bg-white text-black px-8 py-3 rounded-xl text-sm font-black uppercase tracking-tighter hover:bg-spotydle hover:text-white transition-all shadow-lg"
            >
              Volver a la App
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <VerifyContent />
    </Suspense>
  );
}