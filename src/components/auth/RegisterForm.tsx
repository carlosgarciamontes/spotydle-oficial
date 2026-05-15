'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

const RegisterForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        router.push(`/pending-verification?email=${encodeURIComponent(email)}`);
      } else {
        const data = await res.json();
        setError(data.message || "Error al registrar");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Nombre de usuario"
          variant="light"
          shape="pill"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="text-spotydle font-semibold placeholder:text-spotydle/50"
        />
        <Input
          type="email"
          placeholder="Email"
          variant="light"
          shape="pill"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="text-spotydle font-semibold placeholder:text-spotydle/50"
        />
        
        {/* Campo de Contraseña */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            variant="light"
            shape="pill"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="text-spotydle font-semibold placeholder:text-spotydle/50 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-spotydle/50 hover:text-spotydle transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Campo de Confirmar Contraseña con su propio Ojo */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            variant="light"
            shape="pill"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="text-spotydle font-semibold placeholder:text-spotydle/50 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-spotydle/50 hover:text-spotydle transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-2xl animate-in fade-in zoom-in duration-300">
          <p className="text-red-500 text-xs font-bold text-center leading-tight">
            {error}
          </p>
        </div>
      )}

      <Button
        type="submit"
        intent="primary"
        size="lgRounded"
        disabled={isLoading}
        className="w-full justify-center shadow-none disabled:opacity-50"
      >
        {isLoading ? "Cargando..." : "Crear Cuenta"}
      </Button>

      <div className="text-center mt-6">
        <Link 
          href="/login" 
          className="text-spotydle font-bold text-sm hover:underline transition-all"
        >
          ¡Ya tienes una cuenta? ¡Inicia Sesión!
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;