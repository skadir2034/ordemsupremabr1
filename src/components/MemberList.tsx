import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Circle, UserPlus, Users, LogOut, Edit2, Trash2, X } from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';
import { AVATAR_DECORATIONS } from '../collectiblesData';

export function MemberList({ isMobile = false }: { isMobile?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState('membros');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const { members, loading, logout, myMember, deleteMember, updateMemberRole, isEcoMode } = useClan();
  
  const [forceUpdateToggle, setForceUpdateToggle] = useState(0);

  const rawSortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (activeSubTab === 'poder') {
        return (b.heroPower || 0) - (a.heroPower || 0);
      }
      if (activeSubTab === 'nivel') {
        return (b.xp || 0) - (a.xp || 0);
      }
      
      // Default / Elite (membros):
      // Prioridade 1: Eventos feitos (elixir_confirm e caca_rato_confirm)
      const eventsA = (a.completedMissions || []).filter(id => id === 'elixir_confirm' || id === 'caca_rato_confirm').length;
      const eventsB = (b.completedMissions || []).filter(id => id === 'elixir_confirm' || id === 'caca_rato_confirm').length;
      
      if (eventsB !== eventsA) {
        return eventsB - eventsA;
      }
      
      // Prioridade 2: Insígnias (trophies)
      const trophiesA = a.trophies || 0;
      const trophiesB = b.trophies || 0;
      if (trophiesB !== trophiesA) {
        return trophiesB - trophiesA;
      }
      
      // Prioridade 3: Poder de herói
      return (b.heroPower || 0) - (a.heroPower || 0);
    });
  }, [members, activeSubTab]);

  const sortedMembers = useMemo(() => {
    if (members.length === 0) return [];
    
    const cacheKey = `ranking_cache_${activeSubTab}`;
    const timeKey = `ranking_time_${activeSubTab}`;
    const now = Date.now();
    
    const cachedStr = localStorage.getItem(cacheKey);
    const cachedTimeStr = localStorage.getItem(timeKey);
    const cachedTime = cachedTimeStr ? parseInt(cachedTimeStr, 10) : 0;
    const ONE_HOUR = 60 * 60 * 1000;
    
    if (cachedStr && cachedTime && (now - cachedTime < ONE_HOUR) && forceUpdateToggle === 0) {
      try {
        const parsed = JSON.parse(cachedStr) as any[];
        const existingIds = new Set(members.map(m => m.id));
        const filteredParsed = parsed.filter(m => existingIds.has(m.id));
        
        const memberMap = new Map(members.map(m => [m.id, m]));
        const updatedParsed = filteredParsed.map((cachedMember: any) => {
          const liveMember = memberMap.get(cachedMember.id);
          return liveMember ? Object.assign({}, cachedMember, liveMember) : cachedMember;
        });

        // Add any new members that aren't in the cached ranking to the end of the list
        const cachedIds = new Set(filteredParsed.map(m => m.id));
        const missingMembers = members.filter(m => !cachedIds.has(m.id));
        if (missingMembers.length > 0) {
          const sortedMissing = [...missingMembers].sort((a, b) => {
            if (activeSubTab === 'poder') return (b.heroPower || 0) - (a.heroPower || 0);
            if (activeSubTab === 'nivel') return (b.xp || 0) - (a.xp || 0);
            return (b.heroPower || 0) - (a.heroPower || 0);
          });
          return [...updatedParsed, ...sortedMissing];
        }

        if (updatedParsed.length > 0) {
          return updatedParsed;
        }
      } catch (err) {
        // Fallback
      }
    }
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(rawSortedMembers));
      localStorage.setItem(timeKey, now.toString());
    } catch (e) {
      console.warn("Storage quota full, unable to write ranking cache");
    }
    
    return rawSortedMembers;
  }, [rawSortedMembers, members, activeSubTab, forceUpdateToggle]);

  const forceRefresh = () => {
    const cacheKey = `ranking_cache_${activeSubTab}`;
    const timeKey = `ranking_time_${activeSubTab}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timeKey);
    setForceUpdateToggle(prev => prev + 1);
    setTimeout(() => setForceUpdateToggle(0), 100);
  };

  const getCacheRemainingStr = () => {
    const timeKey = `ranking_time_${activeSubTab}`;
    const cachedTimeStr = localStorage.getItem(timeKey);
    if (!cachedTimeStr) return 'Atualizado agora';
    const cachedTime = parseInt(cachedTimeStr, 10);
    const elapsed = Date.now() - cachedTime;
    const ONE_HOUR = 60 * 60 * 1000;
    if (elapsed >= ONE_HOUR) return 'Sincronizar';
    
    const remainingMs = ONE_HOUR - elapsed;
    const remainingMins = Math.ceil(remainingMs / 1000 / 60);
    return `Atualização automática em ${remainingMins} min`;
  };

  const [editingMember, setEditingMember] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isLeader = myMember?.role === 'leader';

  const [visibleLimit, setVisibleLimit] = useState(12);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleShowMore = () => {
    if (isEcoMode) {
      setVisibleLimit(sortedMembers.length);
      return;
    }
    setIsExpanding(true);
    const interval = setTimeout(() => {
      setVisibleLimit((prev) => Math.min(sortedMembers.length, prev + 12));
      setIsExpanding(false);
    }, 200);
  };

  const visibleMembers = useMemo(() => {
    // Top 3 is in podium, table lists #4 onwards!
    if (sortedMembers.length > 3) {
      return sortedMembers.slice(3, Math.max(3, visibleLimit));
    }
    return [];
  }, [sortedMembers, visibleLimit]);

  const handleDeleteMember = async (memberId: string, name: string) => {
    if (confirm(`Deseja realmente ELIMINAR ${name} da Ordem Suprema? Esta ação removerá o acesso do usuário.`)) {
      setDeletingId(memberId);
      try {
        await deleteMember(memberId);
      } catch (err) {
        console.error('Delete error:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handlePromotion = (memberId: string, currentRole: string) => {
    const roles: ('warrior' | 'muse' | 'recruiter' | 'military_leader' | 'diplomat' | 'leader')[] = 
      ['warrior', 'muse', 'recruiter', 'military_leader', 'diplomat', 'leader'];
    const currentIndex = roles.indexOf(currentRole as any);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    
    if (nextRole === 'leader') {
      if (confirm('Deseja transferir a Liderança? Você perderá seus privilégios de Líder.')) {
        updateMemberRole(memberId, 'leader');
        updateMemberRole(myMember!.id, 'diplomat');
      }
    } else {
      updateMemberRole(memberId, nextRole);
    }
  };

  const handleInvite = async () => {
    const shareData = {
      title: 'Aliança Suprema Ordem',
      text: 'Junte-se à nossa Aliança em Suprema Ordem!',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const url = window.location.origin;
        await navigator.clipboard.writeText(url);
        alert('Link da Aliança copiado para a área de transferência!');
      }
    } catch (err) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('cancel'))) {
        return;
      }
      console.error('Error sharing:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-gaming-gold';
      case 'diplomat': return 'text-gaming-purple';
      case 'military_leader': return 'text-red-500';
      case 'recruiter': return 'text-sky-400';
      case 'muse': return 'text-pink-400';
      case 'warrior': return 'text-blue-400';
      default: return 'text-white/60';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return '💀';
      case 'diplomat': return '📜';
      case 'military_leader': return '⚔️';
      case 'recruiter': return '📢';
      case 'muse': return '✨';
      case 'warrior': return '🛡️';
      default: return '🔰';
    }
  };

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

  const getBorderClasses = (borderId?: string) => {
    if (isEcoMode) {
      switch (borderId) {
        case 'border_cyan': return 'border border-cyan-400';
        case 'border_purple': return 'border border-purple-500';
        case 'border_gold': return 'border border-gaming-gold';
        case 'border_dark': return 'border border-red-600';
        case 'border_emerald': return 'border border-sky-400';
        case 'border_rgb': return 'border border-pink-500';
        case 'border_laser': return 'border border-purple-500';
        case 'border_cyber': return 'border border-cyan-400';
        case 'border_cosmic': return 'border border-indigo-400';
        case 'border_fire': return 'border border-red-500';
        default: return 'border border-white/10';
      }
    }
    switch (borderId) {
      case 'border_cyan': return 'border border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]';
      case 'border_purple': return 'border border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]';
      case 'border_gold': return 'border border-gaming-gold shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse';
      case 'border_dark': return 'border border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.7)]';
      case 'border_emerald': return 'border border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)] animate-pulse';
      case 'border_rgb': return 'border border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.7)] animate-bounce';
      case 'border_laser': return 'border border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-pulse';
      case 'border_cyber': return 'border border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-pulse';
      case 'border_cosmic': return 'border border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.7)] animate-pulse';
      case 'border_fire': return 'border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse';
      default: return 'border border-white/10';
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
      case 'color_gold': return 'text-[#c5a059] font-bold drop-shadow-[0_0_6px_rgba(197,160,89,0.4)]';
      case 'color_red': return 'text-[#b25d62] font-semibold drop-shadow-[0_0_6px_rgba(178,93,98,0.3)]';
      case 'color_cyan': return 'text-[#93c5fd] font-semibold drop-shadow-[0_0_6px_rgba(147,197,253,0.3)]';
      case 'color_pink': return 'text-[#c084fc] font-semibold drop-shadow-[0_0_6px_rgba(192,132,252,0.3)]';
      case 'color_emerald': return 'text-[#7dd3fc] font-semibold drop-shadow-[0_0_6px_rgba(125,211,252,0.3)]';
      case 'color_purple': return 'text-[#c0a9df] font-semibold drop-shadow-[0_0_6px_rgba(192,169,223,0.3)]';
      case 'color_rgb': return 'bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_3px_rgba(226,232,240,0.3)]';
      default: return 'text-white';
    }
  };

  const top1 = sortedMembers[0];
  const top2 = sortedMembers[1];
  const top3 = sortedMembers[2];

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Visual Header */}
      <div className="flex flex-col gap-1 mb-5 text-left">
        <h2 className="text-sm sm:text-base font-bold uppercase text-white tracking-wider leading-none">
          Mural dos <span className="text-gaming-gold">Supremos</span>
        </h2>
        <span className="text-[7.5px] sm:text-[8.5px] font-mono font-medium text-zinc-500 uppercase tracking-widest">
          Classificação oficial de status, conquistas e poder de combate em tempo real
        </span>
      </div>

      {/* Competitive Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/5 pb-1.5">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveSubTab('membros')}
            className={`text-[8px] sm:text-[9px] uppercase font-bold tracking-wider relative py-1.5 shrink-0 transition-colors ${activeSubTab === 'membros' ? 'text-gaming-gold' : 'text-zinc-450 hover:text-zinc-300'}`}
          >
            🏆 Geral (Elite)
            {activeSubTab === 'membros' && <motion.div layoutId="memberTab" className="absolute -bottom-[7px] left-0 right-0 h-[1.5px] bg-gaming-gold" />}
          </button>
          <button 
            onClick={() => setActiveSubTab('poder')}
            className={`text-[8px] sm:text-[9px] uppercase font-bold tracking-wider relative py-1.5 shrink-0 transition-colors ${activeSubTab === 'poder' ? 'text-gaming-gold' : 'text-zinc-450 hover:text-zinc-300'}`}
          >
            ⚔️ Poder de Herói
            {activeSubTab === 'poder' && <motion.div layoutId="memberTab" className="absolute -bottom-[7px] left-0 right-0 h-[1.5px] bg-gaming-gold" />}
          </button>
          <button 
            onClick={() => setActiveSubTab('nivel')}
            className={`text-[8px] sm:text-[9px] uppercase font-bold tracking-wider relative py-1.5 shrink-0 transition-colors ${activeSubTab === 'nivel' ? 'text-gaming-gold' : 'text-zinc-450 hover:text-zinc-300'}`}
          >
            ⚡ Nível & XP
            {activeSubTab === 'nivel' && <motion.div layoutId="memberTab" className="absolute -bottom-[7px] left-0 right-0 h-[1.5px] bg-gaming-gold" />}
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 bg-white/[0.01] border border-white/5 rounded-md text-[7.5px] sm:text-[8.5px] font-mono tracking-wider text-zinc-500">
          <span>{getCacheRemainingStr()}</span>
          <button 
            onClick={forceRefresh}
            className="text-gaming-gold hover:text-white bg-gaming-gold/5 hover:bg-gaming-gold/15 border border-gaming-gold/15 transition-all cursor-pointer rounded px-1.5 py-0.5 ml-1 font-bold text-[7.5px] uppercase tracking-wider flex items-center gap-1 shrink-0"
          >
            Sincronizar 🔄
          </button>
        </div>
      </div>

      {/* PRESTIGE PODIUM FOR TOP 3 */}
      {!loading && sortedMembers.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-3xl mx-auto w-full mb-8 mt-2 px-1 sm:px-4">
          
          {/* #2 SILVER */}
          <div className="flex flex-col items-center">
            {top2 ? (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onClick={() => setSelectedMember(top2)}
                className="flex flex-col items-center cursor-pointer group w-full"
              >
                <div className="relative mb-2 shrink-0">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[14px] sm:text-[18px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] z-25">🥈</span>
                  <div className="relative w-9 h-9 sm:w-16 sm:h-16 flex items-center justify-center">
                    <SafeAvatar 
                      src={top2.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top2.userId || top2.id}`} 
                      alt={top2.name} 
                      className={`w-full h-full rounded-full object-cover shadow-xl ${getBorderClasses(top2.profileBorder)}`} 
                      isEcoMode={isEcoMode}
                    />
                    {AVATAR_DECORATIONS.find(b => b.id === top2.profileBorder) && (
                      <img 
                        src={AVATAR_DECORATIONS.find(b => b.id === top2.profileBorder)?.imgSrc} 
                        alt="decor" 
                        referrerPolicy="no-referrer"
                        className="absolute -inset-1 sm:-inset-2 w-[calc(100%+8px)] h-[calc(100%+8px)] sm:w-[calc(100%+16px)] sm:h-[calc(100%+16px)] max-w-none pointer-events-none z-20"
                      />
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-zinc-650 text-white text-[6.5px] sm:text-[9px] font-black px-1 py-0.5 rounded-md border border-black font-mono leading-none z-30">
                      L{top2.level || 0}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-zinc-950/45 border-t border-x border-white/5 rounded-t-xl sm:rounded-t-2rem p-2 sm:p-4 text-center flex flex-col items-center justify-end h-20 sm:h-28 shadow-xl transition-all group-hover:bg-[#18191c]/80 group-hover:border-white/10">
                  <span className="text-xs sm:text-lg font-mono font-black text-zinc-400 leading-none mb-1">#2</span>
                  <span className={`text-[8.5px] sm:text-xs font-black truncate max-w-full leading-tight ${getNicknameColorClass(top2.nicknameColor)}`}>{top2.name}</span>
                  <span className="text-[7.5px] sm:text-[10px] font-mono font-black text-red-500 italic mt-1 leading-none">{(top2.heroPower || 0).toLocaleString()}</span>
                  <span className="text-[5.5px] sm:text-[7.5px] font-black uppercase text-zinc-500 tracking-wider mt-0.5 leading-none">Poder</span>
                </div>
              </motion.div>
            ) : (
              <div className="opacity-15 flex flex-col items-center w-full">
                <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-dashed border-white/20 mb-2 flex items-center justify-center text-xs text-white/40">?</div>
                <div className="w-full bg-zinc-950/20 border-t border-x border-white/5 rounded-t-xl sm:rounded-t-2rem h-20 sm:h-28 flex flex-col items-center justify-center">
                  <span className="text-[6.5px] font-bold text-white/20 uppercase tracking-widest text-center">Vago</span>
                </div>
              </div>
            )}
          </div>

          {/* #1 GOLD (CENTER) */}
          <div className="flex flex-col items-center z-10">
            {top1 ? (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                onClick={() => setSelectedMember(top1)}
                className="flex flex-col items-center cursor-pointer group w-full"
              >
                <div className="relative mb-3 shrink-0">
                  <motion.span 
                    animate={!isEcoMode ? { rotate: [-4, 4, -4], scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-[22px] sm:text-[28px] drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] z-25"
                  >
                    👑
                  </motion.span>
                  <div className="relative w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center">
                    <SafeAvatar 
                      src={top1.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top1.userId || top1.id}`} 
                      alt={top1.name} 
                      className={`w-full h-full rounded-full object-cover shadow-[0_0_20px_rgba(251,191,36,0.15)] ${getBorderClasses(top1.profileBorder || 'border_gold')}`} 
                      isEcoMode={isEcoMode}
                    />
                    {AVATAR_DECORATIONS.find(b => b.id === (top1.profileBorder || 'border_gold')) && (
                      <img 
                        src={AVATAR_DECORATIONS.find(b => b.id === (top1.profileBorder || 'border_gold'))?.imgSrc} 
                        alt="decor" 
                        referrerPolicy="no-referrer"
                        className="absolute -inset-1.5 sm:-inset-2.5 w-[calc(100%+12px)] h-[calc(100%+12px)] sm:w-[calc(100%+20px)] sm:h-[calc(100%+20px)] max-w-none pointer-events-none z-20"
                      />
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-gaming-gold text-black text-[7px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md border border-black font-mono shadow-[0_0_8px_rgba(251,191,36,0.4)] leading-none z-30">
                      L{top1.level || 0}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-[#1b1915]/90 border-t border-x border-gaming-gold/25 rounded-t-xl sm:rounded-t-2rem p-2 sm:p-5 text-center flex flex-col items-center justify-end h-26 sm:h-38 shadow-2xl relative overflow-hidden transition-all group-hover:border-gaming-gold/50">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gaming-gold to-transparent" />
                  <span className="text-sm sm:text-2xl font-mono font-black text-gaming-gold leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] mb-1">#1</span>
                  <span className={`text-[9.5px] sm:text-sm font-black truncate max-w-full leading-tight ${getNicknameColorClass(top1.nicknameColor)}`}>{top1.name}</span>
                  <span className="text-[8px] sm:text-[11px] font-mono font-black text-red-500 italic mt-1 leading-none">{(top1.heroPower || 0).toLocaleString()}</span>
                  <span className="text-[5.5px] sm:text-[7.5px] font-black uppercase text-gaming-gold/60 tracking-wider mt-0.5 leading-none">Elite</span>
                </div>
              </motion.div>
            ) : (
              <div className="opacity-15 flex flex-col items-center w-full">
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-dashed border-white/20 mb-3 flex items-center justify-center text-xs text-white/40">?</div>
                <div className="w-full bg-zinc-950/20 border-t border-x border-white/5 rounded-t-xl sm:rounded-t-2rem h-26 sm:h-38 flex flex-col items-center justify-center">
                  <span className="text-[6.5px] font-bold text-white/20 uppercase tracking-widest text-center">Vago</span>
                </div>
              </div>
            )}
          </div>

          {/* #3 BRONZE */}
          <div className="flex flex-col items-center">
            {top3 ? (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                onClick={() => setSelectedMember(top3)}
                className="flex flex-col items-center cursor-pointer group w-full"
              >
                <div className="relative mb-2 shrink-0">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[14px] sm:text-[18px] drop-shadow-[0_0_8px_rgba(224,115,41,0.4)] z-25">🥉</span>
                  <div className="relative w-9 h-9 sm:w-16 sm:h-16 flex items-center justify-center">
                    <SafeAvatar 
                      src={top3.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3.userId || top3.id}`} 
                      alt={top3.name} 
                      className={`w-full h-full rounded-full object-cover shadow-xl ${getBorderClasses(top3.profileBorder)}`} 
                      isEcoMode={isEcoMode}
                    />
                    {AVATAR_DECORATIONS.find(b => b.id === top3.profileBorder) && (
                      <img 
                        src={AVATAR_DECORATIONS.find(b => b.id === top3.profileBorder)?.imgSrc} 
                        alt="decor" 
                        referrerPolicy="no-referrer"
                        className="absolute -inset-1 sm:-inset-2 w-[calc(100%+8px)] h-[calc(100%+8px)] sm:w-[calc(100%+16px)] sm:h-[calc(100%+16px)] max-w-none pointer-events-none z-20"
                      />
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-[#ba6849] text-white text-[6.5px] sm:text-[9px] font-black px-1 py-0.5 rounded-md border border-black font-mono leading-none z-30">
                      L{top3.level || 0}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-zinc-950/45 border-t border-x border-white/5 rounded-t-xl sm:rounded-t-2rem p-2 sm:p-4 text-center flex flex-col items-center justify-end h-16 sm:h-24 shadow-xl transition-all group-hover:bg-[#18191c]/80 group-hover:border-white/10">
                  <span className="text-xs sm:text-lg font-mono font-black text-[#ca7759] leading-none mb-1">#3</span>
                  <span className={`text-[8.5px] sm:text-xs font-black truncate max-w-full leading-tight ${getNicknameColorClass(top3.nicknameColor)}`}>{top3.name}</span>
                  <span className="text-[7.5px] sm:text-[10px] font-mono font-black text-red-500 italic mt-1 leading-none">{(top3.heroPower || 0).toLocaleString()}</span>
                  <span className="text-[5.5px] sm:text-[7.5px] font-black uppercase text-zinc-500 tracking-wider mt-0.5 leading-none">Poder</span>
                </div>
              </motion.div>
            ) : (
              <div className="opacity-15 flex flex-col items-center w-full">
                <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-dashed border-white/20 mb-2 flex items-center justify-center text-xs text-white/40">?</div>
                <div className="w-full bg-zinc-950/20 border-t border-x border-white/5 rounded-t-xl sm:rounded-t-2rem h-16 sm:h-24 flex flex-col items-center justify-center">
                  <span className="text-[6.5px] font-bold text-white/20 uppercase tracking-widest text-center">Vago</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* DETAILED RANKING LIST - FROM RANK #4 ONWARDS */}
      <div className="flex-1 bg-gaming-card/30 rounded-2xl border border-gaming-border overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto no-scrollbar scroll-smooth flex-1">
          {!isMobile ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gaming-border bg-white/[0.02]">
                  <th className="px-6 py-4 text-[9px] uppercase text-white/20 font-bold tracking-widest">#</th>
                  <th className="px-6 py-4 text-[9px] uppercase text-white/20 font-bold tracking-widest">Guerreiro</th>
                  <th className="px-6 py-4 text-[9px] uppercase text-white/20 font-bold tracking-widest text-center">Poder</th>
                  <th className="px-6 py-4 text-[9px] uppercase text-white/20 font-bold tracking-widest text-center">Patente</th>
                  <th className="px-6 py-4 text-[9px] uppercase text-white/20 font-bold tracking-widest">Desde</th>
                  <th className="px-6 py-4 text-[9px] uppercase text-white/20 font-bold tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-4 h-16 bg-white/5" />
                      </tr>
                    ))
                  ) : sortedMembers.length <= 3 ? (
                    <motion.tr 
                      key="empty-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="px-6 py-12 text-center text-white/20 uppercase text-[9px] tracking-[0.2em] font-bold">
                        Todos os integrantes estão listados no Pódio
                      </td>
                    </motion.tr>
                  ) : visibleMembers.map((m, index) => (
                    <motion.tr 
                      key={m.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => setSelectedMember(m)}
                      className="group hover:bg-white/5 transition-colors cursor-pointer"
                    >
                    <td className="px-6 py-4">
                      {/* Starts from index + 4, representing Rank #4 onwards */}
                      <div className="w-7 h-7 flex items-center justify-center text-[10px] font-mono font-black text-white/30 border border-white/10 rounded-lg group-hover:border-gaming-gold/50 group-hover:text-gaming-gold transition-all">
                        {index + 4}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group/avatar shrink-0 w-8 h-8 flex items-center justify-center">
                          <SafeAvatar 
                            src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId || m.id}`} 
                            alt={m.name} 
                            className={`w-full h-full rounded-full object-cover shadow-[0_0_10px_rgba(0,0,0,0.5)] ${getBorderClasses(m.profileBorder)}`} 
                            isEcoMode={isEcoMode}
                          />
                          {AVATAR_DECORATIONS.find(b => b.id === m.profileBorder) && (
                            <img 
                              src={AVATAR_DECORATIONS.find(b => b.id === m.profileBorder)?.imgSrc} 
                              alt="decor" 
                              referrerPolicy="no-referrer"
                              className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] max-w-none pointer-events-none z-20"
                            />
                          )}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gaming-gold rounded-full flex items-center justify-center border border-black shadow-[0_0_10px_rgba(251,191,36,0.8)] z-30">
                            <span className="text-[7px] font-black text-black leading-none">{m.level || 0}</span>
                          </div>
                          {!isEcoMode && <div className="absolute inset-0 rounded-full bg-gaming-gold/20 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity z-5" />}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold transition-colors ${getNicknameColorClass(m.nicknameColor)}`}>{m.name}</span>
                            {m.title && (
                              <span className="bg-gaming-gold/10 text-gaming-gold text-[7px] font-black uppercase tracking-[0.1em] px-1 py-0.5 rounded border border-gaming-gold/20 scale-95 uppercase font-sans">
                                {m.title}
                              </span>
                            )}
                          </div>
                          {m.customStatus && (
                            <span className="text-[9px] text-white/50 italic font-medium tracking-wide mt-0.5 max-w-[180px] truncate" title={m.customStatus}>
                              💬 {m.customStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-mono font-black text-red-500 italic">{(m.heroPower || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-gaming-gold text-xs drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{getRoleIcon(m.role)}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeColor(m.role)}`}>
                          {getRoleLabel(m.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-medium text-white/40">{m.joinedAt || '---'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Circle size={8} className={m.status === 'online' ? 'fill-gaming-gold text-gaming-gold animate-pulse shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'fill-white/10 text-white/10'} />
                        <span className={`text-[10px] font-bold ${m.status === 'online' ? 'text-gaming-gold' : 'text-white/20'}`}>
                          {m.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col p-4 gap-3">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                  ))
                ) : sortedMembers.length <= 3 ? (
                  <div className="py-8 text-center text-white/25 uppercase text-[9px] tracking-widest font-black leading-relaxed">
                    Nenhum integrante adicional.<br />Todos listados no Pódio de Honra.
                  </div>
                ) : visibleMembers.map((m, index) => (
                  <motion.div 
                    key={m.id} 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, x: -50 }}
                    onClick={() => setSelectedMember(m)}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/10 transition-colors gpu-accelerate"
                  >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative group/avatar shrink-0 w-10 h-10 flex items-center justify-center">
                      <SafeAvatar 
                        src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId || m.id}`} 
                        alt={m.name} 
                        className={`w-full h-full rounded-full object-cover shadow-[0_0_15px_rgba(0,0,0,0.5)] ${getBorderClasses(m.profileBorder)}`} 
                        isEcoMode={isEcoMode}
                      />
                      {AVATAR_DECORATIONS.find(b => b.id === m.profileBorder) && (
                        <img 
                          src={AVATAR_DECORATIONS.find(b => b.id === m.profileBorder)?.imgSrc} 
                          alt="decor" 
                          referrerPolicy="no-referrer"
                          className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] max-w-none pointer-events-none z-20"
                        />
                      )}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gaming-gold rounded-full flex items-center justify-center border-2 border-gaming-bg shadow-[0_0_15px_rgba(251,191,36,0.6)] z-30 transition-transform group-hover/avatar:scale-110">
                        <span className="text-[10px] font-black text-black leading-none">{m.level || 0}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-gaming-card z-30 ${m.status === 'online' ? 'bg-gaming-gold shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-bold leading-tight truncate max-w-[120px] ${getNicknameColorClass(m.nicknameColor)}`}>{m.name}</span>
                        {m.title && (
                          <span className="bg-gaming-gold/10 text-gaming-gold text-[7.5px] font-black uppercase tracking-[0.11em] px-1.5 py-0.5 rounded border border-gaming-gold/25 uppercase font-sans shrink-0">
                            {m.title}
                          </span>
                        )}
                      </div>
                      {m.customStatus && (
                        <span className="text-[9px] text-white/50 italic font-medium tracking-wide mt-0.5 truncate max-w-[180px]">
                          💬 {m.customStatus}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${getRoleBadgeColor(m.role)}`}>{getRoleLabel(m.role)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[12px] leading-none">{getRoleIcon(m.role)}</span>
                    <span className="text-[8.5px] font-black text-white/30 uppercase font-mono">#{index + 4}</span>
                  </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {visibleLimit < sortedMembers.length && sortedMembers.length > 3 && (
          <div className="flex justify-center p-4 border-t border-white/5 bg-black/10">
            <button
              onClick={handleShowMore}
              disabled={isExpanding}
              className="px-6 py-2.5 rounded-xl border border-gaming-gold/20 bg-gaming-gold/5 hover:bg-gaming-gold/10 text-gaming-gold text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
            >
              {isExpanding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-gaming-gold border-t-transparent rounded-full animate-spin" />
                  Carregando...
                </>
              ) : (
                'Ver Mais'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-2 mt-6`}>
        {[
          { label: 'Convidar Guerreiro', icon: Users, action: handleInvite },
          { label: 'Desconectar da Ordem', icon: LogOut, danger: true, action: logout }
        ].map((action) => (
          <button 
            key={action.label}
            onClick={action.action}
            className={`bg-white/5 border border-white/10 rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-[9px] uppercase font-bold tracking-widest transition-all group ${action.danger ? 'hover:bg-red-500/10 hover:border-red-500/30' : 'hover:bg-white/10 hover:border-white/20'}`}
          >
            <action.icon size={12} className={`${action.danger ? 'text-red-500/50 group-hover:text-red-500' : 'text-gaming-gold/50 group-hover:text-gaming-gold'} transition-colors`} />
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>

      {/* FLOATING MEMBER PROFILE VIEW MODAL */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setSelectedMember(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[340px] rounded-3xl bg-[#111214] text-[#dbdee1] overflow-hidden border border-zinc-800/60 shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dynamic profile banner */}
              <div className="h-28 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${selectedMember.profileBg || 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748'})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-transparent to-black/30" />
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Avatar overlapping banner */}
              <div className="px-5 pb-5 relative flex flex-col">
                <div className="relative -mt-12 mb-3 self-start z-10">
                  <div className="w-20 h-20 rounded-full bg-[#111214] p-1.5 relative flex items-center justify-center transition-all">
                    <SafeAvatar 
                      src={selectedMember.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.userId || selectedMember.id}`}
                      className="w-full h-full rounded-full object-cover relative z-10"
                      isEcoMode={isEcoMode}
                      alt={selectedMember.name}
                    />
                    {AVATAR_DECORATIONS.find(b => b.id === selectedMember.profileBorder) && (
                      <img 
                        src={AVATAR_DECORATIONS.find(b => b.id === selectedMember.profileBorder)?.imgSrc} 
                        alt="decor" 
                        referrerPolicy="no-referrer"
                        className="absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] max-w-none pointer-events-none z-20"
                      />
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gaming-gold rounded-full flex items-center justify-center border-2 border-[#111214] shadow-[0_0_12px_rgba(251,191,36,0.6)] z-30 font-black text-black text-[9px]">
                    {selectedMember.level || 0}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center gap-2">
                    <h1 className={`text-lg font-black tracking-tight ${getNicknameColorClass(selectedMember.nicknameColor)}`}>
                      {selectedMember.name}
                    </h1>
                    {selectedMember.title && (
                      <span className="bg-gaming-gold/10 text-gaming-gold text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-gaming-gold/25 font-sans">
                        {selectedMember.title}
                      </span>
                    )}
                  </div>
                  <span className={`text-[8.5px] uppercase font-black tracking-widest mt-0.5 ${getRoleBadgeColor(selectedMember.role)}`}>
                    {getRoleIcon(selectedMember.role)} {getRoleLabel(selectedMember.role)}
                  </span>
                  {selectedMember.status === 'online' ? (
                    <span className="text-[7.5px] text-gaming-gold font-extrabold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-gaming-gold rounded-full animate-pulse shadow-[0_0_5px_rgba(251,191,36,0.5)]" /> Ativo Agora
                    </span>
                  ) : (
                    <span className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#4e5058] rounded-full" /> Não Conectado
                    </span>
                  )}
                </div>

                {/* Custom status message */}
                {selectedMember.customStatus && (
                  <div className="bg-[#1e1f22] border border-white/5 rounded-xl p-3 mb-4 text-[#dbdee1] flex items-start gap-2">
                    <span className="text-xs">💬</span>
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] font-black uppercase text-[#949ba4] tracking-wider font-sans">STATUS CUSTOMIZADO</span>
                      <p className="text-[9.5px] text-zinc-300 font-bold tracking-wide leading-relaxed mt-0.5">
                        {selectedMember.customStatus}
                      </p>
                    </div>
                  </div>
                )}

                <div className="h-[1px] bg-white/[0.04] w-full mb-4" />

                {/* Statistics panel */}
                <div className="flex flex-col gap-1 text-left mb-6">
                  <span className="text-[7.5px] uppercase font-black text-[#949ba4] tracking-widest font-sans">ESTATÍSTICAS DO GUERREIRO</span>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col gap-0.5">
                      <span className="text-[8px] font-bold text-[#949ba4] uppercase">Poder de Herói</span>
                      <span className="text-xs font-mono font-black text-red-400">{(selectedMember.heroPower || 0).toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col gap-0.5">
                      <span className="text-[8px] font-bold text-[#949ba4] uppercase">Insígnias</span>
                      <span className="text-xs font-mono font-black text-gaming-gold">{(selectedMember.trophies || 0).toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col gap-0.5">
                      <span className="text-[8px] font-bold text-[#949ba4] uppercase">Doações</span>
                      <span className="text-xs font-mono font-black text-blue-400">{(selectedMember.donations || 0).toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col gap-0.5">
                      <span className="text-[8px] font-bold text-[#949ba4] uppercase">Membro Desde</span>
                      <span className="text-[8px] font-black text-zinc-400 capitalize">{selectedMember.joinedAt || '---'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMember(null)}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-display font-black uppercase text-[9px] tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  CONFIRMAR & FECHAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
