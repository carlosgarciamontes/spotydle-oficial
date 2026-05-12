import { useState, useRef } from 'react';

// 1. Extendemos la interfaz Window de forma estricta para Safari
interface CustomWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function useReverseAudio() {
  const [isReversedReady, setIsReversedReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const reversedBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const processReverseAudio = async (url: string) => {
    try {
      setIsProcessing(true);
      
      
      const AudioContextClass = window.AudioContext || (window as CustomWindow).webkitAudioContext;
      
      if (!AudioContextClass) {
        throw new Error("Web Audio API no soportada en este navegador");
      }

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        channelData.reverse(); 
      }

      reversedBufferRef.current = audioBuffer;
      setIsReversedReady(true);
    } catch (error) {
      console.error("Error procesando audio al revés:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playReversed = (durationInSeconds: number) => {
    if (!audioContextRef.current || !reversedBufferRef.current) return;

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }

    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = reversedBufferRef.current;
    
    source.connect(ctx.destination);
    source.start(0);
    source.stop(ctx.currentTime + durationInSeconds);
    
    sourceNodeRef.current = source;
  };

  const stopReversed = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {

      }
    }
  };

  return {
    processReverseAudio,
    playReversed,
    stopReversed,
    isReversedReady,
    isProcessing
  };
}