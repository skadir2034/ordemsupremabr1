import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Star, ChevronRight } from 'lucide-react';
import { useClan } from '../context/ClanContext';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const { isEcoMode } = useClan();

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60`}>
      {!isEcoMode && (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="absolute inset-0 backdrop-blur-[6px] transition-all bg-linear-to-b from-white/5 to-transparent" 
         />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`relative w-full max-w-sm ${isEcoMode ? 'bg-[#1a0b2e]' : 'bg-white/10 backdrop-blur-3xl'} border border-white/20 rounded-[2.5rem] p-8 text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden`}
      >
        {!isEcoMode && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-400/20 blur-[80px] -z-10 rounded-full" />
        )}

        <div className="relative mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            className="w-20 h-20 mx-auto bg-linear-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl mb-4"
          >
             <Star size={40} className="text-white fill-white" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[10px] uppercase font-black tracking-[0.4em] text-cyan-400 mb-2"
          >
            Nível Superior Alcançado
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-7xl font-display font-black text-white tracking-tighter mb-4"
        >
          {level}
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/60 text-sm font-medium mb-10 px-4"
        >
          Sua força dentro da Ordem Suprema acaba de evoluir para um novo patamar.
        </motion.p>

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onClose}
          className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-white transition-all flex items-center justify-center gap-2 group"
        >
          Reivindicar Poder
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <div className="absolute inset-0 pointer-events-none -z-10">
           {!isEcoMode && [...Array(8)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ 
                 opacity: [0, 0.4, 0], 
                 scale: [0.5, 1.2, 0.5],
                 x: [(Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300],
                 y: [(Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300]
               }}
               transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
               className="absolute top-1/2 left-1/2"
             >
               <Sparkles className="text-cyan-300/40" size={16} />
             </motion.div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
