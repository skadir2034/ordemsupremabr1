import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, CheckCircle2, Star, Zap, Sword, Shield, Lock, Settings } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function MissoesView() {
  const { myMember, completeMission, markVisitedMissions, isGuest } = useClan();

  useEffect(() => {
    if (isGuest) return;
    markVisitedMissions();
    
    // Check if user has participated in their first event (Elixir group or Caça ao Rato pending/confirmed)
    const hasEventParticipation = myMember?.combatGroup || 
      myMember?.completedMissions?.includes('caca_rato_pending') || 
      myMember?.completedMissions?.includes('caca_rato_confirm');
      
    if (hasEventParticipation && !myMember?.completedMissions?.includes('open_missions_and_event')) {
      completeMission('open_missions_and_event', 25);
    }

    // Check if user has registered in the Elixir tournament
    const hasElixirParticipation = !!myMember?.combatGroup;
    if (hasElixirParticipation && !myMember?.completedMissions?.includes('join_tournament')) {
      completeMission('join_tournament', 100);
    }
  }, [myMember?.combatGroup, myMember?.completedMissions, completeMission, markVisitedMissions, isGuest]);

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 sm:p-8 md:p-12 max-w-xl mx-auto min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse mb-2">
          <Lock size={28} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] font-mono">Painel de Missões Fechado</span>
          <h2 className="text-2xl sm:text-3xl font-display font-black uppercase italic tracking-tighter text-white">
            MISSÕES DA <span className="text-red-500">ALIANÇA</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-bold uppercase italic leading-relaxed max-w-md mt-1">
            Contas de convidado não têm autorização operacional para participar de missões da guilda ou acumular conquistas e recompensas permanentes!
          </p>
        </div>
        <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl w-full max-w-sm flex flex-col gap-1">
          <span className="text-[9px] uppercase font-black text-red-500 tracking-wider font-mono">⚠️ RESTRIÇÃO ATIVA</span>
          <span className="text-[8px] uppercase font-bold text-red-400 leading-normal">
            Sua conta atual expira em menos de 24 horas. Cadastre-se com uma conta Google ou E-mail para desbloquear todas as funções competitivas de combate do clã!
          </span>
        </div>
      </div>
    );
  }

  const missions = [
    {
      id: 'first_login',
      title: 'Primeiro Contato',
      description: 'Logue pela primeira vez na Ordem Suprema.',
      xp: 15,
      icon: Zap,
    },
    {
      id: 'explore_menus',
      title: 'Explorador da Base',
      description: 'Navegue pelos menus para entender o funcionamento do site.',
      xp: 15,
      icon: ClipboardList,
    },
    {
      id: 'open_missions_and_event',
      title: 'Espírito Engajado',
      description: 'Abra o menu de eventos e participe de seu primeiro evento na aliança.',
      xp: 25,
      icon: ClipboardList,
    },
    {
      id: 'edit_hero_power',
      title: 'Poder Manifestado',
      description: 'Edite seu poder de herói pela primeira vez no perfil.',
      xp: 50,
      icon: Sword,
    },
    {
      id: 'check_optimization',
      title: 'Ajuste de Combate',
      description: 'Verifique as configurações e use otimizações/eco se houver travamentos.',
      xp: 20,
      icon: Settings,
    },
    {
      id: 'join_tournament',
      title: 'Primeiro Torneio',
      description: 'Participe do torneio de elixir (limite de 20 vagas na aliança).',
      xp: 100,
      icon: Shield,
    }
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-5 md:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter">
          Quadro de <span className="text-gaming-gold">Missões</span>
        </h2>
        <p className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em]">Cumpra seus deveres para ascender na hierarquia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {missions.map((mission) => {
          const isCompleted = myMember?.completedMissions?.includes(mission.id);
          const isLocked = (mission as any).locked || false;

          return (
            <motion.div
              key={mission.id}
              whileHover={!isLocked && !isCompleted ? { scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
              className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 transition-all ${
                isCompleted 
                  ? 'bg-gaming-purple/5 border-gaming-purple/20 grayscale-[0.3]' 
                  : isLocked 
                    ? 'bg-white/5 border-white/5 opacity-50' 
                    : 'bg-gaming-card/40 border-gaming-border'
              }`}
            >
              {isCompleted && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <CheckCircle2 className="text-gaming-purple" size={18} />
                </div>
              )}
              {isLocked && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <Lock className="text-white/20" size={18} />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-gaming-purple/20 text-gaming-purple' : 'bg-gaming-gold/10 text-gaming-gold'
                }`}>
                  <mission.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className={`font-display font-black uppercase text-sm sm:text-base truncate ${isCompleted ? 'text-white/40' : 'text-white'}`}>
                    {mission.title}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider leading-snug">{mission.description}</p>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-gaming-gold" />
                  <span className="text-xs font-mono font-black">{mission.xp} XP</span>
                </div>
                
                {isCompleted ? (
                   <span className="text-[9px] font-black uppercase text-gaming-gold tracking-widest">Concluída</span>
                ) : isLocked ? (
                   <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Bloqueada</span>
                ) : (
                   <span className="text-[9px] font-black uppercase text-gaming-gold tracking-widest animate-pulse">Em Aberto</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
