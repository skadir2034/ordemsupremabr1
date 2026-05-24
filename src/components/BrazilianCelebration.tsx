import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Sparkles, Star, Flame, PartyPopper, ShieldCheck, Clock } from 'lucide-react';
import { useClan } from '../context/ClanContext';

// 1. CONFETTI & SPARKS CELL - LIGHTWEIGHT, ANIMATED & GPU-OPTIMIZED
export function BrazilianConfetti() {
  const { isEcoMode } = useClan();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; scale: number; color: string; duration: number; type: 'circle' | 'square' | 'star' }>>([]);

  useEffect(() => {
    if (isEcoMode) return;

    const colors = [
      '#a855f7', // Noble Purple
      '#fbbf24', // Luxury Gold
      '#c084fc', // Lavender
      '#ffffff', // Elegant White
      '#ffd700', // Imperial Gold
      '#d946ef', // Bright Violet
    ];
    
    // Generate 42 beautiful royal particles on load
    const items = Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // horizontal start position %
      y: -10 - Math.random() * 20, // vertical start position above screen
      delay: Math.random() * 6,
      scale: 0.5 + Math.random() * 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 12 + Math.random() * 18,
      type: (['circle', 'square', 'star'][Math.floor(Math.random() * 3)]) as 'circle' | 'square' | 'star'
    }));
    
    setParticles(items);
  }, [isEcoMode]);

  if (isEcoMode || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none" id="royal-glory-confetti-stage">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: `${p.y}vh`, x: `${p.x}vw`, opacity: 0, rotate: 0 }}
          animate={{
            y: '105vh',
            x: `${p.x + (Math.sin(p.id) * 12)}vw`,
            opacity: [0, 1, 1, 0.8, 0],
            rotate: [0, 360, 720 + Math.random() * 360]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: p.type === 'star' ? '12px' : '8px',
            height: p.type === 'star' ? '12px' : '8px',
            backgroundColor: p.type !== 'star' ? p.color : 'transparent',
            borderRadius: p.type === 'circle' ? '50%' : '2px',
            scale: p.scale,
            filter: 'drop-shadow(0 0 6px rgb(168,85,247))',
          }}
          className="gpu-accelerate"
        >
          {p.type === 'star' && (
            <Star 
              size={12} 
              fill={p.color} 
              style={{ color: p.color }} 
              className="w-full h-full"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// 2. RUNNING CHAMPIONS TICKER (TOP BAR MARQUEE)
export function ChampionsTicker() {
  const { isEcoMode } = useClan();
  
  return (
    <div 
      className="w-full bg-gradient-to-r from-purple-950/90 via-[#18092f]/95 to-purple-950/90 border-b border-gaming-gold/25 py-1.5 overflow-hidden flex items-center justify-center select-none" 
      id="royal-glory-ticker"
    >
      <div className="flex whitespace-nowrap min-w-full items-center gap-16 relative">
        <div className={`flex items-center gap-16 ${isEcoMode ? '' : 'animate-[marquee_25s_linear_infinite]'}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 font-sans">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gaming-gold flex items-center gap-2">
                <Trophy size={11} className="text-gaming-gold animate-bounce" /> 
                TEMPORADA 1 INICIADA • GLÓRIA ABSOLUTA 
              </span>
              <span className="text-[9px] px-2 py-0.5 bg-gaming-gold/10 text-gaming-gold rounded border border-gaming-gold/20 font-black uppercase tracking-wider block">
                ⭐ CAMPEÕES SVS SEMIFINAL: 176 (9) x (4) BLOODPACT ⭐
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300 flex items-center gap-2">
                <Crown size={11} className="text-gaming-gold animate-pulse" /> 
                RUMO À GRANDE FINAL: SERVIDOR 176 vs SERVIDOR 175
              </span>
              <span className="text-white/80 font-black leading-none py-0.5 text-[9px] uppercase tracking-widest flex items-center gap-1.5 font-mono">
                🟣 TEMPORADA DA GLÓRIA AMARANTE 🟣
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Custom style override inject for the marquee animation
const style = document.createElement('style');
style.textContent = `
  @keyframes marquee {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

// 3. ROYAL CHAMPIONS CELEBRATION BANNER CARD (GLÓRIA & NEW SVS FINAL)
export function ChampionsNoticeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-gaming-gold/45 bg-gradient-to-br from-purple-950/50 via-[#160a2c]/95 to-zinc-950 p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-[0_0_50px_rgba(168,85,247,0.25)] group"
      id="royal-champions-glory-card"
    >
      {/* Soft Purple and Gold Radiant Background Glow */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,var(--color-gaming-gold)_0%,var(--color-gaming-purple)_50%,transparent_100%)] blur-2xl pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Decorative Golden Stars Pattern */}
      <div className="absolute right-4 top-4 flex gap-1 text-gaming-gold/30 group-hover:text-gaming-gold/60 transition-colors pointer-events-none">
        <Star size={12} className="animate-pulse" />
        <Star size={16} className="animate-bounce" style={{ animationDelay: '200ms' }} />
        <Star size={12} className="animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>

      {/* Gold & Purple Imperial Shield Icon Section */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-gaming-gold/20 to-purple-800/20 rounded-full blur-xl scale-125 animate-pulse" />
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-linear-to-b from-purple-900/50 to-slate-950/80 border-2 border-gaming-gold/40 flex items-center justify-center shadow-inner relative box-shadow-lg">
          <motion.div
            animate={{ rotate: [0, -3, 3, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-gaming-gold flex flex-col items-center"
          >
            <Trophy size={54} className="drop-shadow-[0_0_20px_rgba(251,191,36,0.7)]" />
            <div className="absolute bottom-1 bg-purple-700 px-2.5 py-0.5 rounded-full border border-gaming-gold text-[8px] font-black uppercase text-white flex items-center gap-0.5 tracking-wider shadow">
              🏆 TEMPORADA 1
            </div>
          </motion.div>
        </div>
      </div>

      {/* Text Message & Highlight Column */}
      <div className="flex-1 flex flex-col gap-3 md:gap-3.5 text-center md:text-left min-w-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-md text-[8.5px] font-black uppercase tracking-[0.25em] flex items-center gap-1 italic animate-pulse">
              <PartyPopper size={10} className="text-gaming-gold animate-spin" /> TEMPORADA 1 INICIADA: GLÓRIA
            </span>
            <span className="px-2 py-0.5 bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/20 rounded-md text-[8.5px] font-black uppercase tracking-[0.2em]">
              SEMIFINAL: VENCEMOS POR 9x4
            </span>
            <span className="px-2 py-0.5 bg-red-500/10 text-red-300 border border-red-500/20 rounded-md text-[8.5px] font-black uppercase tracking-[0.2em] font-mono animate-bounce">
              BLOODPACT DETONADA ⚔️
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-display font-black uppercase italic tracking-tight text-white leading-tight mt-1.5">
            SOMOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-gaming-gold via-purple-300 to-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">OS GRANDES CAMPEÕES OFICIAIS DA PRIMEIRA ETAPA!</span>
          </h2>
        </div>

        <p className="text-zinc-200 text-[11px] md:text-xs font-semibold uppercase tracking-[0.05em] leading-relaxed max-w-2xl">
          Nossa Aliança Suprema venceu bravamente a equipe da <span className="text-red-400 font-bold decoration-wavy underline">Bloodpact</span> pelo placar oficial de <strong className="text-gaming-gold">9x4</strong> na semifinal! 
          Agora, estamos oficialmente classificados e indo rumo à grande final do confronto servidor X servidor (Nosso Servidor 176 vs Servidor 175)! 
          A grande final começa em 6 dias e 10 horas. Preparem-se guerreiros, a glória eterna está por vir! 🛡️🟣✨
        </p>

        {/* Mini stats highlight under Brazil event */}
        <div className="flex space-x-4 items-center self-center md:self-start mt-1 bg-black/40 border border-white/5 py-1 px-3 rounded-full w-fit">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-purple-400 shrink-0" />
            <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider font-mono">Status: Classificado Final SVS</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-650" />
          <div className="flex items-center gap-1.5">
            <Flame size={12} className="text-gaming-gold shrink-0 animate-pulse" />
            <span className="text-[10px] font-black text-gaming-gold uppercase tracking-wider font-mono">Temporada 1 de Glória</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
