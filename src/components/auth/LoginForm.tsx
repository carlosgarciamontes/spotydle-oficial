'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link'; 
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff } from "lucide-react"; 

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, 
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Email o contraseña incorrectos');
        } else {
          setError(result.error);
        }
      } else {
        router.push('/play'); 
        router.refresh(); 
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/play' }); 
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div className="space-y-4">
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
        
        {/* Input de Contraseña con el ojo */}
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
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
      </div>

      <div className="flex items-center gap-3 pl-4">
        <div className="relative flex items-center">
          <input 
            type="checkbox" 
            id="keep-signed" 
            className="peer h-5 w-5 cursor-pointer appearance-none rounded bg-white checked:bg-spotydle transition-all border-none"
          />
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-black" viewBox="0 0 14 14" fill="none">
            <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <label htmlFor="keep-signed" className="text-spotydle font-bold text-sm cursor-pointer select-none">
          Keep signed in
        </label>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-2xl animate-in fade-in zoom-in duration-300">
          <p className="text-red-500 text-xs font-bold text-center leading-tight">
            {error}
          </p>
        </div>
      )}

      <div className="h-1"></div>

      <Button 
        type="button"
        intent="outline"
        size="lgRounded"
        className="w-full justify-center gap-2"
        onClick={handleGoogleLogin}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <Button 
        type="submit" 
        intent="primary" 
        size="lgRounded" 
        disabled={isLoading}
        className="w-full justify-center shadow-none disabled:opacity-50"
      >
        {isLoading ? 'Cargando...' : 'Sign in'}
      </Button>

      <div className="text-center mt-6">
        <Link 
          href="/register" 
          className="text-spotydle font-bold text-sm hover:underline transition-all"
        >
          Do not have an account? Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;