"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <-- Añadimos el router para redirigir
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const RegisterForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para manejar la experiencia de usuario
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        setUsername("");
        setEmail("");
        setPassword("");
        router.push("/login");
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
          placeholder="Username"
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
        <Input
          type="password"
          placeholder="Password"
          variant="light"
          shape="pill"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="text-spotydle font-semibold placeholder:text-spotydle/50"
        />
      </div>

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <p className="text-red-500 text-sm font-semibold text-center">
          {error}
        </p>
      )}

      <div className="h-2"></div>

      <Button
        type="submit"
        intent="primary"
        size="lgRounded"
        disabled={isLoading}
        className="w-full justify-center shadow-none disabled:opacity-50"
      >
        {isLoading ? "Cargando..." : "Sign up"}
      </Button>

      <Link href="/login" className="w-full block">
        <Button
          type="button"
          intent="ghost"
          size="default"
          className="w-full text-spotydle hover:underline font-bold"
        >
          Already have an account? Log in
        </Button>
      </Link>
    </form>
  );
};

export default RegisterForm;
