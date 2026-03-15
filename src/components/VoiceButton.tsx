import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  onClick: () => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isConnected,
  isConnecting,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isConnecting}
      className={cn(
        "relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
        isConnected 
          ? "bg-rose-500 text-white shadow-rose-500/40" 
          : "bg-white text-slate-900 shadow-white/20",
        isConnecting && "opacity-50 cursor-not-allowed"
      )}
    >
      {isConnecting ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : isConnected ? (
        <MicOff className="w-8 h-8" />
      ) : (
        <Mic className="w-8 h-8" />
      )}

      {/* Ripple effect when connected */}
      {isConnected && (
        <motion.div
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full bg-rose-500"
        />
      )}
    </motion.button>
  );
};
