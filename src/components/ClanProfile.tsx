import { motion } from 'motion/react';
import React from 'react';
import { Shield, ChevronRight, MapPin, Search, Users, LogOut, Camera, Circle, Skull, BookOpen, X } from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';
import { auth } from '../lib/firebase';

export function ClanProfile({ 
  isMobile = false,
  activeTab = 'insignias',
  setActiveTab
}: { 
  isMobile?: boolean;
  activeTab?: string;
  setActiveTab: (tab: string) => void;
}) {
  const { clan, members, user, loading, isEcoMode } = useClan();
  
  const myMember = members.find(m => m.userId === user?.uid);
  const leader = members.find(m => m.role === 'leader');

  const [dismissNotice, setDismissNotice] = React.useState(true);
  React.useEffect(() => {
    setDismissNotice(localStorage.getItem('profile_notice_dismissed_v2') === 'true');
  }, []);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'leader': return 'Líder';
      case 'diplomat': return 'Diplomata';
      case 'military_leader': return 'Líder Militar';
      case 'recruiter': return 'Recrutador';
      case 'muse': return 'Musa';
      case 'warrior': return 'Guerreiro';
      default: return role;
    }
  };

  // Level thresholds and logic
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 200 XP, up to Level 10
  const thresholds = [0, 0, 100, 200, 400, 700, 1100, 1600, 2200, 2900, 3700];
  const currentXp = myMember?.xp || 0;
  const currentLevel = myMember?.level || 0;
  const nextLevelXp = thresholds[currentLevel + 1] || thresholds[thresholds.length - 1];
  const curLevelXp = thresholds[currentLevel] || 0;
  
  const xpProgress = currentLevel >= 10 ? 100 : ((currentXp - curLevelXp) / (nextLevelXp - curLevelXp)) * 100;
  const trophyProgress = ((myMember?.trophies || 0) / 100) * 100;

  const getBorderClasses = (borderId?: string) => {
    if (isEcoMode) {
      switch (borderId) {
        case 'border_cyan': return 'border-2 border-cyan-400';
        case 'border_purple': return 'border-2 border-purple-500';
        case 'border_gold': return 'border-2 border-gaming-gold';
        case 'border_dark': return 'border-2 border-red-600';
        case 'border_emerald': return 'border-2 border-sky-400';
        case 'border_rgb': return 'border-2 border-pink-500';
        case 'border_laser': return 'border-2 border-purple-500';
        case 'border_cyber': return 'border-2 border-cyan-400';
        case 'border_cosmic': return 'border-2 border-indigo-400';
        case 'border_fire': return 'border-2 border-red-500';
        default: return 'border-2 border-white/10';
      }
    }
    switch (borderId) {
      case 'border_cyan': return 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]';
      case 'border_purple': return 'border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
      case 'border_gold': return 'border-2 border-gaming-gold shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse';
      case 'border_dark': return 'border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.7)]';
      case 'border_emerald': return 'border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-pulse';
      case 'border_rgb': return 'border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.7)] animate-bounce';
      case 'border_laser': return 'border-2 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse';
      case 'border_cyber': return 'border-2 border-cyan-400 ring-2 ring-pink-500/40 shadow-[0_0_20px_rgba(6,182,212,0.7)] animate-pulse';
      case 'border_cosmic': return 'border-2 border-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse ring-4 ring-purple-600/20';
      case 'border_fire': return 'border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse';
      default: return 'border-2 border-gaming-gold/30';
    }
  };

  const getNicknameColorClass = (colorId?: string) => {
    if (isEcoMode) {
      switch (colorId) {
        case 'color_gold': return 'text-[#c5a059] font-bold';
        case 'color_red': return 'text-[#b25d62] font-semibold';
        case 'color_cyan': return 'text-[#93c5fd] font-semibold';
        case 'color_pink': return 'text-[#c084fc] font-semibold';
        case 'color_emerald': return 'text-[#7dd3fc] font-semibold';
        case 'color_purple': return 'text-[#c0a9df] font-semibold';
        case 'color_rgb': return 'text-gaming-gold font-extrabold';
        default: return 'text-white';
      }
    }
    switch (colorId) {
      case 'color_gold': return 'text-[#c5a059] font-bold drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]';
      case 'color_red': return 'text-[#b25d62] font-semibold drop-shadow-[0_0_8px_rgba(178,93,98,0.3)]';
      case 'color_cyan': return 'text-[#93c5fd] font-semibold drop-shadow-[0_0_8px_rgba(147,197,253,0.3)]';
      case 'color_pink': return 'text-[#c084fc] font-semibold drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]';
      case 'color_emerald': return 'text-[#7dd3fc] font-semibold drop-shadow-[0_0_8px_rgba(125,211,252,0.3)]';
      case 'color_purple': return 'text-[#c0a9df] font-semibold drop-shadow-[0_0_8px_rgba(192,169,223,0.3)]';
      case 'color_rgb': return 'bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_3px_rgba(226,232,240,0.3)]';
      default: return 'text-white';
    }
  };

  return (
    <section className="relative w-full rounded-2xl overflow-hidden bg-gaming-card border border-gaming-border mb-4 md:mb-6 transition-all duration-500">
      {/* New Feature Notification */}
      {!dismissNotice && (
        <div 
          onClick={() => setActiveTab('guia')}
          className="bg-linear-to-r from-gaming-gold/20 via-gaming-gold/5 to-transparent border-b border-gaming-gold/20 px-4 md:px-8 py-2.5 flex items-center justify-between group cursor-pointer hover:bg-gaming-gold/30 transition-all font-display relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gaming-gold flex items-center justify-center text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce shrink-0">
              <BookOpen size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-gaming-gold">Dica Estratégica!</span>
              <span className="text-[9px] md:text-[11px] font-bold text-white/70 pr-4">O novo menu de <span className="text-white italic">Guias & Dicas</span> já está disponível no menu lateral 📚</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={16} className="text-gaming-gold group-hover:translate-x-1 transition-transform" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem('profile_notice_dismissed_v2', 'true');
                setDismissNotice(true);
              }}
              className="p-1 rounded bg-black/40 text-zinc-450 hover:text-white border border-white/5 cursor-pointer z-10"
              title="Fechar"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
      
      {/* Background Image/Art */}
      <div className="absolute inset-0 opacity-65 pointer-events-none overflow-hidden">
        <img 
          src={myMember?.profileBg || "https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748"} 
          alt="Art" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />

        {/* Suprema Banners Animados Overlay */}
        {myMember?.bannerEffect === 'effect_fire' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-red-950/20 via-orange-900/10 to-red-600/15 mix-blend-color-dodge animate-pulse">
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.25)_0,transparent_60%)] blur-3xl animate-bounce" style={{ animationDuration: '6s' }} />
            <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0,transparent_75%)] blur-2xl animate-pulse" style={{ animationDuration: '4.5s' }} />
          </div>
        )}
        {myMember?.bannerEffect === 'effect_neon' && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-purple-900/15 to-cyan-950/20">
            <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-500 to-transparent opacity-40 animate-pulse" />
            <div className="absolute top-0 bottom-0 left-2/4 w-0.5 bg-gradient-to-b from-purple-400 via-pink-500 to-transparent opacity-60 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-gradient-to-b from-pink-400 via-cyan-500 to-transparent opacity-45 animate-pulse" style={{ animationDuration: '2.5s' }} />
          </div>
        )}
        {myMember?.bannerEffect === 'effect_matrix' && (
          <div className="absolute inset-0 bg-black/40 overflow-hidden font-mono text-[7px] text-gaming-purple/40 select-none whitespace-nowrap leading-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="absolute animate-pulse" style={{ left: `${i * 9}%`, top: `${(i % 3) * 20}%`, animationDelay: `${i * 200}ms` }}>
                101001100101
              </div>
            ))}
          </div>
        )}
        {myMember?.bannerEffect === 'effect_cosmic' && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-24 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2)_0,transparent_55%)] blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-900/10 via-purple-900/10 to-pink-900/10" />
          </div>
        )}
      </div>

      <div className={`relative ${isMobile ? 'p-4 gap-4' : 'p-6 gap-6'} flex ${isMobile ? 'flex-col items-stretch' : 'flex-row items-center'}`}>
        {/* Left: Avatar & Info */}
        <div className={`flex ${isMobile ? 'flex-col items-center text-center gap-3' : 'flex-row items-center gap-6'} flex-1`}>
          <div className="relative group">
            {!isEcoMode && <div className={`absolute -inset-1.5 rounded-full blur-lg opacity-25 transition duration-1000 ${myMember?.profileBorder === 'border_gold' ? 'bg-gaming-gold' : 'bg-gaming-gold/40'}`}></div>}
            <div className={`relative ${isMobile ? 'w-16 h-16' : 'w-24 h-24'} rounded-full p-0.5 flex items-center justify-center ${getBorderClasses(myMember?.profileBorder)}`}>
              <SafeAvatar 
                src={myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                className="w-full h-full object-cover rounded-full"
                isEcoMode={isEcoMode}
              />
            </div>
          </div>

          <div className={`flex flex-col gap-2 md:gap-3 ${isMobile ? 'items-center' : 'items-start'}`}>
            <div className="flex flex-col">
              {myMember?.title && (
                <div className="flex items-center gap-1 mb-1 justify-center md:justify-start">
                  <span className="px-1.5 py-0.5 bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/15 rounded text-[7.5px] font-black uppercase tracking-[0.15em] block">
                    🏅 {myMember.title}
                  </span>
                </div>
              )}
              <h1 className={`${isMobile ? 'text-base' : 'text-xl'} font-sans font-bold tracking-tight mb-0.5 text-zinc-100`}>
                <span className={getNicknameColorClass(myMember?.nicknameColor)}>{myMember?.name || 'Recruta'}</span> <span className="text-gaming-gold text-[11px] md:text-[13px] opacity-80 uppercase font-mono">[{clan?.tag || '---'}]</span>
              </h1>
              <span className="text-[8px] md:text-[9.5px] text-zinc-400/80 uppercase tracking-wider font-bold">{leader && leader.userId === user?.uid ? "Fundador da Ordem Suprema" : "Membro leal da Ordem Suprema"}</span>
              {myMember?.customStatus && (
                <div className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 bg-black/40 border border-white/5 rounded-full text-[8.5px] md:text-[9.5px] text-zinc-300 italic font-medium w-fit">
                  <span>💬 {myMember.customStatus}</span>
                </div>
              )}
            </div>

            <div className={`flex gap-1 flex-wrap ${isMobile ? 'justify-center' : ''}`}>
              {[
                { icon: MapPin, label: "Na Base", action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('inicio'); } },
                { icon: Search, label: "Ver Ranking", action: () => { setActiveTab('inicio'); setTimeout(() => document.getElementById('member-list-section')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
                { icon: Users, label: "Clã", action: () => setActiveTab('inicio') },
                { icon: LogOut, label: "Sair", action: () => auth.signOut() }
              ].map((btn) => (
                <button 
                  key={btn.label} 
                  onClick={(e) => {
                    e.stopPropagation();
                    btn.action();
                  }}
                  className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] md:text-[8.5px] font-bold uppercase hover:bg-white/10 hover:border-gaming-gold/30 transition-all flex items-center gap-1 group"
                >
                  <btn.icon size={8} className="text-gaming-gold/70 group-hover:text-gaming-gold" />
                  {!isMobile && btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Level & Progress */}
        <div className={`flex flex-col gap-4 ${isMobile ? 'w-full' : 'w-64'}`}>
           {/* XP Level Bar */}
           <div className="flex flex-col gap-1.5">
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Nível de Ordem</span>
                  <span className="text-sm font-bold text-gaming-gold font-mono">{currentLevel}</span>
               </div>
               <span className="text-[8.5px] font-mono text-zinc-400">{currentXp} / {nextLevelXp} XP</span>
             </div>
             <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[0.5px]">
                <motion.div 
                  initial={!isEcoMode ? { width: 0 } : { width: `${xpProgress}%` }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={!isEcoMode ? { duration: 1, ease: 'easeOut' } : { duration: 0 }}
                  className="h-full bg-linear-to-r from-gaming-purple to-pink-500 rounded-full"
                />
             </div>
           </div>

           {/* Remodeled Stats Grid */}
           <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2 flex flex-col gap-0.5 hover:bg-zinc-900/40 transition-all group overflow-hidden relative">
                 <div className="relative z-10 flex flex-col">
                    <span className="text-[7px] uppercase font-bold text-zinc-400/60 tracking-wider">Patente</span>
                    <span className={`text-[8.5px] font-bold uppercase tracking-tight ${myMember?.role === 'leader' ? 'text-gaming-gold' : 'text-blue-400'}`}>{getRoleLabel(myMember?.role || 'warrior')}</span>
                 </div>
                 <Shield size={20} className="absolute -right-1 -bottom-1 text-white/5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2 flex flex-col gap-0.5 hover:bg-zinc-900/40 transition-all group overflow-hidden relative">
                 <div className="relative z-10 flex flex-col">
                    <span className="text-[7px] uppercase font-bold text-zinc-400/60 tracking-wider">Status</span>
                    <span className="text-[8.5px] font-bold uppercase text-emerald-400 tracking-tight">Ativo</span>
                 </div>
                 <Circle size={14} className="absolute -right-1 -bottom-1 text-emerald-400/10 fill-current group-hover:scale-110 transition-transform" />
              </div>

              <div className="col-span-2 bg-zinc-950/30 border border-white/5 rounded-lg p-2 flex items-center justify-between group overflow-hidden relative">
                 <div className="relative z-10">
                    <span className="text-[6.5px] uppercase font-bold text-zinc-500 tracking-wider block">Mestre da Aliança</span>
                    <span className="text-[9.5px] font-bold text-white uppercase tracking-tight">{leader?.name || 'Skadir'}</span>
                 </div>
                 <Skull size={20} className="text-white/5 absolute -right-1 -bottom-1 rotate-12 group-hover:scale-110 transition-transform" />
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
