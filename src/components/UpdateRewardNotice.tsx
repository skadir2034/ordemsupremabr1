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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-gaming-card border border-gaming-gold/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(251,191,36,0.15)]"
          >
            {/* Background sparkle */}
            {!isEcoMode && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1/2 -right-1/2 w-full h-full bg-gaming-gold/5 rounded-full blur-3xl"
                />
              </div>
            )}

            <div className="relative p-8 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-gaming-gold/20 rounded-full flex items-center justify-center text-gaming-gold relative">
                 <Gift size={40} />
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute -top-1 -right-1"
                 >
                   <Sparkles size={24} />
                 </motion.div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-gaming-gold font-black uppercase text-[10px] tracking-[0.4em]">Compensação Oficial</span>
                <h2 className="text-3xl font-display font-black uppercase italic tracking-tight text-white">Obrigado pela <span className="text-gaming-gold">Paciência!</span></h2>
                <p className="text-white/40 text-xs font-bold uppercase italic leading-relaxed">
                  Como agradecimento por aguardar as atualizações da Aliança Suprema Ordem, preparamos um bônus especial para você.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3">
                  <Coins className="text-gaming-gold" size={32} />
                  <span className="text-3xl font-mono font-black">+50</span>
                  <span className="text-[10px] uppercase font-black text-white/30 tracking-[0.3em]">Moedas de Ouro</span>
                </div>
              </div>

              <button 
                onClick={handleClaim}
                className="w-full bg-gaming-gold text-black py-4 rounded-2xl font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all group mt-2"
              >
                Resgatar Recompensa
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleClose}
                className="text-white/20 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"
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
