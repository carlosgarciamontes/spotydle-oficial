import React from 'react';
import { Share2, Facebook, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GuessResult } from './GuessGrid';

interface WinModalProps {
  isOpen: boolean;
  songData: {
    title: string;
    artist: string;
    coverUrl: string;
  };
  guesses: GuessResult[];
  hasWon: boolean;
  onBackToMenu: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ isOpen, songData, guesses = [], hasWon, onBackToMenu }) => {

  const generateEmojiGrid = () => {
    const emojiMap: Record<GuessResult, string> = {
      correct: "🟩",
      partial: "🟨",
      wrong: "🟥",
      empty: "⬛"
    };

    const fullGrid = Array.from({ length: 6 }).map((_, i) => guesses[i] || "empty");
    return fullGrid.map(status => emojiMap[status]).join("");
  };

  // Si ha perdido, el count será "X/6". Si ha ganado, será el número de intentos.
  const attemptCount = hasWon ? guesses.filter(g => g !== "empty").length : "X";
  
  const shareText = `Spotydle 🎵 - ${attemptCount}/6\n\n${generateEmojiGrid()}\n\n¿Puedes superarlo? Juega aquí:`;
  const shareUrl = "https://spotydle.com";

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Spotydle - Reto Diario',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error compartiendo', error);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("¡Resultados copiados al portapapeles!"); 
    }
  };

  const handleTwitterShare = () => {
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const facebookIntent = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntent, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8">
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div 
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full max-w-sm flex flex-col items-center"
          >
            
            {/* TÍTULO DINÁMICO (Gana o Pierde) */}
            <h1 className={`text-4xl font-black mb-8 tracking-widest text-center ${
              hasWon 
                ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' 
                : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            }`}>
              {hasWon ? 'YOU WIN!' : 'GAME OVER'}
            </h1>

            {/* TARJETA DE LA CANCIÓN (Cambia el color del borde según el resultado) */}
            <div className={`w-full bg-[#2A2A2A] rounded-[2.5rem] p-8 border shadow-2xl flex flex-col items-center mb-10 transition-colors ${
              hasWon ? 'border-green-400/50 shadow-[0_0_40px_rgba(74,222,128,0.2)]' : 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
            }`}>
              <Image 
                src={songData.coverUrl} 
                alt={`${songData.artist} - ${songData.title}`} 
                width={400} 
                height={400}
                className="w-full aspect-square rounded-[2rem] object-cover mb-12 shadow-inner"
              />
              <h2 className="text-white font-bold text-[1.1rem] text-center px-4 pb-2">
                {songData.artist} - {songData.title}
              </h2>
            </div>

            {/* BOTONES SOCIALES */}
            <div className="flex items-center justify-center gap-6 mb-12">
              <button onClick={handleGenericShare} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(233,64,150,0.6)] active:scale-95 transition-transform hover:scale-105" aria-label="Compartir resultados">
                <Share2 size={28} className="text-white" />
              </button>
              <button onClick={handleTwitterShare} className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 transition-transform hover:scale-105" aria-label="Compartir en Twitter">
                 <Twitter size={28} className="text-black" />
              </button>
              <button onClick={handleFacebookShare} className="w-16 h-16 rounded-full bg-[#4267B2] flex items-center justify-center shadow-[0_0_20px_rgba(66,103,178,0.5)] active:scale-95 transition-transform hover:scale-105" aria-label="Compartir en Facebook">
                <Facebook size={32} className="text-white" />
              </button>
            </div>

            <button 
              onClick={onBackToMenu}
              className="w-[80%] py-4 rounded-full bg-primary text-white font-extrabold tracking-wide text-xl shadow-[0_0_25px_rgba(233,64,150,0.6)] active:scale-95 transition-transform hover:scale-105"
            >
              BACK TO MENU
            </button>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WinModal;