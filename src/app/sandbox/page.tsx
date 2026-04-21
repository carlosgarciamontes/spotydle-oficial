'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Clues, { Clue } from '@/components/game/Clues';
import AudioPlayer from '@/components/game/Audioplayer';
import GuessGrid from '@/components/game/GuessGrid'; // IMPORTAMOS EL GUESSGRID

// ==========================================
// SIMULACIÓN DE PARTIDA: "Linkin Park - In The End"
// ==========================================

const gameStep1Start: Clue[] = [
  { id: 1, type: "audio", label: "0:00 - 0:05", status: "active", duration: 5 },
  { id: 2, type: "info", label: "Ficha Técnica", status: "locked", infoData: [{ label: "Año", value: 2001 }, { label: "Género", value: "Nu Metal" }, { label: "BPM", value: 105 }] },
  { id: 3, type: "audio", label: "0:00 - 0:10", status: "locked", duration: 10 },
  { id: 4, type: "info", label: "Vibe Check", status: "locked", infoData: [{ label: "Popularidad", value: "Alta" }, { label: "Explícita", value: "No" }] },
  { id: 5, type: "visual", label: "Portada", status: "locked", imageUrl: "https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b", blurLevel: 15 },
  { id: 6, type: "audio", label: "0:00 - 0:30", status: "locked", duration: 30 },
];

const gameStep2Midgame: Clue[] = [
  { id: 1, type: "audio", label: "0:00 - 0:05", status: "failed", duration: 5, 
    userGuess: { artist: "Evanescence", artistCorrect: false, song: "Bring Me To Life", songCorrect: false } },
  { id: 2, type: "info", label: "Ficha Técnica", status: "failed", infoData: [{ label: "Año", value: 2001 }, { label: "Género", value: "Nu Metal" }, { label: "BPM", value: 105 }], 
    userGuess: { artist: "Linkin Park", artistCorrect: true, song: "Numb", songCorrect: false } },
  { id: 3, type: "audio", label: "0:00 - 0:10", status: "failed", duration: 10, 
    userGuess: { artist: "Limp Bizkit", artistCorrect: false, song: "Break Stuff", songCorrect: false } },
  { id: 4, type: "info", label: "Vibe Check", status: "active", infoData: [{ label: "Popularidad", value: "Alta" }, { label: "Energía", value: "9/10" }] },
  { id: 5, type: "visual", label: "Portada", status: "locked", imageUrl: "https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b", blurLevel: 15 },
  { id: 6, type: "audio", label: "0:00 - 0:30", status: "locked", duration: 30 },
];

const gameStep3Win: Clue[] = [
  { id: 1, type: "audio", label: "0:00 - 0:05", status: "failed", duration: 5, 
    userGuess: { artist: "Evanescence", artistCorrect: false, song: "Bring Me To Life", songCorrect: false } },
  { id: 2, type: "info", label: "Ficha Técnica", status: "failed", infoData: [{ label: "Año", value: 2001 }, { label: "Género", value: "Nu Metal" }, { label: "BPM", value: 105 }], 
    userGuess: { artist: "Linkin Park", artistCorrect: true, song: "Numb", songCorrect: false } },
  { id: 3, type: "audio", label: "0:00 - 0:10", status: "failed", duration: 10, 
    userGuess: { artist: "Limp Bizkit", artistCorrect: false, song: "Break Stuff", songCorrect: false } },
  { id: 4, type: "info", label: "Vibe Check", status: "failed", infoData: [{ label: "Popularidad", value: "Alta" }, { label: "Energía", value: "9/10" }],
    userGuess: { artist: "Linkin Park", artistCorrect: true, song: "Crawling", songCorrect: false } },
  { id: 5, type: "visual", label: "Portada", status: "completed", imageUrl: "https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b", blurLevel: 0,
    userGuess: { artist: "Linkin Park", artistCorrect: true, song: "In The End", songCorrect: true } },
  { id: 6, type: "audio", label: "0:00 - 0:30", status: "locked", duration: 30 },
];


export default function SandboxPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  const intents = ["primary", "outline", "secondary", "ghost"] as const;
  const sizes = ["sm", "default", "lgRounded", "lgSquare", "icon"] as const;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-black text-white flex flex-col items-center pt-20 gap-20 pb-40">
      
      {/* 1. SECCIÓN DE JUEGO PRINCIPAL */}
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-10 text-spotydle text-center">Spotydle Game View</h1>
        
        <div className="flex flex-col border border-sp-dark rounded-[2.5rem] bg-[#121212] overflow-hidden shadow-2xl relative">
          
          {/* Header de la App */}
          <div className="flex items-center justify-between p-6 pb-2">
            <span className="text-spotydle font-black tracking-widest text-lg">SPOTYDLE</span>
            <span className="text-gray-500 text-sm font-bold bg-black/50 px-3 py-1 rounded-full">1/6 Tries</span>
          </div>

          <div className="p-6 pt-2 flex flex-col gap-6">
            
            {/* GUESS GRID - Vista Principal (Vacío al empezar) */}
            <div className="flex justify-center w-full">
              <GuessGrid guesses={[]} />
            </div>

            {/* AUDIO PLAYER */}
            <AudioPlayer 
              isPlaying={isPlaying} 
              onTogglePlay={() => setIsPlaying(!isPlaying)} 
            />
            
            <div className="w-full h-px bg-white/5 my-2"></div>

            {/* PISTAS */}
            <Clues clues={gameStep1Start} />
          </div>
        </div>
      </div>

      {/* --- STORYTELLING (Atributos secundarios) --- */}
      <div className="w-full max-w-4xl mt-20">
        <h2 className="text-2xl font-bold mb-8 text-gray-400 border-b border-gray-800 pb-4">Game States (Storytelling)</h2>
        <div className="flex flex-col gap-12">
          
          <section className="p-6 md:p-10 border border-sp-dark rounded-3xl bg-[#121212] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30"></div>
            <h2 className="text-lg font-bold text-gray-200 mb-2">Turno 4: Tensión en el ambiente</h2>
            <p className="text-sm text-gray-500 mb-8">Ha fallado 3 veces, pero en la pista 2 <span className="text-green-400 font-bold">acertó el artista (Linkin Park)</span>.</p>
            
            {/* GUESS GRID - Turno 4 (Fallo, Parcial, Fallo) */}
            <div className="flex justify-center w-full mb-8">
              <GuessGrid guesses={["wrong", "partial", "wrong"]} />
            </div>

            <Clues clues={gameStep2Midgame} />
          </section>

          <section className="p-6 md:p-10 border border-sp-dark rounded-3xl bg-[#121212] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
            <h2 className="text-lg font-bold text-green-400 mb-2">Turno 5: ¡Victoria Épica!</h2>
            <p className="text-sm text-gray-500 mb-8">La portada borrosa le dio la clave. Adivinó la canción y la pastilla central se corona con la respuesta correcta.</p>
            
            {/* GUESS GRID - Victoria en el 5º intento */}
            <div className="flex justify-center w-full mb-8">
              <GuessGrid guesses={["wrong", "partial", "wrong", "wrong", "correct"]} />
            </div>

            <Clues clues={gameStep3Win} />
          </section>
        </div>
      </div>

      {/* COMPONENTES BASE (Grayscale) */}
      <div className="w-full max-w-5xl overflow-x-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 mt-20">
        <h1 className="text-3xl font-bold mb-10 text-primary">UI Kit: Button Variants</h1>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium text-xs">Size \ Intent</th>
              {intents.map(intent => (
                <th key={intent} className="p-4 border-b border-gray-700 capitalize text-center text-xs">
                  {intent}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400 font-medium capitalize text-xs">
                  {size}
                </td>
                {intents.map(intent => (
                  <td key={intent} className="p-4 text-center">
                    <Button intent={intent} size={size}>
                      {size === 'icon' ? '⭐' : 'Button'}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full max-w-5xl opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        <h1 className="text-3xl font-bold mb-10 text-primary">UI Kit: Inputs</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 p-6 border border-gray-700 rounded-2xl bg-[#121212]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Default</h3>
            <Input variant="default" placeholder="Default input..." />
            <Input variant="default" shape="pill" placeholder="Pill shape..." />
            <Input variant="default" disabled placeholder="Disabled state..." />
          </div>

          <div className="flex flex-col gap-4 p-6 border border-gray-700 rounded-2xl bg-[#1a1a1a]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dark</h3>
            <Input variant="dark" placeholder="Dark input..." />
            <Input variant="dark" shape="pill" placeholder="Pill shape..." />
          </div>

          <div className="flex flex-col gap-4 p-6 border border-gray-700 rounded-2xl bg-gray-800">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Light</h3>
            <Input variant="light" placeholder="Light input..." />
            <Input variant="light" shape="pill" placeholder="Pill shape..." />
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        <h1 className="text-3xl font-bold mb-10 text-spotydle">UI Kit: Auth Forms</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-4 p-8 border border-sp-dark rounded-3xl bg-[#121212]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Login Form</h3>
            <LoginForm />
          </div>
          <div className="flex flex-col gap-4 p-8 border border-sp-dark rounded-3xl bg-[#121212]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Register Form</h3>
            <RegisterForm />
          </div>
        </div>
      </div>

    </div>
  );
}