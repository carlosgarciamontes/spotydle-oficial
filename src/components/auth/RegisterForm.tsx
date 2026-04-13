"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Datos de registro capturados:", { username, email, password });
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

      <div className="h-2"></div>

      <Button
        type="submit"
        intent="primary"
        size="lgRounded"
        className="w-full justify-center shadow-none"
      >
        Sign up
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
