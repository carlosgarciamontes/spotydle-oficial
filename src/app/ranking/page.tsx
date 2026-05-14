"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface AvatarDef {
  id: string;
  emoji: string;
  gradient: string;
}

interface RankItem {
  id: string;
  name: string;
  avatarId: string;
  gamesWon: number;
  winRate: number;
  rank: number;
}

interface RankingResponse {
  leaderboard: RankItem[];
  currentUserRank: RankItem | null;
}

const AVATARS: AvatarDef[] = [
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

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<string>("total");
  const [leaderboard, setLeaderboard] = useState<RankItem[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<RankItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      try {
        // Al cambiar el ID en MODES, ahora enviará correctamente ?mode=pop-esp
        const res = await fetch(`/api/ranking?mode=${activeTab}`);
        if (!res.ok) throw new Error("Error al cargar el ranking");
        const data: RankingResponse = await res.json();
        setLeaderboard(data.leaderboard);
        setCurrentUserRank(data.currentUserRank);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRanking();
  }, [activeTab]);

  const getAvatar = (id: string): AvatarDef => {
    return AVATARS.find(a => a.id === id) || AVATARS[0];
  };

  return (
    <div className="
      min-h-[100dvh] w-full bg-black text-white pb-28 pt-6 md:pt-32 px-4 
      overflow-y-auto
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-[#1a1a1a]
      [&::-webkit-scrollbar-thumb]:bg-spotydle
      [&::-webkit-scrollbar-thumb]:rounded-full
    ">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        
        <header className="text-center mt-2 md:mt-0">
          <h1 className="text-3xl font-black tracking-widest mb-1 italic text-white">RANKINGS</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Los mejores de Spotydle</p>
        </header>

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
              className={`flex-1 min-w-[95px] py-2 text-sm font-bold rounded-xl transition-all snap-center focus:outline-none ${
                activeTab === mode.id 
                  ? "bg-spotydle text-white shadow-[0_0_15px_rgba(233,64,150,0.3)]" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <span className="italic font-bold text-spotydle animate-pulse tracking-widest">Cargando leyendas...</span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 text-gray-500 italic">
            Aún no hay ganadores en este modo. ¡Sé el primero!
          </div>
        ) : (
          <>
            <div className="flex items-end justify-center gap-2 md:gap-6 mt-10 mb-8 min-h-[12rem]">
              {leaderboard[1] && <PodiumCard user={leaderboard[1]} rank={2} avatar={getAvatar(leaderboard[1].avatarId)} isCurrentUser={currentUserRank?.id === leaderboard[1].id} />}
              {leaderboard[0] && <PodiumCard user={leaderboard[0]} rank={1} avatar={getAvatar(leaderboard[0].avatarId)} isCurrentUser={currentUserRank?.id === leaderboard[0].id} />}
              {leaderboard[2] && <PodiumCard user={leaderboard[2]} rank={3} avatar={getAvatar(leaderboard[2].avatarId)} isCurrentUser={currentUserRank?.id === leaderboard[2].id} />}
            </div>

            <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl mb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="py-4 pl-6 font-black w-2/3">Usuario</th>
                    <th className="py-4 text-center font-black">Victorias</th>
                    <th className="py-4 pr-6 text-right font-black">Winrate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.slice(3).map((user, index) => {
                    const avatar = getAvatar(user.avatarId);
                    const isCurrentUser = currentUserRank?.id === user.id;

                    return (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: index * 0.05 }}
                        key={user.id} 
                        className={`group transition-colors ${isCurrentUser ? "bg-spotydle/10 border-l-2 border-spotydle" : "hover:bg-white/5"}`}
                      >
                        <td className="py-4 pl-6 flex items-center gap-3 md:gap-4">
                          <span className={`text-xs font-bold w-4 md:w-6 ${isCurrentUser ? "text-spotydle" : "text-gray-600"}`}>{user.rank}</span>
                          <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center text-lg md:text-xl bg-gradient-to-br ${avatar.gradient} shadow-lg ${isCurrentUser ? "ring-2 ring-spotydle" : ""}`}>
                            {avatar.emoji}
                          </div>
                          <span className={`font-bold text-sm md:text-base truncate max-w-[100px] md:max-w-[200px] ${isCurrentUser ? "text-white" : ""}`}>
                            {user.name} {isCurrentUser && <span className="text-spotydle text-xs ml-1">(Tú)</span>}
                          </span>
                        </td>
                        <td className={`py-4 text-center font-black text-sm md:text-base ${isCurrentUser ? "text-white" : "text-spotydle"}`}>
                          {user.gamesWon}
                        </td>
                        <td className="py-4 pr-6 text-right font-mono text-xs md:text-sm text-gray-400">
                          {user.winRate}%
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {currentUserRank && currentUserRank.rank > 3 && (
        <div className="fixed bottom-[88px] left-0 right-0 px-4 z-40 md:bottom-10 pointer-events-none">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-2xl mx-auto bg-spotydle p-[2px] rounded-2xl shadow-[0_0_30px_rgba(233,64,150,0.4)] pointer-events-auto"
          >
            <div className="bg-[#1A1A1A] rounded-[14px] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-spotydle font-black text-lg">#{currentUserRank.rank}</span>
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${getAvatar(currentUserRank.avatarId).gradient}`}>
                  {getAvatar(currentUserRank.avatarId).emoji}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Tu posición</p>
                  <p className="font-black text-white text-sm truncate max-w-[100px]">{currentUserRank.name}</p>
                </div>
              </div>
              
              <div className="flex gap-4 md:gap-6 text-right shrink-0">
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Wins</p>
                  <p className="font-black text-spotydle">{currentUserRank.gamesWon}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-bold">WR</p>
                  <p className="font-black text-white">{currentUserRank.winRate}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface PodiumCardProps {
  user: RankItem;
  rank: number;
  avatar: AvatarDef;
  isCurrentUser?: boolean;
}

function PodiumCard({ user, rank, avatar, isCurrentUser }: PodiumCardProps) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  
  const trophyColor = isFirst ? 'text-yellow-400' : isSecond ? 'text-gray-300' : 'text-amber-600';
  const ringColor = isFirst ? 'ring-spotydle shadow-spotydle/40' : 'ring-white/10';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center relative w-1/3 ${isFirst ? 'z-10 scale-110 mb-8' : 'scale-90 opacity-90 mb-2'}`}
    >
      <div className="relative mb-3 flex flex-col items-center">
        <div className={`
          rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br ${avatar.gradient}
          ${isFirst ? `w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl ring-4 ${ringColor}` : `w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl ring-2 ${ringColor}`}
          ${isCurrentUser ? 'ring-offset-2 ring-offset-black ring-spotydle' : ''}
        `}>
          {avatar.emoji}
        </div>
        
        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 ${trophyColor} ${isFirst ? 'scale-125 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : ''}`}>
          <Trophy size={isFirst ? 28 : 22} fill="currentColor" />
        </div>
        
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black italic bg-white text-black shadow-xl">
          #{rank}
        </div>
      </div>
      
      <span className="font-black text-xs md:text-sm text-center leading-tight mt-1 break-words w-full px-1">
        {user.name} {isCurrentUser && <span className="text-spotydle ml-1">(Tú)</span>}
      </span>
      <span className="text-[10px] font-bold text-spotydle uppercase tracking-widest mt-0.5">
        {user.gamesWon} Wins
      </span>
      <span className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">
        WR {user.winRate}%
      </span>
    </motion.div>
  );
}