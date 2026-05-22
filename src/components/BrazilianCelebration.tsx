import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Sparkles, Star, Flame, PartyPopper, ShieldCheck } from 'lucide-react';
import { useClan } from '../context/ClanContext';

// 1. CONFETTI & SPARKS CELL - LIGHTWEIGHT, ANIMATED & GPU-OPTIMIZED
export function BrazilianConfetti() {
  const { isEcoMode } = useClan();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; scale: number; color: string; duration: number; type: 'circle' | 'square' | 'star' }>>([]);

  useEffect(() => {
    if (isEcoMode) return;

    const colors = [
      '#059669', // Emerald/Green (suave)
      '#eab308', // Gold/Yellow (suave)
      '#2563eb', // Sky Blue/Blue (suave)
      '#ffffff', // White
      '#10b981', // Vibrant emerald
      '#facc15', // Vibrant yellow
      '#3b82f6', // Sapphire blue
    ];
    
    // Generate 40 beautiful particles on load
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
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none" id="brazil-confetti-stage">
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
            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.15))',
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
      className="w-full bg-gradient-to-r from-emerald-950/90 via-sky-950/90 to-emerald-950/90 border-b border-emerald-500/20 py-1.5 overflow-hidden flex items-center justify-center select-none" 
      id="brazil-champions-ticker"
    >
      <div className="flex whitespace-nowrap min-w-full items-center gap-16 relative">
        <div className={`flex items-center gap-16 ${isEcoMode ? '' : 'animate-[marquee_25s_linear_infinite]'}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 font-sans">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 flex items-center gap-2">
                <Trophy size={11} className="text-yellow-400 animate-bounce" /> 
                Somos Campeões da Guerra de Servidores 
              </span>
              <span className="text-[9px] px-2 py-0.5 bg-yellow-400/10 text-yellow-300 rounded border border-yellow-400/20 font-black uppercase tracking-wider block">
                ⭐ Ordem Suprema No Topo ⭐
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 flex items-center gap-2">
                <Crown size={11} className="text-yellow-400 animate-pulse" /> 
                A Suprema Ordem de Servidores é Nossa!
              </span>
              <span className="text-white/60 font-black leading-none py-0.5 text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                🇧🇷 Brasil no Topo 🇧🇷
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

// 3. BRAZILIAN CHAMPIONS CELEBRATION COPA BANNER CARD (REPLICATES WAR BANNER IN ACTIVE & BEAUTIFUL MODE)
export function ChampionsNoticeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-radial-gradient bg-[#061a13] p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-[0_0_50px_rgba(5,150,105,0.12)] group"
      id="brazil-champions-intro-card"
    >
      {/* Soft Brazilian Radiant Background Glow */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,var(--color-yellow-500)_0%,var(--color-emerald-500)_50%,transparent_100%)] blur-2xl pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Decorative Golden Stars Pattern */}
      <div className="absolute right-4 top-4 flex gap-1 text-yellow-400/20 group-hover:text-yellow-400/40 transition-colors pointer-events-none">
        <Star size={12} className="animate-pulse" />
        <Star size={16} className="animate-bounce" style={{ animationDelay: '200ms' }} />
        <Star size={12} className="animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>

      {/* Gold & Silver Trophies / Flag / Shield Icon Section */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-yellow-400/20 to-blue-500/20 rounded-full blur-xl scale-125 animate-pulse" />
        <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-linear-to-b from-emerald-900/40 to-slate-900/60 border-2 border-emerald-400/30 flex items-center justify-center shadow-inner relative box-shadow-lg">
          <motion.div
            animate={{ rotate: [0, -3, 3, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-yellow-400 flex flex-col items-center"
          >
            <Trophy size={48} className="drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
            <div className="absolute bottom-1 bg-blue-600 px-2 py-0.5 rounded-full border border-yellow-400 text-[8px] font-black uppercase text-white flex items-center gap-0.5 tracking-wider">
              🇧🇷 CLÃ #1
            </div>
          </motion.div>
        </div>
      </div>

      {/* Text Message & Highlight Column */}
      <div className="flex-1 flex flex-col gap-3.5 text-center md:text-left min-w-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md text-[8.5px] font-black uppercase tracking-[0.25em] flex items-center gap-1 italic animate-pulse">
              <PartyPopper size={10} className="text-yellow-400 animate-spin" /> Vencedores Supremos
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md text-[8.5px] font-black uppercase tracking-[0.2em]">
              Guerra de Servidores
            </span>
            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md text-[8.5px] font-black uppercase tracking-[0.2em] font-mono animate-bounce">
              CAMPEÃO 🏆
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-display font-black uppercase italic tracking-tight text-white leading-tight mt-1">
            SOMOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-300 to-blue-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">CAMPEÕES DA GUERRA DE SERVIDORES DE VERDADE!</span>
          </h2>
        </div>

        <p className="text-zinc-300 text-[11px] md:text-xs font-medium uppercase tracking-[0.05em] leading-relaxed max-w-2xl">
          A Aliança Suprema conquistou a classificação máxima com honra, garra e glória absoluta! 
          O estandarte brasileiro repousa glorioso no topo de todos os ranks do servidor. 
          Nosso mais profundo agradecimento a todos os guerreiros voluntários, líderes e membros fiéis que ajudaram e continuam ajudando diariamente a nossa gigantesca aliança a crescer, fortalecer e alcançar o topo com união! 🇧🇷⚔️🛡️
        </p>

        {/* Mini stats highlight under Brazil event */}
        <div className="flex space-x-4 items-center self-center md:self-start mt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Status: Clã Triunfante</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-650" />
          <div className="flex items-center gap-1.5">
            <Flame size={12} className="text-yellow-400 shrink-0 animate-pulse" />
            <span className="text-[10px] font-black text-yellow-300 uppercase tracking-wider">Temporada de Ouro Ativa</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
