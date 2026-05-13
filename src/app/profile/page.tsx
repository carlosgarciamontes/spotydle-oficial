"use client";

import React, { useState, useEffect } from "react";
import { ModeStats } from "@/context/GameContext"; // Solo importamos el tipo, no el hook
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Target, Gamepad2, Edit3, X } from "lucide-react";

const AVATARS = [
  { id: "1", emoji: "👽", gradient: "from-purple-500 to-indigo-500" },
  { id: "2", emoji: "🎸", gradient: "from-spotydle to-purple-600" },
  { id: "3", emoji: "🎧", gradient: "from-blue-500 to-cyan-500" },
  { id: "4", emoji: "😎", gradient: "from-yellow-400 to-orange-500" },
  { id: "5", emoji: "👾", gradient: "from-green-400 to-emerald-600" },
  { id: "6", emoji: "🔥", gradient: "from-red-500 to-orange-500" },
  { id: "7", emoji: "👑", gradient: "from-amber-300 to-yellow-500" },
  { id: "8", emoji: "🦄", gradient: "from-pink-400 to-spotydle" },
];

const MODES = [
  { id: "total", label: "Total" },
  { id: "daily", label: "Daily" },
  { id: "urbano", label: "Urbano" },
  { id: "90s", label: "90s" },
  { id: "reggaeton", label: "Reggaeton" },
  { id: "hiphop", label: "Hip Hop" },
  { id: "flow-2000", label: "Flow 2000" },
  { id: "rock", label: "Rock" },
  { id: "flamenkito", label: "Flamenkito" },
];

export default function ProfilePage() {
  // 1. Estados locales para guardar lo que viene de la BD
  const [dbStats, setDbStats] = useState<Record<string, ModeStats>>({});
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("1");
  
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("total");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditingAvatar(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // 2. Cargamos los datos reales desde el servidor
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.avatarId) setSelectedAvatarId(data.avatarId);
          if (data.stats) setDbStats(data.stats);
        }
      } catch (error) {
        console.error("Error al cargar el perfil de la BD", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchProfileData();
  }, []);

  const handleSelectAvatar = async (id: string) => {
    setSelectedAvatarId(id); // Actualizamos visualmente al instante
    setIsEditingAvatar(false);

    try {
      await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId: id }),
      });
    } catch (error) {
      console.error("No se pudo guardar el avatar en la base de datos", error);
    }
  };

  const currentAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];
  
  const getDisplayStats = (): ModeStats => {
    if (activeTab !== "total") {
      // Leemos del estado que vino de la BD, NO del contexto local
      return dbStats[activeTab] || {
        gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0], lastCompletedDate: null,
      };
    }

    return Object.values(dbStats).reduce((acc, mode) => {
      return {
        gamesPlayed: acc.gamesPlayed + mode.gamesPlayed,
        gamesWon: acc.gamesWon + mode.gamesWon,
        currentStreak: Math.max(acc.currentStreak, mode.currentStreak),
        maxStreak: Math.max(acc.maxStreak, mode.maxStreak),
        distribution: acc.distribution.map((val, i) => val + mode.distribution[i]),
        lastCompletedDate: null
      };
    }, {
      gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0], lastCompletedDate: null,
    });
  };

  const currentModeStats = getDisplayStats();
  const winRate = currentModeStats.gamesPlayed > 0 
    ? Math.round((currentModeStats.gamesWon / currentModeStats.gamesPlayed) * 100) 
    : 0;
  const maxDistribution = Math.max(...currentModeStats.distribution, 1);

  if (!isLoaded) return null; // O podrías poner un spinner de carga aquí

  // ... (EL RESTO DEL RETURN SE QUEDA EXACTAMENTE IGUAL) ...
  return (
    <div className="
      min-h-[100dvh] w-full bg-black text-white pb-28 pt-6 md:pt-32 px-4 
      overflow-y-auto 
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-[#1a1a1a]
      [&::-webkit-scrollbar-thumb]:bg-spotydle
      [&::-webkit-scrollbar-thumb]:rounded-full
    ">
      <div className="max-w-md mx-auto flex flex-col gap-8">
        
        {/* SECCIÓN AVATAR */}
        <section className="flex flex-col items-center gap-4 mt-4">
          <div className="relative">
            <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-[0_0_30px_rgba(233,64,150,0.3)] bg-gradient-to-br ${currentAvatar.gradient}`}>
              {currentAvatar.emoji}
            </div>
            <button 
              onClick={() => setIsEditingAvatar(true)} 
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#2A2A2A] rounded-full border-2 border-spotydle flex items-center justify-center text-white hover:bg-spotydle focus:outline-none focus:ring-2 focus:ring-white transition-all shadow-[0_0_15px_rgba(233,64,150,0.5)]"
              aria-label="Cambiar avatar"
            >
              <Edit3 size={18} />
            </button>
          </div>
          <h1 className="text-2xl font-black tracking-wide mt-2">Tu Perfil</h1>
        </section>

        {/* SELECTOR DE MODOS */}
        <section className="
          flex bg-[#1A1A1A] p-1 rounded-2xl border border-white/5 shadow-inner 
          overflow-x-auto snap-x
          [&::-webkit-scrollbar]:h-1.5
          [&::-webkit-scrollbar-track]:bg-[#1a1a1a]
          [&::-webkit-scrollbar-track]:rounded-b-2xl
          [&::-webkit-scrollbar-thumb]:bg-spotydle
          [&::-webkit-scrollbar-thumb]:rounded-full
        ">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveTab(mode.id)}
              className={`flex-1 min-w-[95px] py-2 text-sm font-bold rounded-xl transition-all snap-center focus:outline-none focus:bg-white/5 ${
                activeTab === mode.id 
                  ? "bg-spotydle text-white shadow-[0_0_15px_rgba(233,64,150,0.3)]" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { label: "Jugadas", value: currentModeStats.gamesPlayed, icon: Gamepad2, color: "text-spotydle" },
            { label: "Victorias", value: `${winRate}%`, icon: Target, color: "text-green-400" },
            { label: activeTab === "total" ? "Mejor Racha Act." : "Racha Actual", value: currentModeStats.currentStreak, icon: Flame, color: "text-orange-500" },
            { label: "Mejor Racha", value: currentModeStats.maxStreak, icon: Trophy, color: "text-yellow-400" }
          ].map((item, i) => (
            <motion.div 
              key={`${activeTab}-${i}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1A1A] rounded-3xl p-5 border border-spotydle/20 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(233,64,150,0.05)]"
            >
              <item.icon className={`${item.color} mb-2`} size={28} />
              <span className="text-3xl font-black">{item.value}</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{item.label}</span>
            </motion.div>
          ))}
        </section>

        {/* DISTRIBUCIÓN */}
        <section className="bg-[#1A1A1A] rounded-[2rem] p-6 border border-spotydle/20 shadow-[0_0_25px_rgba(233,64,150,0.1)] mb-4">
          <h3 className="text-lg font-bold mb-6 text-center tracking-tight">
            Distribución {activeTab === "total" ? "Global" : `(${MODES.find(m => m.id === activeTab)?.label})`}
          </h3>
          <div className="flex flex-col gap-3">
            {currentModeStats.distribution.map((count, index) => {
              const widthPercentage = Math.max((count / maxDistribution) * 100, 5);
              return (
                <div key={`${activeTab}-dist-${index}`} className="flex items-center gap-3">
                  <span className="w-4 text-center font-bold text-gray-400">{index + 1}</span>
                  <div className="flex-1 h-6 bg-black/40 rounded-full overflow-hidden flex items-center border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full flex items-center justify-end pr-3 rounded-full shadow-[0_0_10px_rgba(233,64,150,0.3)] ${
                        count > 0 ? 'bg-spotydle text-white' : 'bg-gray-800 text-transparent'
                      }`}
                    >
                      <span className="text-xs font-bold leading-none">{count > 0 ? count : ''}</span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* MODAL DE AVATARES */}
        <AnimatePresence>
          {isEditingAvatar && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setIsEditingAvatar(false)} 
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110]" 
              />
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                  className="pointer-events-auto w-full max-w-[360px] bg-[#1A1A1A] border border-spotydle/40 rounded-[2.5rem] p-6 md:p-8 shadow-[0_0_50px_rgba(233,64,150,0.3)]"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-tight">Elige tu Avatar</h2>
                    <button 
                      onClick={() => setIsEditingAvatar(false)} 
                      className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-spotydle"
                      aria-label="Cerrar"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 md:gap-4">
                    {AVATARS.map((av) => (
                      <button 
                        key={av.id} 
                        onClick={() => handleSelectAvatar(av.id)} 
                        className={`
                          aspect-square rounded-2xl flex items-center justify-center text-3xl md:text-4xl 
                          transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-spotydle/50
                          ${selectedAvatarId === av.id 
                            ? `bg-gradient-to-br ${av.gradient} scale-110 shadow-[0_0_20px_rgba(233,64,150,0.4)] border-2 border-white/50` 
                            : 'bg-[#2A2A2A] hover:bg-[#3A3A3A] opacity-70 hover:opacity-100 border border-white/5'
                          }
                        `}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setIsEditingAvatar(false)}
                    className="w-full mt-8 py-3 bg-[#2A2A2A] rounded-xl font-bold text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors border border-white/5 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    Cerrar
                  </button>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}