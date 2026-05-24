import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, X, ChevronRight, Gem, Coins } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function UpdateRewardNotice() {
  const { myMember, claimUpdateReward, isEcoMode, isGuest } = useClan();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isGuest) return;
    if (myMember && !myMember.updateRewardClaimed) {
      const timer = setTimeout(() => setIsOpen(true), 3000); // Show after a bit
      return () => clearTimeout(timer);
    }
  }, [myMember?.updateRewardClaimed, myMember?.userId, isGuest]);

  if (isGuest) return null;

  const handleClaim = async () => {
    await claimUpdateReward();
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Reward Modal */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-purple-950/70 via-zinc-950 to-zinc-950 border border-gaming-gold/40 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.35)]"
          >
            {/* Background sparkle */}
            {!isEcoMode && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1/2 -right-1/2 w-full h-full bg-gaming-gold/5 rounded-full blur-3xl"
                />
              </div>
            )}

            <div className="relative p-6 sm:p-8 flex flex-col items-center text-center gap-5 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-900/40 rounded-full flex items-center justify-center text-gaming-gold relative border border-gaming-gold/25 animate-pulse">
                 <Gift size={32} />
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute -top-1 -right-1"
                 >
                   <Sparkles size={20} className="text-gaming-gold" />
                 </motion.div>
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <span className="text-gaming-gold font-mono font-black uppercase text-[9px] tracking-[0.3em]">Compensação Oficial SVS</span>
                <h2 className="text-2xl sm:text-3xl font-display font-black uppercase italic tracking-tight text-white leading-tight">Obrigado pela <span className="text-gaming-gold">Paciência!</span></h2>
                <p className="text-zinc-300 text-[10.5px] sm:text-xs font-semibold uppercase italic leading-relaxed max-w-xs sm:max-w-none">
                  Como agradecimento por aguardar as atualizações da Aliança Suprema Ordem, seu bônus de ouro já está pronto para ser coletado.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col items-center gap-2">
                  <Coins className="text-gaming-gold animate-bounce" size={28} />
                  <span className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-gaming-gold to-yellow-300">+50</span>
                  <span className="text-[9px] uppercase font-black text-white/40 tracking-[0.25em] font-mono">Moedas de Ouro Clã</span>
                </div>
              </div>

              <button 
                onClick={handleClaim}
                className="w-full bg-gaming-gold text-black py-3 sm:py-3.5 rounded-xl font-display font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white transition-all group mt-1 cursor-pointer"
              >
                Resgatar Recompensa
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleClose}
                className="text-white/30 hover:text-white transition-colors text-[8.5px] font-black uppercase tracking-widest font-mono cursor-pointer"
              >
                Talvez mais tarde
              </button>
            </div>

            {/* Close button */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 text-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
