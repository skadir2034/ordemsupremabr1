import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Circle, UserPlus, Users, LogOut, Edit2, Trash2, X } from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';

export function MemberList({ isMobile = false }: { isMobile?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState('membros');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const { members, loading, logout, myMember, deleteMember, updateMemberRole, isEcoMode } = useClan();
  
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
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
  }, [members]);

  const [editingMember, setEditingMember] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isLeader = myMember?.role === 'leader';

  const [visibleLimit, setVisibleLimit] = useState(6);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleShowMore = () => {
    if (isEcoMode) {
      setVisibleLimit(sortedMembers.length);
      return;
    }
    setIsExpanding(true);
    const interval = setInterval(() => {
      setVisibleLimit((prev) => {
        if (prev >= sortedMembers.length) {
          clearInterval(interval);
          setIsExpanding(false);
          return sortedMembers.length;
        }
        return prev + 6;
      });
    }, 150);
  };

  const visibleMembers = useMemo(() => {
    return sortedMembers.slice(0, visibleLimit);
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
      case 'recruiter': return 'text-green-500';
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
        case 'border_emerald': return 'border border-emerald-400';
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
      case 'border_emerald': return 'border border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse';
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
        case 'color_emerald': return 'text-[#a7f3d0] font-semibold';
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
      case 'color_emerald': return 'text-[#a7f3d0] font-semibold drop-shadow-[0_0_6px_rgba(167,243,208,0.3)]';
      case 'color_purple': return 'text-[#c0a9df] font-semibold drop-shadow-[0_0_6px_rgba(192,169,223,0.3)]';
      case 'color_rgb': return 'bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_3px_rgba(226,232,240,0.3)]';
      default: return 'text-white';
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className={`flex items-center ${isMobile ? 'gap-4 overflow-x-auto no-scrollbar' : 'gap-8'} mb-6`}>
        <button 
          onClick={() => setActiveSubTab('membros')}
          className={`text-[10px] uppercase font-medium tracking-[0.2em] relative py-1 shrink-0 transition-colors ${activeSubTab === 'membros' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          Ranking Geral
          {activeSubTab === 'membros' && <motion.div layoutId="memberTab" className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gaming-gold shadow-[0_0_8px_rgba(251,191,36,0.5)]" />}
        </button>
      </div>

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
                        <td colSpan={5} className="px-6 py-4 h-16 bg-white/5" />
                      </tr>
                    ))
                  ) : sortedMembers.length === 0 ? (
                    <motion.tr 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={5} className="px-6 py-12 text-center text-white/20 uppercase text-[10px] tracking-widest font-bold">
                        Nenhum membro encontrado
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
                      <div className="w-7 h-7 flex items-center justify-center text-[10px] font-bold text-white/30 border border-white/10 rounded-lg group-hover:border-gaming-gold/50 group-hover:text-gaming-gold transition-all">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group/avatar">
                          {m.avatarUrl && (
                            <SafeAvatar 
                              src={m.avatarUrl} 
                              alt={m.name} 
                              className={`w-8 h-8 rounded-full object-cover shadow-[0_0_10px_rgba(0,0,0,0.5)] ${getBorderClasses(m.profileBorder)}`} 
                              isEcoMode={isEcoMode}
                            />
                          )}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gaming-gold rounded-full flex items-center justify-center border border-black shadow-[0_0_10px_rgba(251,191,36,0.8)] z-10">
                            <span className="text-[7px] font-black text-black leading-none">{m.level || 0}</span>
                          </div>
                          {!isEcoMode && <div className="absolute inset-0 rounded-full bg-gaming-gold/20 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity" />}
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
                        <Circle size={8} className={m.status === 'online' ? 'fill-green-500 text-green-500 animate-pulse' : 'fill-white/10 text-white/10'} />
                        <span className={`text-[10px] font-bold ${m.status === 'online' ? 'text-green-500' : 'text-white/20'}`}>
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
                  <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                      {m.avatarUrl ? (
                            <SafeAvatar 
                              src={m.avatarUrl} 
                              alt={m.name} 
                              className={`w-10 h-10 rounded-full object-cover shadow-[0_0_15px_rgba(0,0,0,0.5)] ${getBorderClasses(m.profileBorder)}`} 
                              isEcoMode={isEcoMode}
                            />
                      ) : (
                        <div className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-white/30 ${getBorderClasses(m.profileBorder)}`}>{m.name.substring(0,2)}</div>
                      )}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gaming-gold rounded-full flex items-center justify-center border-2 border-gaming-bg shadow-[0_0_15px_rgba(251,191,36,0.6)] z-10 transition-transform group-hover/avatar:scale-110">
                        <span className="text-[10px] font-black text-black leading-none">{m.level || 0}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-gaming-card ${m.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-bold leading-tight ${getNicknameColorClass(m.nicknameColor)}`}>{m.name}</span>
                        {m.title && (
                          <span className="bg-gaming-gold/10 text-gaming-gold text-[7.5px] font-black uppercase tracking-[0.11em] px-1.5 py-0.5 rounded border border-gaming-gold/25 uppercase font-sans">
                            {m.title}
                          </span>
                        )}
                      </div>
                      {m.customStatus && (
                        <span className="text-[9px] text-white/50 italic font-medium tracking-wide mt-0.5">
                          💬 {m.customStatus}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${getRoleBadgeColor(m.role)}`}>{getRoleLabel(m.role)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[12px]">{getRoleIcon(m.role)}</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase">#{index + 1}</span>
                  </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {visibleLimit < sortedMembers.length && (
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
          { label: 'Convidar', icon: Users, action: handleInvite },
          { label: 'Sair da Aliança', icon: LogOut, danger: true, action: logout }
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
                <div className="relative -mt-10 mb-3 self-start">
                  <SafeAvatar 
                    src={selectedMember.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.userId}`}
                    className={`w-20 h-20 rounded-full object-cover bg-zinc-900 border-4 border-[#111214] ${getBorderClasses(selectedMember.profileBorder)}`}
                    isEcoMode={isEcoMode}
                    alt={selectedMember.name}
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gaming-gold rounded-full flex items-center justify-center border-2 border-[#111214] shadow-[0_0_12px_rgba(251,191,36,0.6)] z-10 font-black text-black text-[9px]">
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
                    <span className="text-[7.5px] text-green-500 font-extrabold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Ativo Agora
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
