import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { useClan } from '../context/ClanContext';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const { isEcoMode } = useClan();

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 ${isEcoMode ? '' : 'backdrop-blur-md'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.6, rotate: 2 }}
        className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-purple-950/60 via-zinc-950 to-zinc-950 border-2 border-gaming-gold/50 rounded-[2.5rem] p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(168,85,247,0.3)] overflow-hidden"
      >
        {!isEcoMode && (
          <>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-gaming-gold/15 to-transparent pointer-events-none" />
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-16 -left-16 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" 
            />
          </>
        )}

        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gaming-gold rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)] z-10 relative mb-4"
        >
           <Trophy size={36} className="text-black drop-shadow" />
        </motion.div>

        <div className="mb-6 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="text-[10px] sm:text-[11px] uppercase font-mono font-black tracking-[0.4em] text-gaming-gold mb-1 sm:mb-2 drop-shadow-glow"
          >
            Ascensão de Poder
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="text-6xl sm:text-7xl font-display font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            NV. {level}
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 mb-6 sm:mb-8 relative z-10">
           <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-zinc-300 font-black text-[11px] sm:text-xs uppercase tracking-widest leading-relaxed italic"
           >
             "Sua lenda de glória se espalha pelos reinos!"
           </motion.p>
           
           <div className="flex justify-center gap-2">
             {[1,2,3,4,5].map(i => (
               <motion.div
                 key={i}
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.9 + (i * 0.08) }}
               >
                 <Star size={18} className="text-gaming-gold fill-gaming-gold drop-shadow-glow animate-pulse" />
               </motion.div>
             ))}
           </div>
        </div>

        <motion.button 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          onClick={onClose}
          className="w-full py-3.5 sm:py-4 bg-gaming-gold text-black rounded-xl font-display font-black uppercase text-[10px] sm:text-xs tracking-[0.25em] hover:bg-white active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] relative z-10 cursor-pointer"
        >
          Continuar Jornada
        </motion.button>

        <div className="absolute inset-0 pointer-events-none">
           {!isEcoMode && [...Array(8)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ 
                 opacity: [0, 1, 0], 
                 scale: [0, 1.5, 0],
                 x: [0, (Math.random() - 0.5) * 280],
                 y: [0, (Math.random() - 0.5) * 280]
               }}
               transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25 }}
               className="absolute top-1/2 left-1/2"
             >
               {i % 2 === 0 ? <Sparkles className="text-gaming-gold" size={16} /> : <Star className="text-white/20" size={8} />}
             </motion.div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
