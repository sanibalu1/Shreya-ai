import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AvatarProps {
  isSpeaking: boolean;
  audioLevel: number; // 0 to 1
  emotion: 'happy' | 'sad' | 'angry' | 'caring' | 'surprised' | 'neutral' | 'crying' | 'laughing';
  isUserPresent: boolean;
  isKissing?: boolean;
  isSinging?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  isSpeaking,
  audioLevel,
  emotion,
  isUserPresent,
  isKissing = false,
  isSinging = false,
}) => {
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headRotation, setHeadRotation] = useState(0);
  const [containerWidth, setContainerWidth] = useState(256);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive scaling factor
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth / 320; // Base scale on 320px (md size)

  // Lifelike random movements (blinking, eye darting, head tilting)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 100);
    }, 2000 + Math.random() * 3000);

    const movementInterval = setInterval(() => {
      // Random eye darting
      if (Math.random() > 0.3) {
        setEyeOffset({
          x: (Math.random() - 0.5) * 16,
          y: (Math.random() - 0.5) * 8
        });
      } else {
        setEyeOffset({ x: 0, y: 0 });
      }

      // Random subtle head tilt
      if (Math.random() > 0.5) {
        setHeadRotation((Math.random() - 0.5) * 12);
      } else {
        setHeadRotation(0);
      }
    }, 800 + Math.random() * 1500);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(movementInterval);
    };
  }, []);

  const getEmotionRingColor = () => {
    switch (emotion) {
      case 'happy': return 'bg-pink-400';
      case 'laughing': return 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]';
      case 'caring': return 'bg-rose-400';
      case 'sad': return 'bg-blue-400';
      case 'crying': return 'bg-indigo-500';
      case 'angry': return 'bg-red-500';
      case 'surprised': return 'bg-yellow-400';
      default: return 'bg-pink-300';
    }
  };

  const getEmotionColors = () => {
    switch (emotion) {
      case 'happy': return 'from-pink-300 via-rose-300 to-orange-300';
      case 'laughing': return 'from-orange-300 via-yellow-300 to-pink-300';
      case 'caring': return 'from-rose-300 via-pink-300 to-fuchsia-300';
      case 'sad': return 'from-blue-300 via-indigo-300 to-violet-300';
      case 'crying': return 'from-blue-400 via-indigo-500 to-slate-600';
      case 'angry': return 'from-red-400 via-rose-500 to-orange-500';
      case 'surprised': return 'from-yellow-300 via-amber-300 to-orange-300';
      default: return 'from-pink-200 via-rose-200 to-pink-300';
    }
  };

  const getEyeStyles = (isRight: boolean) => {
    const baseSize = 44 * scale;
    const blinkHeight = 4 * scale;
    const base = { height: blink ? blinkHeight : baseSize, width: baseSize, borderRadius: '50%' };
    switch (emotion) {
      case 'happy': return { ...base, borderRadius: '50% 50% 30% 30%', height: blink ? blinkHeight : 36 * scale };
      case 'laughing': return { ...base, borderRadius: '50% 50% 10% 10%', height: blink ? blinkHeight : 28 * scale, rotate: isRight ? 20 : -20, y: -4 * scale };
      case 'angry': return { ...base, borderRadius: isRight ? '100% 0% 100% 0%' : '0% 100% 0% 100%', rotate: isRight ? 15 : -15 };
      case 'sad': return { ...base, borderRadius: '30% 30% 60% 60%', rotate: isRight ? -10 : 10 };
      case 'crying': return { ...base, borderRadius: '30% 30% 60% 60%', rotate: isRight ? -15 : 15, height: blink ? blinkHeight : 36 * scale };
      case 'surprised': return { ...base, height: blink ? blinkHeight : 52 * scale, width: 52 * scale };
      default: return base;
    }
  };

  // Smoother, more organic mouth movement
  const mouthHeight = (isSpeaking ? (emotion === 'laughing' ? 32 + (audioLevel * 24) : 8 + (audioLevel * 16)) : (emotion === 'laughing' ? 20 : 4)) * scale;
  const mouthWidth = (isSpeaking ? (emotion === 'happy' || emotion === 'laughing' ? 40 + (audioLevel * 12) : 20 + (audioLevel * 10)) : (emotion === 'happy' || emotion === 'laughing' ? 40 : 20)) * scale;

  return (
    <div 
      ref={containerRef}
      className="relative w-[70vw] h-[70vw] sm:w-[60vw] sm:h-[60vw] md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[448px] xl:h-[448px] flex items-center justify-center perspective-1000 max-w-[512px] max-h-[512px] min-w-[200px] min-h-[200px]"
    >
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isSpeaking ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute inset-0 rounded-full blur-[60px] bg-gradient-to-tr transition-colors duration-1000",
          getEmotionColors()
        )}
      />

      {/* Emotion Indicator Ring (Pulsating Halo) */}
      <motion.div
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className={cn(
          "absolute inset-[-8px] rounded-full blur-[12px] transition-colors duration-1000 z-0",
          getEmotionRingColor()
        )}
      />

      {/* Main Avatar Body with Head Tilt and Breathing */}
      <motion.div
        animate={{ 
          y: [0, -4, 0], 
          scale: [1, 1.01, 1],
          rotateZ: headRotation,
          rotateX: isSpeaking ? [0, 2, 0] : 0
        }}
        transition={{ 
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }, 
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotateZ: { type: "spring", stiffness: 100, damping: 10 },
          rotateX: { duration: 0.3, repeat: Infinity, ease: "easeInOut" }
        }}
        className={cn(
          "relative w-full h-full rounded-full bg-white border-4 flex flex-col items-center justify-center overflow-hidden transition-all duration-700",
          isUserPresent ? "border-pink-200 shadow-[0_0_40px_rgba(244,114,182,0.3)]" : "border-slate-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* Soft inner shadow for 3D effect */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-pink-50/30 to-pink-200/50 pointer-events-none" />

        {/* Face Container */}
        <div className="relative w-full h-full flex flex-col items-center justify-center z-20 mt-4">
          
          {/* Eyes & Blush */}
          <div className="relative w-full flex flex-col items-center">
            <motion.div 
              animate={{ x: eyeOffset.x * scale, y: eyeOffset.y * scale }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex justify-around w-full px-[15%] relative z-10"
            >
              {/* Left Eye */}
              <motion.div
                animate={getEyeStyles(false)}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-slate-800 relative overflow-hidden shadow-inner"
              >
                <motion.div animate={{ opacity: blink ? 0 : 1 }} className="absolute top-[15%] left-[15%] w-[35%] h-[35%] bg-white rounded-full" />
                <motion.div animate={{ opacity: blink ? 0 : 1 }} className="absolute top-[60%] left-[60%] w-[15%] h-[15%] bg-white rounded-full" />
              </motion.div>

              {/* Right Eye */}
              <motion.div
                animate={getEyeStyles(true)}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-slate-800 relative overflow-hidden shadow-inner"
              >
                <motion.div animate={{ opacity: blink ? 0 : 1 }} className="absolute top-[15%] left-[15%] w-[35%] h-[35%] bg-white rounded-full" />
                <motion.div animate={{ opacity: blink ? 0 : 1 }} className="absolute top-[60%] left-[60%] w-[15%] h-[15%] bg-white rounded-full" />
              </motion.div>
            </motion.div>

            {/* Blush */}
            <div className="flex justify-around w-full px-[12%] mt-2 opacity-60">
              <motion.div 
                animate={{ 
                  opacity: isKissing ? 1 : (emotion === 'happy' || emotion === 'caring' ? 0.8 : 0.4), 
                  scale: isKissing ? 1.5 : (emotion === 'happy' ? 1.2 : 1),
                  backgroundColor: isKissing ? '#f43f5e' : '#f472b6' // rose-500 vs pink-400
                }}
                style={{ width: 40 * scale, height: 16 * scale }}
                className="rounded-full blur-[6px]"
              />
              <motion.div 
                animate={{ 
                  opacity: isKissing ? 1 : (emotion === 'happy' || emotion === 'caring' ? 0.8 : 0.4), 
                  scale: isKissing ? 1.5 : (emotion === 'happy' ? 1.2 : 1),
                  backgroundColor: isKissing ? '#f43f5e' : '#f472b6'
                }}
                style={{ width: 40 * scale, height: 16 * scale }}
                className="rounded-full blur-[6px]"
              />
            </div>
          </div>

          {/* Mouth */}
          <div className="mt-4 flex items-center justify-center">
            <motion.div
              animate={{
                height: mouthHeight,
                width: mouthWidth,
                borderRadius: emotion === 'happy' || emotion === 'laughing' ? '4px 4px 20px 20px' : '12px',
                y: emotion === 'crying' || emotion === 'sad' ? 4 : 0
              }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className="bg-rose-400 shadow-inner"
            />
          </div>

          {/* Microphone for Singing */}
          <AnimatePresence>
            {isSinging && (
              <motion.div
                initial={{ y: 200, opacity: 0, rotate: 20 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 200, opacity: 0, rotate: 20 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="absolute bottom-[-10%] z-50 flex flex-col items-center"
              >
                {/* Mic Head */}
                <div className="w-16 h-20 bg-slate-400 rounded-2xl border-4 border-slate-500 relative overflow-hidden shadow-lg">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:4px_4px]" />
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                </div>
                {/* Mic Body/Handle */}
                <div className="w-8 h-40 bg-slate-800 rounded-b-lg shadow-xl -mt-2 relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-slate-700 rounded-sm" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tears */}
          {emotion === 'crying' && (
            <div className="absolute top-[25%] w-full flex justify-around px-[20%] pointer-events-none">
              <motion.div 
                animate={{ y: [0, 30 * scale], opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                style={{ width: 8 * scale, height: 16 * scale }}
                className="bg-blue-300/80 rounded-full blur-[1px]"
              />
              <motion.div 
                animate={{ y: [0, 30 * scale], opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                style={{ width: 8 * scale, height: 16 * scale }}
                className="bg-blue-300/80 rounded-full blur-[1px]"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
