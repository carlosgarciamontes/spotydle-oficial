import React, { useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { SiApple } from "react-icons/si";
import { motion, AnimatePresence } from 'framer-motion';
import { GuessResult } from './GuessGrid';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface WinModalProps {
  isOpen: boolean;
  modeName: string; // Nueva prop
  songData: {
    title: string;
    artist: string;
    coverUrl: string;
    appleMusicUrl?: string;
  };
  guesses: GuessResult[];
  hasWon: boolean;
  onBackToMenu: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ isOpen, modeName, songData, guesses = [], hasWon, onBackToMenu }) => {

  useEffect(() => {
    if (isOpen && hasWon) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#E24F9C', '#4FE24F', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#E94096', '#4FE24F', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      const timer = setTimeout(() => frame(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasWon]);

  const generateEmojiGrid = () => {
    const emojiMap: Record<GuessResult, string> = { correct: "🟩", partial: "🟨", wrong: "🟥", empty: "⬛" };
    return Array.from({ length: 6 }).map((_, i) => emojiMap[guesses[i] || "empty"]).join("");
  };

  const attemptCount = hasWon ? guesses.filter(g => g !== "empty").length : "X";
  
  // Mensaje actualizado con el nombre del modo
  const shareText = `Spotydle ${modeName}🎵\n${attemptCount}/6\n\n${generateEmojiGrid()}\n\n¿Puedes superarlo? Juega aquí:`;
  const shareUrl = "https://spotydle.com";

  const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const getCleanAppleLink = () => {
    if (songData.appleMusicUrl) return songData.appleMusicUrl;

    const normalizeText = (text: string) => {
      return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, '')
        .trim();
    };

    const cleanTitle = normalizeText(
      songData.title
        .replace(/\s*[([].*?[)\]]/g, '') 
        .replace(/\s*-\s*(Single|EP|Remastered|Album|Deluxe|Remix).*/i, '')
    );

    const cleanArtist = normalizeText(
      songData.artist.split(/ feat\.? | ft\.? | & | y | x | \+ |, /i)[0]
    );

    return `https://music.apple.com/search?term=${encodeURIComponent(cleanTitle)}+${encodeURIComponent(cleanArtist)}`;
  };

  const appleMusicUrl = getCleanAppleLink();

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Spotydle - ${modeName}`, text: shareText, url: shareUrl });
      } catch (error) {
        console.log('Error compartiendo', error);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("¡Resultados copiados al portapapeles!"); 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 max-[380px]:px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          
          <motion.div 
            initial={{ y: '100vh', opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: '100vh', opacity: 0 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
            className="relative z-10 w-full max-w-sm flex flex-col items-center max-h-[100dvh] overflow-y-auto py-6 max-[380px]:py-4"
          >
            <h1 className={`text-4xl max-[380px]:text-3xl font-black mb-8 max-[380px]:mb-4 tracking-widest text-center shrink-0 ${hasWon ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
              {hasWon ? 'YOU WIN!' : 'GAME OVER'}
            </h1>
            
            <div className={`w-full bg-[#2A2A2A] rounded-[2.5rem] max-[380px]:rounded-[2rem] p-8 max-[380px]:p-5 border shadow-2xl flex flex-col items-center mb-10 max-[380px]:mb-6 transition-colors shrink-0 ${hasWon ? 'border-green-400/50 shadow-[0_0_40px_rgba(74,222,128,0.2)]' : 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]'}`}>
              <Image 
                src={songData.coverUrl} 
                alt={`${songData.artist} - ${songData.title}`} 
                width={400} 
                height={400} 
                className="w-full max-[380px]:w-[200px] aspect-square rounded-[2rem] max-[380px]:rounded-[1.5rem] object-cover mb-12 max-[380px]:mb-4 shadow-inner" 
              />
              <h2 className="text-white font-bold text-[1.1rem] max-[380px]:text-base text-center px-4 max-[380px]:px-2 pb-2 max-[380px]:pb-1">
                {songData.artist} - {songData.title}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-6 max-[380px]:gap-4 mb-12 max-[380px]:mb-6 shrink-0">
              <button onClick={handleGenericShare} className="w-16 h-16 max-[380px]:w-14 max-[380px]:h-14 rounded-full bg-spotydle flex items-center justify-center shadow-[0_0_20px_rgba(233,64,150,0.6)] active:scale-95 transition-transform hover:scale-105" aria-label="Compartir resultados">
                <Share2 size={28} className="text-white max-[380px]:w-6 max-[380px]:h-6" />
              </button>
              <a href={twitterIntent} target="_blank" rel="noopener noreferrer" className="w-16 h-16 max-[380px]:w-14 max-[380px]:h-14 rounded-full bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 active:scale-95 transition-transform hover:scale-105" aria-label="Compartir en X">
                <FaXTwitter size={26} className="text-white max-[380px]:w-5 max-[380px]:h-5" />
              </a>
              <a href={appleMusicUrl} target="_blank" rel="noopener noreferrer" className="w-16 h-16 max-[380px]:w-14 max-[380px]:h-14 rounded-full bg-[#FA243C] flex items-center justify-center shadow-[0_0_20px_rgba(250,36,60,0.5)] active:scale-95 transition-transform hover:scale-105" aria-label="Ver en Apple Music">
                <SiApple size={28} className="text-white mb-1 max-[380px]:w-6 max-[380px]:h-6" />
              </a>
            </div>

            <button onClick={onBackToMenu} className="w-[80%] max-[380px]:w-[85%] py-4 max-[380px]:py-3 rounded-full bg-primary text-white font-extrabold tracking-wide text-xl max-[380px]:text-lg shadow-[0_0_25px_rgba(233,64,150,0.6)] active:scale-95 transition-transform hover:scale-105 shrink-0">
              BACK TO MENU
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WinModal;