import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Trash2, 
  Users, 
  Trophy, 
  AlertTriangle 
} from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';

export function GerenciaView() {
  const { 
    user, 
    members, 
    myMember, 
    deleteMember, 
    banMember, 
    updateMemberRole, 
    theftReports, 
    clearTheftReport, 
    isEcoMode, 
    distributeElixirXP, 
    approveRatoReward, 
    approveElixirReward 
  } = useClan();

  const [activeTab, setActiveTab] = useState<'membros' | 'eventos' | 'ouvidoria'>('membros');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  const isLeader = user?.email === 'ryankevyn3000@gmail.com' || user?.email === 'ryankevyn2025@gmail.com';

  const handleDeleteMember = async (memberId: string, name: string, definitive: boolean = false) => {
    const actionText = definitive ? 'BANIR' : 'EXPULSAR';
    const warningText = definitive 
      ? 'ESTA AÇÃO É DEFINITIVA. O jogador entrará na LISTA NEGRA e nunca mais poderá acessar a aliança com este ID.' 
      : 'Esta ação removerá o perfil do jogador, mas ele poderá tentar entrar novamente.';

    if (confirm(`${actionText} GUERREIRO: Deseja realmente eliminar ${name} da Ordem Suprema?\n\n${warningText}`)) {
      setDeletingId(memberId);
      try {
        if (definitive) {
          await banMember(memberId);
          alert(`O traidor ${name} foi banido definitivamente!`);
        } else {
          await deleteMember(memberId);
          alert(`O combatente ${name} foi expulso.`);
        }
      } catch (err) {
        console.error('Erro ao excluir membro:', err);
        alert('Erro na operação. Verifique suas permissões de Líder.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'leader': return 'Líder Supremo';
      case 'diplomat': return 'Diplomata';
      case 'military_leader': return 'Líder Militar';
      case 'recruiter': return 'Recrutador';
      case 'muse': return 'Musa';
      case 'warrior': return 'Guerreiro';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'diplomat': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'military_leader': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'recruiter': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'muse': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'warrior': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-550/10 border-zinc-500/10';
    }
  };

  if (!isLeader) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6 opacity-45 min-h-[60vh]">
        <ShieldAlert size={64} className="text-red-500 animate-pulse" />
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl font-display font-black uppercase italic text-white tracking-tighter">Acesso Restrito</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 max-w-sm leading-relaxed">
            Área reservada aos líderes e administradores da Ordem Suprema. Entre em contato com a guilda para reivindicar as credenciais do Alto Comando.
          </p>
        </div>
      </div>
    );
  }

  // Filter and search members
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          getRoleLabel(m.role).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto w-full pb-24 text-left font-sans text-white">
      {/* Dashboard Leadership Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-zinc-800 pb-6">
        <div className="flex flex-col gap-1.5 font-sans">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
              <ShieldAlert size={14} />
            </span>
            <span className="text-[10px] uppercase font-bold text-red-400 tracking-widest">
              Sala de Guerra • Controle Militar de Elite
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black uppercase text-white tracking-tight leading-none mt-1">
            ALTO COMANDO <span className="text-gaming-gold">SUPREMO</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed mt-1">
            Gerencie os guerreiros, conceda promoções de patentes diplomáticas e militares, libere as recompensas dos eventos rúnicos e atenda à Ouvidoria de Furtos.
          </p>
        </div>

        {/* Global Stats mini grid */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
          <div className="bg-zinc-950/40 border border-zinc-800 p-3 px-4 rounded-xl flex flex-col items-center text-center min-w-[90px]">
            <span className="text-white font-black text-sm">{members.length} / 30</span>
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-1">Membros</span>
          </div>
          <div className="bg-zinc-950/40 border border-zinc-800 p-3 px-4 rounded-xl flex flex-col items-center text-center min-w-[90px]">
            <span className={`font-black text-sm ${theftReports.length > 0 ? 'text-red-500' : 'text-zinc-400'}`}>
              {theftReports.length}
            </span>
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-1">Furtos</span>
          </div>
          <div className="bg-zinc-950/40 border border-amber-500/20 p-3 px-4 rounded-xl flex flex-col items-center text-center min-w-[90px]">
            <span className="text-gaming-gold font-black text-sm">
              {members.filter(m => m.combatGroup !== undefined).length}
            </span>
            <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-1">Guerra</span>
          </div>
        </div>
      </div>

      {/* Internal Functional Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-850 p-1.5 bg-zinc-950/40 rounded-2xl w-full sm:w-fit gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('membros')}
          className={`px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer outline-none ${
            activeTab === 'membros' 
              ? 'bg-gradient-to-r from-purple-900 to-indigo-950 border-gaming-gold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Users size={14} className={activeTab === 'membros' ? 'text-gaming-gold' : ''} />
          Membros & Hierarquia
        </button>
        <button
          onClick={() => setActiveTab('eventos')}
          className={`px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 relative border cursor-pointer outline-none ${
            activeTab === 'eventos' 
              ? 'bg-gradient-to-r from-purple-900 to-indigo-950 border-gaming-gold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Trophy size={14} className={activeTab === 'eventos' ? 'text-gaming-gold animate-pulse' : ''} />
          Eventos & Conclusões
          {(members.filter(m => m.completedMissions?.includes('caca_rato_pending')).length > 0 ||
            members.filter(m => m.combatGroup && !m.combatGroupClaimed).length > 0) && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-550"></span>
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ouvidoria')}
          className={`px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 relative border cursor-pointer outline-none ${
            activeTab === 'ouvidoria' 
              ? 'bg-gradient-to-r from-purple-900 to-indigo-950 border-gaming-gold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <AlertTriangle size={14} className={activeTab === 'ouvidoria' ? 'text-gaming-gold' : ''} />
          Ouvidoria de Furtos
          {theftReports.length > 0 && (
            <span className="bg-red-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {theftReports.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Render Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB 1: MEMBROS E HIERARQUIA */}
        {activeTab === 'membros' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Filter and Search Panel */}
            <div className="lg:col-span-12 bg-gaming-card/30 border border-gaming-border p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Left Search input */}
              <div className="relative w-full md:max-w-md">
                <input
                  type="text"
                  placeholder="Buscar guerreiro pelo nome ou patente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-gaming-gold/65 text-white rounded-xl p-3 pl-10 text-xs placeholder-zinc-500 outline-hidden transition-all font-mono font-bold"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
              </div>

              {/* Right Filter Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                <span className="text-[10px] font-black uppercase text-zinc-400 font-mono tracking-widest hidden sm:inline">Filtrar Patente:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-black/40 border border-zinc-800 text-white rounded-xl p-2.5 px-4 text-xs outline-hidden cursor-pointer font-bold uppercase"
                >
                  <option value="all">TODOS OS INTEGRANTES</option>
                  <option value="leader">Líder Supremo</option>
                  <option value="diplomat">Diplomata</option>
                  <option value="military_leader">Líder Militar</option>
                  <option value="recruiter">Recrutador</option>
                  <option value="muse">Musa</option>
                  <option value="warrior">Guerreiro</option>
                </select>
              </div>

            </div>

            {/* Members Grid list */}
            <div className="lg:col-span-12 bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 md:p-6">
              <h3 className="font-display font-black text-xs text-white uppercase tracking-widest border-b border-zinc-800 pb-3 mb-5 flex items-center justify-between">
                <span>RELAÇÃO OFICIAL DE INTEGRANTES ({filteredMembers.length})</span>
                <span className="text-[9px] text-zinc-500 font-mono">EDITAR HIERARQUIAS EM TEMPO REAL</span>
              </h3>

              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredMembers.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="bg-zinc-950/20 border border-zinc-900/40 hover:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all group"
                    >
                      {/* Left: Avatar + Details */}
                      <div className="flex items-center gap-4">
                        <SafeAvatar 
                          src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId}`} 
                          className="w-11 h-11 rounded-full border border-zinc-800 object-cover group-hover:border-gaming-gold/20 transition-all shadow-inner animate-none" 
                          alt={m.name}
                          isEcoMode={isEcoMode}
                        />
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white group-hover:text-gaming-gold transition-colors font-mono">{m.name}</span>
                            {m.userId === myMember?.userId && (
                              <span className="text-[8px] bg-amber-500/10 text-amber-500 font-black px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest font-mono">Você</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeColor(m.role)}`}>
                              {getRoleLabel(m.role)}
                            </span>
                            <span className="text-[8.5px] text-zinc-500 font-bold uppercase">
                              Nível {Math.floor((m.xp || 0) / 100) + 1} ({m.xp || 0} XP)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t border-zinc-900 md:border-t-0 pt-3 md:pt-0">
                        {m.role !== 'leader' ? (
                          <>
                            <div className="flex flex-col gap-1 w-full md:w-auto text-left">
                              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 font-mono md:hidden">Patente Militar:</span>
                              <select 
                                value={m.role}
                                onChange={(e) => updateMemberRole(m.id, e.target.value as any)}
                                className="bg-black/50 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-bold uppercase cursor-pointer hover:border-gaming-gold/40 transition-all outline-none"
                              >
                                <option value="diplomat">Diplomata</option>
                                <option value="military_leader">Líder Militar</option>
                                <option value="recruiter">Recrutador</option>
                                <option value="muse">Musa</option>
                                <option value="warrior">Guerreiro</option>
                              </select>
                            </div>

                            <button
                              disabled={deletingId === m.id}
                              onClick={() => handleDeleteMember(m.id, m.name, false)}
                              className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/20 rounded-xl transition-all text-xs font-bold uppercase flex items-center gap-1.5 shrink-0 cursor-pointer"
                              title="Expulsar do Clã"
                            >
                              <Trash2 size={13} />
                              <span className="md:hidden lg:inline">Expulsar</span>
                            </button>
                            <button
                              disabled={deletingId === m.id}
                              onClick={() => handleDeleteMember(m.id, m.name, true)}
                              className="px-2.5 py-2.5 bg-red-950/20 hover:bg-black text-red-400 border border-red-900/40 rounded-xl transition-all text-xs font-mono font-black cursor-pointer"
                              title="Banir de Vez"
                            >
                              Banir
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 bg-zinc-90 w-full md:w-auto text-center px-4 py-2 border border-zinc-800/20 rounded-xl">
                            👑 Liderança Inviolável
                          </span>
                        )}
                      </div>

                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredMembers.length === 0 && (
                  <div className="py-16 text-center flex flex-col items-center gap-3 opacity-25">
                    <span className="text-3xl">🛡️</span>
                    <div className="text-xs uppercase font-black tracking-widest text-white">
                      Nenhum guerreiro corresponde aos filtros especificados.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CONSOLIDAÇÕES & EVENTOS MILITARES */}
        {activeTab === 'eventos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* General Events Status and XP distribution */}
            <div className="lg:col-span-12 bg-gaming-card/30 border border-gaming-border rounded-3xl p-5 md:p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                <Trophy className="text-gaming-gold animate-bounce shrink-0" size={20} />
                <div className="flex flex-col text-left">
                  <h4 className="font-display font-black uppercase text-sm tracking-wider">LUTA PELO ELIXIR (CONSOLIDAÇÃO EM MASSA)</h4>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Distribua 50 XP de forma coletiva aos inscritos</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-1 font-sans">
                <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-805 relative overflow-hidden">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">REGIMENTO ALFA (GRUPO A)</span>
                  <span className="text-2xl font-black text-white">{members.filter(m => m.combatGroup === 'A').length} / 7</span>
                  <div className="text-[8px] text-zinc-500 font-bold uppercase mt-1 text-center">Combatentes Escalados</div>
                </div>
                
                <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-805 relative overflow-hidden">
                  <span className="text-[9px] font-black text-gaming-gold uppercase tracking-widest block mb-1">REGIMENTO BRAVO (GRUPO B)</span>
                  <span className="text-2xl font-black text-white">{members.filter(m => m.combatGroup === 'B').length} / 7</span>
                  <div className="text-[8px] text-zinc-500 font-bold uppercase mt-1 text-center">Combatentes Escalados</div>
                </div>

                <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-805 relative overflow-hidden">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">REGIMENTO COBRA (GRUPO C)</span>
                  <span className="text-2xl font-black text-white">{members.filter(m => m.combatGroup === 'C').length} / 6</span>
                  <div className="text-[8px] text-zinc-500 font-bold uppercase mt-1 text-center">Combatentes Escalados</div>
                </div>
              </div>

              {/* Status information wrapper */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 bg-zinc-950/50 rounded-2xl border border-zinc-900 mt-2 font-mono">
                <div className="flex flex-col gap-1 text-left text-xs text-zinc-300 font-semibold">
                  <div>🔥 GUERREIROS INSCRITOS DIRETAMENTE: <span className="text-white font-extrabold">{members.filter(m => m.combatGroup !== undefined).length} / 20</span></div>
                  <div>⏳ AGUARDANDO LIBERAÇÃO COLETIVA DE RECOMPENSAS: <span className="text-gaming-gold font-extrabold">{members.filter(m => m.combatGroup !== undefined && m.combatGroupClaimed !== true).length} membros</span></div>
                </div>

                <button
                  disabled={settling}
                  onClick={async () => {
                    const outstanding = members.filter(m => m.combatGroup !== undefined && m.combatGroupClaimed !== true).length;
                    if (outstanding === 0) {
                      alert("Nenhum inscrito com recompensa pendente encontrado.");
                      return;
                    }
                    if (confirm(`Confirmar a liberação coletiva do Luta pelo Elixir e creditar 50 XP para os ${outstanding} guerreiros pendentes nas pastas militares?`)) {
                      setSettling(true);
                      try {
                        await distributeElixirXP();
                        alert(`Sucesso! Relatórios aprovados e +50 XP do passe distribuídos para todos os integrantes envolvidos.`);
                      } catch (err) {
                        console.error(err);
                        alert("Falha na gravação remota do comando.");
                      } finally {
                        setSettling(false);
                      }
                    }
                  }}
                  className="bg-gaming-gold hover:bg-white text-black font-display font-black uppercase text-xs tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 shrink-0 uppercase tracking-widest"
                >
                  {settling ? "PROCESSANDO..." : "CONSOLIDAR EVENTO & EXECUTAR PAGAMENTO"}
                </button>
              </div>
            </div>

            {/* Individual actions validations */}
            <div className="lg:col-span-12 bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 md:p-6 text-left">
              <h3 className="font-display font-black text-xs text-white uppercase tracking-widest border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
                <span>APROVAÇÃO MANUAL DE CONQUISTAS INDIVIDUAIS</span>
                <span className="text-[9px] text-red-500 font-mono animate-pulse">LIBERAÇÃO ASSINADA</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Caça ao Rato section */}
                <div className="bg-zinc-950/15 border border-zinc-850 p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider">CAÇA AO RATO • PEDIDOS (+25 XP)</span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto no-scrollbar">
                    {members.filter(m => m.completedMissions?.includes('caca_rato_pending')).length > 0 ? (
                      members.filter(m => m.completedMissions?.includes('caca_rato_pending')).map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 hover:border-zinc-800 text-left">
                          <span className="text-[11px] font-black text-white uppercase font-mono">{m.name}</span>
                          <button
                            onClick={async () => {
                              if (confirm(`Aprovar a insígnia de Caça ao Rato e creditar +25 XP para o perfil militar de ${m.name}?`)) {
                                await approveRatoReward(m.userId);
                                alert(`XP creditado para ${m.name}!`);
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-white text-zinc-950 font-mono text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Conceder
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-zinc-500 uppercase font-bold text-[9px] tracking-widest">
                        Nenhum pedido de Caça ao Rato pendente.
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual Elixir section */}
                <div className="bg-zinc-950/15 border border-zinc-850 p-4 rounded-2xl flex flex-col gap-3 font-mono">
                  <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">LUTA PELO ELIXIR • CRÉDITO INDIVIDUAL (+50 XP)</span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto no-scrollbar">
                    {members.filter(m => m.combatGroup && !m.combatGroupClaimed).length > 0 ? (
                      members.filter(m => m.combatGroup && !m.combatGroupClaimed).map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 hover:border-zinc-800 text-xs">
                          <div className="flex flex-col text-left">
                            <span className="font-black text-white uppercase">{m.name}</span>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">Grupo {m.combatGroup}</span>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm(`Aprovar participação isolada de ${m.name} na Luta pelo Elixir e somar +50 XP ao perfil?`)) {
                                await approveElixirReward(m.userId);
                                alert(`XP de Elixir creditado de forma individual para ${m.name}!`);
                              }
                            }}
                            className="px-3 py-1.5 bg-red-650 hover:bg-white text-white hover:text-black font-mono text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Aprovar
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-zinc-500 uppercase font-bold text-[9px] tracking-widest">
                        Nenhum pedido de Elixir pendente.
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: OUVIDORIA E CONTROLE DE FURTOS */}
        {activeTab === 'ouvidoria' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-12 bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 md:p-6 text-left">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-red-500" size={18} />
                  <h3 className="font-display font-black text-xs text-white uppercase tracking-widest">OUVIDORIA DE DENÚNCIAS FORMALIZADAS ({theftReports.length})</h3>
                </div>
                <span className="text-[9px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md uppercase tracking-widest">CONTRATERRA SEGURO</span>
              </div>

              <div className="flex flex-col gap-4">
                {theftReports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {theftReports.map((report) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-zinc-950/30 border border-zinc-850 hover:border-red-500/20 rounded-2xl p-4.5 flex flex-col gap-3 relative overflow-hidden transition-all group"
                        >
                          {/* Code background stripe */}
                          <div className="absolute top-0 right-0 py-1 px-2.5 text-[7px] font-mono font-bold bg-zinc-800 text-zinc-400 uppercase tracking-widest rounded-bl-lg">
                            SIGILOSO
                          </div>

                          <div className="flex items-center gap-3 border-b border-zinc-900 pb-2.5">
                            <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                              <ShieldAlert size={18} />
                            </div>
                            <div className="text-left">
                              <span className="text-[8px] font-black text-zinc-500 uppercase block tracking-wider font-mono">RELATOR:</span>
                              <span className="text-xs font-black text-white hover:text-gaming-gold transition-colors block uppercase">{report.reporterName || 'Anônimo'}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 text-xs text-zinc-400 text-left font-semibold">
                            <div>
                              <span className="text-zinc-500">INFRATOR:</span>{' '}
                              <span className="text-red-400 font-extrabold font-mono uppercase tracking-wider">{report.accusedName}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500">RECURSO:</span>{' '}
                              <span className="text-zinc-200 uppercase tracking-wide">
                                {report.caravanType === 'caravana_ur' ? 'Caravana Suprema (UR)' : 
                                 report.caravanType === 'caravana_legendary' ? 'Caravana Lendária' : 
                                 report.caravanType === 'caravana_epic' ? 'Caravana Épica' : 'Caixote / Cargas'}
                              </span>
                            </div>
                            <div className="bg-black/30 p-2.5 rounded-xl border border-zinc-900 text-[10.5px] italic text-zinc-300 mt-1 lowercase first-letter:uppercase leading-relaxed select-all">
                              "{report.evidence}"
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-1 pr-1 font-mono">
                            <span className="text-[8px] font-mono font-bold text-zinc-500">
                              {report.timestamp ? new Date(report.timestamp).toLocaleString('pt-BR') : 'Sem data'}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Deseja marcar essa ocorrência como RESOLVIDA e arquivar o relatório?")) {
                                  clearTheftReport(report.id);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-gaming-purple/10 hover:bg-gaming-purple text-purple-300 hover:text-white border border-gaming-purple/20 rounded-lg text-[9px] font-display font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                            >
                              ✓ RESOLVIDO
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-16 text-center bg-zinc-950/10 border border-zinc-850 rounded-2xl border-dashed py-20">
                    <span className="text-4xl mb-3">🕊️</span>
                    <h5 className="text-xs font-display font-black uppercase text-white tracking-widest">Sem Ocorrências no Sistema</h5>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1 max-w-sm leading-relaxed">
                      Todas as caravanas e caixotes seguiram sob trégua e respeito mútuo. Nenhuma denúncia registrada nas bases.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
