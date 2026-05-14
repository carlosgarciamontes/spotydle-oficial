"use client";

import React, { useState, useEffect } from "react";
import { ModeStats } from "@/context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Target, Gamepad2, Edit3, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

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
  { id: "pop-esp", label: "Pop Español" },
];

export default function ProfilePage() {
  const [dbStats, setDbStats] = useState<Record<string, ModeStats>>({});
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("1");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("total");

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
        console.error("Error al cargar el perfil", error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchProfileData();
  }, []);

  const handleSelectAvatar = async (id: string) => {
    setSelectedAvatarId(id);
    setIsEditingAvatar(false);
    try {
      await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId: id }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const currentAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];
  
  const getDisplayStats = (): ModeStats => {
    if (activeTab !== "total") {
      const stats = dbStats[activeTab];
      return {
        gamesPlayed: stats?.gamesPlayed || 0,
        gamesWon: stats?.gamesWon || 0,
        currentStreak: stats?.currentStreak || 0,
        maxStreak: stats?.maxStreak || 0,
        distribution: (stats?.distribution && Array.isArray(stats.distribution) && stats.distribution.length === 6)
          ? stats.distribution
          : [0, 0, 0, 0, 0, 0],
        lastCompletedDate: stats?.lastCompletedDate || null,
      };
    }

    return Object.values(dbStats).reduce((acc, mode) => {
      const modeDist = Array.isArray(mode.distribution) ? mode.distribution : [0,0,0,0,0,0];
      return {
        gamesPlayed: acc.gamesPlayed + (mode.gamesPlayed || 0),
        gamesWon: acc.gamesWon + (mode.gamesWon || 0),
        currentStreak: Math.max(acc.currentStreak, mode.currentStreak || 0),
        maxStreak: Math.max(acc.maxStreak, mode.maxStreak || 0),
        distribution: acc.distribution.map((val, i) => val + (modeDist[i] || 0)),
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

  if (!isLoaded) return null;

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white pb-32 pt-6 md:pt-32 px-4 overflow-y-auto">
      <div className="max-w-md mx-auto flex flex-col gap-8">
        
        <section className="flex flex-col items-center gap-4 mt-4">
          <div className="relative">
            <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-[0_0_30px_rgba(233,64,150,0.3)] bg-gradient-to-br ${currentAvatar.gradient}`}>
              {currentAvatar.emoji}
            </div>
            <button 
              onClick={() => setIsEditingAvatar(true)} 
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#2A2A2A] rounded-full border-2 border-spotydle flex items-center justify-center text-white hover:bg-spotydle transition-all shadow-lg"
            >
              <Edit3 size={18} />
            </button>
          </div>
          <h1 className="text-2xl font-black tracking-wide mt-2">Tu Perfil</h1>
        </section>

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
              className="bg-[#1A1A1A] rounded-3xl p-5 border border-spotydle/20 flex flex-col items-center justify-center text-center"
            >
              <item.icon className={`${item.color} mb-2`} size={28} />
              <span className="text-3xl font-black">{item.value}</span>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{item.label}</span>
            </motion.div>
          ))}
        </section>

        <section className="bg-[#1A1A1A] rounded-[2rem] p-6 border border-spotydle/20 shadow-lg">
          <h3 className="text-lg font-bold mb-6 text-center">
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
                      className={`h-full flex items-center justify-end pr-3 rounded-full ${
                        count > 0 ? 'bg-spotydle text-white shadow-md' : 'bg-gray-800 text-transparent'
                      }`}
                    >
                      <span className="text-xs font-bold">{count > 0 ? count : ''}</span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- BOTÓN DE LOG OUT AL FINAL --- */}
        <section className="mt-4 mb-8">
          <Button 
            intent="outline"
            size="default"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full rounded-2xl border-white/5 bg-[#1A1A1A] hover:bg-red-500/10 hover:border-red-500/50 text-gray-500 hover:text-red-500 transition-all duration-300 flex items-center justify-center gap-3 font-bold"
          >
            <LogOut size={20} />
            CERRAR SESIÓN
          </Button>
        </section>

        <AnimatePresence>
          {isEditingAvatar && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditingAvatar(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110]" />
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-[360px] bg-[#1A1A1A] border border-spotydle/40 rounded-[2.5rem] p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Elige tu Avatar</h2>
                    <button onClick={() => setIsEditingAvatar(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {AVATARS.map((av) => (
                      <button 
                        key={av.id} 
                        onClick={() => handleSelectAvatar(av.id)} 
                        className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all ${selectedAvatarId === av.id ? `bg-gradient-to-br ${av.gradient} scale-110 border-2 border-white/50` : 'bg-[#2A2A2A] opacity-70'}`}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}