import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Sparkles, Star, Flame, PartyPopper, ShieldCheck, Clock, X } from 'lucide-react';
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
  const [dismissed, setDismissed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('ticker_dismissed_v2') === 'true';
    setDismissed(isDismissed);
    setIsMounted(true);
  }, []);

  if (!isMounted || dismissed) return null;
  
  return (
    <div 
      className="w-full bg-gradient-to-r from-purple-950/90 via-[#18092f]/95 to-purple-950/90 border-b border-gaming-gold/25 py-1 flex items-center justify-between px-4 select-none relative" 
      id="royal-glory-ticker"
    >
      <div className="flex-1 overflow-hidden">
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          localStorage.setItem('ticker_dismissed_v2', 'true');
          setDismissed(true);
        }}
        className="ml-3 shrink-0 p-1 rounded-full bg-black/40 text-gaming-gold hover:text-white transition-colors border border-gaming-gold/25 flex items-center justify-center cursor-pointer hover:bg-black/80 w-5 h-5"
        title="Ocultar barra"
      >
        <X size={10} className="font-extrabold" />
      </button>
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
  const [dismissed, setDismissed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('notice_card_dismissed_v2') === 'true';
    setDismissed(isDismissed);
    setIsMounted(true);
  }, []);

  if (!isMounted || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-4 md:p-6 flex flex-col md:flex-row gap-5 md:gap-6 items-center shadow-md group"
      id="royal-champions-glory-card"
    >
      <button
        onClick={() => {
          localStorage.setItem('notice_card_dismissed_v2', 'true');
          setDismissed(true);
        }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/5 transition-colors cursor-pointer"
        title="Fechar"
      >
        <X size={12} />
      </button>

      {/* Soft Purple glow */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,var(--color-gaming-gold)_0%,var(--color-gaming-purple)_50%,transparent_100%)] blur-xl pointer-events-none" />
      
      {/* Small Decorative Golden Stars */}
      <div className="absolute right-12 top-3 flex gap-1 text-gaming-gold/20 pointer-events-none">
        <Star size={10} className="animate-pulse" />
        <Star size={12} className="animate-pulse" style={{ animationDelay: '200ms' }} />
      </div>

      {/* Elegant Trophy Area */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-lg scale-110" />
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, -2, 2, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-gaming-gold flex flex-col items-center gap-1"
          >
            <Trophy size={32} className="text-gaming-gold" />
            <span className="text-[7px] font-bold tracking-wider text-zinc-400">T1 • GLÓRIA</span>
          </motion.div>
        </div>
      </div>

      {/* Text column scaled down for supreme organization */}
      <div className="flex-1 flex flex-col gap-2 text-center md:text-left min-w-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded text-[8px] font-bold uppercase tracking-wider">
              🎮 T1 Iniciada
            </span>
            <span className="px-2 py-0.5 bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/25 rounded text-[8px] font-bold uppercase tracking-wider">
              Semifinal: 176 [9 x 4] Bloodpact
            </span>
          </div>
          <h2 className="text-sm md:text-base font-display font-black uppercase text-white tracking-wide leading-tight">
            Somos os Campeões da Primeira Etapa!
          </h2>
        </div>

        <p className="text-zinc-400 text-[10.5px] leading-relaxed max-w-2xl font-medium normalcy-case">
          Nossa Aliança Suprema venceu a Bloodpact na semifinal e garantiu a classificação para a grande final do confronto Servidor x Servidor contra o Servidor 175! O embate decisivo inicia em 6 dias. Preparem as armas!
        </p>

        {/* Status badges */}
        <div className="flex items-center gap-3 justify-center md:justify-start mt-0.5 text-zinc-500 text-[9.5px] font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
            Classificado: Final SVS
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700 font-bold" />
          <span className="flex items-center gap-1">
            <Flame size={11} className="text-amber-500 shrink-0 animate-pulse" />
            Dicas disponíveis em "Guia SVS"
          </span>
        </div>
      </div>
    </motion.div>
  );
}
