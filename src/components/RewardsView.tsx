import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gem, 
  ShieldAlert, 
  Star, 
  Shield, 
  CreditCard, 
  ShoppingBag, 
  Gift 
} from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function RewardsView() {
  const { isGuest, myMember, updateMemberData, isEcoMode } = useClan();
  const [purchaseStatus, setPurchaseStatus] = useState<{ id: string, message: string, type: 'success' | 'error' } | null>(null);

  const handleClaimReward = (reward: any) => {
    if (isGuest) {
      alert("Contas de convidado temporárias não podem resgatar recompensas na Loja da Aliança!");
      return;
    }

    if (reward.inDevelopment) {
      setPurchaseStatus({ id: reward.id, message: "Este item está em desenvolvimento!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 3000);
      return;
    }

    if (!myMember) return;
    
    if (myMember.diamonds < reward.price) {
      setPurchaseStatus({ id: reward.id, message: `Saldo insuficiente!`, type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 3000);
      return;
    }

    if (reward.id.includes('pass') && myMember.premiumPass) {
      setPurchaseStatus({ id: reward.id, message: "Você já possui um Passe Premium ativo!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 3000);
      return;
    }

    const updates: any = {
      diamonds: myMember.diamonds - reward.price
    };

    if (reward.id.includes('pass')) {
      updates.premiumPass = true;
    }

    updateMemberData(updates);
    setPurchaseStatus({ id: reward.id, message: `Resgatado com sucesso!`, type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 3000);
  };

  const rewards = [
    { 
      id: 'weekly_pass', 
      title: 'Passe Premium Semanal', 
      desc: 'Acesso total aos benefícios premium por 7 dias.', 
      price: 100, 
      icon: Star,
      rarity: 'Raro'
    },
    { 
      id: 'monthly_pass', 
      title: 'Passe Premium Mensal', 
      desc: 'O pack definitivo de benefícios premium por 30 dias.', 
      price: 500, 
      icon: Shield,
      rarity: 'Lendário'
    },
    { 
      id: 'gift_card_50', 
      title: 'Gift Card R$ 50', 
      desc: 'Cartão presente de R$ 50 para usar como quiser.', 
      price: 200, 
      icon: CreditCard,
      rarity: 'Místico'
    },
    { 
      id: 'clan_merch', 
      title: 'Kit Aliança (Camisa + Caneca)', 
      desc: 'Mostre seu orgulho com o kit oficial personalizado.', 
      price: 200, 
      icon: ShoppingBag,
      rarity: 'Exclusivo',
      inDevelopment: true
    }
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-2 sm:p-4 md:p-6 pb-20 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
           <span className="text-[7.5px] uppercase font-bold text-gaming-gold tracking-widest mb-0.5 block">LOJA DA ALIANÇA</span>
           <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide text-white">
             Central de <span className="text-gaming-gold">Resgates</span>
           </h2>
        </div>
        <div className={`flex items-center gap-2 bg-zinc-950/50 border border-white/10 px-3 py-1.5 rounded-lg self-start sm:self-auto ${isEcoMode ? '' : 'backdrop-blur-md'}`}>
           <Gem size={14} className="text-gaming-gold animate-pulse" />
           <div className="flex flex-col text-left">
              <span className="text-[7px] uppercase font-black text-white/30 tracking-widest leading-none">Seu Saldo</span>
              <span className="font-mono font-black text-gaming-gold text-sm sm:text-base leading-none mt-0.5">{myMember?.diamonds || 0}</span>
           </div>
        </div>
      </div>

      {isGuest && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-left">
          <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-mono font-black text-red-500 tracking-wider">Acesso de ResGATE Restrito</span>
            <span className="text-[9px] uppercase font-bold text-red-400 leading-normal">
              Contas de convidado não podem resgatar recompensas na loja ou ativar o Passe Premium. Registre uma conta permanente para começar a pontuar e adquirir mimos!
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
         {rewards.map((reward) => (
           <motion.div 
            key={reward.id}
            whileHover={!isEcoMode ? { y: -2 } : {}}
            className={`group relative bg-zinc-900/40 border border-white/5 rounded-xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden transition-all hover:bg-zinc-900/60 hover:border-gaming-gold/20 ${isEcoMode ? '' : 'backdrop-blur-md'}`}
           >
              {reward.inDevelopment && (
                <div className={`absolute inset-0 bg-black/75 z-20 flex items-center justify-center rotate-[-12deg] scale-110 pointer-events-none ${isEcoMode ? '' : 'backdrop-blur-[1px]'}`}>
                   <span className="bg-gaming-gold text-black px-4 py-0.5 font-black uppercase tracking-[0.2em] text-[7px] sm:text-[8px] shadow-lg">Breve</span>
                </div>
              )}

              <div className="relative z-10 flex flex-col gap-2">
                 <div className="flex justify-between items-center mb-1">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/70 group-hover:text-gaming-gold group-hover:border-gaming-gold/30 transition-all shadow-inner">
                       <reward.icon size={16} />
                    </div>
                    <span className="text-[6.5px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5 text-white/40">{reward.rarity}</span>
                 </div>

                 <div>
                    <h4 className="font-display font-black uppercase text-xs sm:text-sm leading-tight text-white group-hover:text-gaming-gold transition-colors truncate">{reward.title}</h4>
                    <p className="text-[8px] sm:text-[9.5px] text-zinc-400 font-bold uppercase leading-relaxed tracking-wide min-h-[32px] mt-1 line-clamp-2 italic">{reward.desc}</p>
                 </div>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/5 flex flex-col gap-2 mt-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[7.5px] font-black uppercase text-white/20 tracking-widest">Valor</span>
                    <div className="flex items-center gap-1">
                       <Gem size={10} className="text-gaming-gold" />
                       <span className="font-mono font-black text-gaming-gold text-xs sm:text-sm">{reward.price}</span>
                    </div>
                 </div>
                 <button 
                  type="button"
                  onClick={() => handleClaimReward(reward)}
                  className={`w-full py-1.5 sm:py-2 rounded-lg font-display font-black uppercase tracking-[0.15em] text-[8.5px] sm:text-[10px] transition-all relative overflow-hidden ${
                    reward.inDevelopment || isGuest
                      ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-gaming-gold hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] active:scale-95 cursor-pointer'
                  }`}
                 >
                    <AnimatePresence mode="wait">
                      {purchaseStatus?.id === reward.id ? (
                        <motion.span 
                         key="status"
                         initial={{ y: 20, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         exit={{ y: -20, opacity: 0 }}
                         className={`absolute inset-0 flex items-center justify-center text-[7.5px] sm:text-[8.5px] px-1 text-center font-bold ${purchaseStatus.type === 'success' ? 'bg-gaming-gold text-black' : 'bg-red-500 text-white'}`}
                        >
                          {purchaseStatus.message}
                        </motion.span>
                      ) : (
                        <motion.span key="label">Resgatar</motion.span>
                      )}
                    </AnimatePresence>
                 </button>
              </div>

              {/* Decorative Background Icon */}
              {!isEcoMode && <reward.icon size={50} className="absolute -right-4 -bottom-4 text-white/[0.01] -rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />}
           </motion.div>
         ))}
      </div>

      <div className="bg-linear-to-r from-gaming-purple/5 to-transparent border border-gaming-purple/10 rounded-xl p-3.5 sm:p-4 flex items-center gap-3 mt-1.5 text-left">
         <div className="hidden sm:flex w-10 h-10 bg-gaming-purple/15 rounded-full items-center justify-center text-gaming-purple flex-shrink-0 animate-pulse border border-gaming-purple/20">
            <Gift size={20} />
         </div>
         <div>
            <h5 className="font-display font-black uppercase text-xs mb-0.5 italic text-white/80">Eventos de Recarga</h5>
            <p className="text-[8px] sm:text-[9.5px] text-zinc-400 uppercase font-bold tracking-wider leading-relaxed">Fique atento ao nosso Whatsapp para eventos especiais onde você pode ganhar diamantes em dobro e recompensas exclusivas por tempo limitado.</p>
         </div>
      </div>
    </div>
  );
}
