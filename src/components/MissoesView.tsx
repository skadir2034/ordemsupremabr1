import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, CheckCircle2, Star, Zap, Sword, Shield, Lock, Settings } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function MissoesView() {
  const { myMember, completeMission, markVisitedMissions } = useClan();

  useEffect(() => {
    markVisitedMissions();
  }, []);

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
      title: 'Em Breve',
      description: 'Participe do seu primeiro torneio oficial.',
      xp: 100,
      icon: Shield,
      locked: true
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
          const isLocked = mission.locked;

          return (
            <motion.div
              key={mission.id}
              whileHover={!isLocked && !isCompleted ? { scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
              className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 transition-all ${
                isCompleted 
                  ? 'bg-green-500/5 border-green-500/20 grayscale-[0.5]' 
                  : isLocked 
                    ? 'bg-white/5 border-white/5 opacity-50' 
                    : 'bg-gaming-card/40 border-gaming-border'
              }`}
            >
              {isCompleted && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <CheckCircle2 className="text-green-500" size={18} />
                </div>
              )}
              {isLocked && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <Lock className="text-white/20" size={18} />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-500/20 text-green-500' : 'bg-gaming-gold/10 text-gaming-gold'
                }`}>
                  <mission.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className={`font-display font-black uppercase text-sm sm:text-base truncate ${isCompleted ? 'text-green-500/70' : 'text-white'}`}>
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
                   <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Concluída</span>
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
