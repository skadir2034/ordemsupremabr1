import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Target, 
  Shield, 
  Zap, 
  Sword, 
  AlertTriangle, 
  Gem, 
  CheckCircle2, 
  Trophy, 
  Star, 
  Clock, 
  Compass, 
  Calendar, 
  ShieldCheck, 
  Image as ImageIcon, 
  ArrowLeft,
  Megaphone, 
  Activity, 
  MessageSquareWarning,
  BookOpen,
  ChevronRight,
  TrendingUp,
  XCircle,
  Award
} from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { GuerraSvNotice } from './GuerraSvNotice';

// Dynamic helper to check Event Started state
const hasGuerraEventStarted = (): boolean => {
  try {
    const tzString = 'America/Sao_Paulo';
    const localDateStr = new Date().toLocaleString('en-US', { timeZone: tzString });
    const localDate = new Date(localDateStr);
    
    const year = localDate.getFullYear();
    const month = localDate.getMonth(); // 0-indexed (May is 4)
    const date = localDate.getDate();
    
    if (year > 2026) return true;
    if (year === 2026) {
      if (month > 4) return true; // June or later
      if (month === 4) {
        return date >= 31; // May 31st or later
      }
    }
    return false;
  } catch (err) {
    const now = new Date();
    const isPastYear = now.getUTCFullYear() > 2026;
    const isPastMonth = now.getUTCFullYear() === 2026 && now.getUTCMonth() > 4;
    const isStartedDate = now.getUTCFullYear() === 2026 && now.getUTCMonth() === 4 && now.getUTCDate() >= 31;
    return isPastYear || isPastMonth || isStartedDate;
  }
};

// Returns current Brasilia timezone-based day state (prep, dia1..dia6)
const getBrasiliaDayState = (): string => {
  if (!hasGuerraEventStarted()) {
    return 'prep';
  }
  try {
    const tzString = 'America/Sao_Paulo';
    const localDateStr = new Date().toLocaleString('en-US', { timeZone: tzString });
    const dStr = new Date(localDateStr);
    const dayOfWeek = dStr.getDay(); // 0 Sunday, 1 Monday ... 6 Saturday
    
    switch (dayOfWeek) {
      case 1: return 'dia1';
      case 2: return 'dia2';
      case 3: return 'dia3';
      case 4: return 'dia4';
      case 5: return 'dia5';
      case 6: return 'dia6';
      case 0: return 'prep'; // Sunday
      default: return 'prep';
    }
  } catch (err) {
    const utcDay = new Date().getUTCDay();
    switch (utcDay) {
      case 1: return 'dia1';
      case 2: return 'dia2';
      case 3: return 'dia3';
      case 4: return 'dia4';
      case 5: return 'dia5';
      case 6: return 'dia6';
      case 0: return 'prep';
      default: return 'prep';
    }
  }
};

export function GuiaView() {
  const { isEcoMode, myMember, clan, updateClanGuideImage, updateClanGuerraDia1Image, reportTheft } = useClan();
  
  const [activeTab, setActiveTab] = useState<'geral' | 'cronograma' | 'f2p' | 'avisos'>('cronograma');
  const [selectedDay, setSelectedDay] = useState<number>(2); // Defaults to Day 2 as it's the first strategic event day
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [showTheftReported, setShowTheftReported] = useState(false);
  const lastDateRef = useRef<string>('');

  useEffect(() => {
    // Sync active state day
    const getBrasiliaDateString = (): string => {
      try {
        const tzString = 'America/Sao_Paulo';
        return new Date().toLocaleDateString('en-US', { timeZone: tzString });
      } catch (err) {
        return new Date().getUTCDate().toString();
      }
    };

    lastDateRef.current = getBrasiliaDateString();

    const checkMidnight = () => {
      const currentDateStr = getBrasiliaDateString();
      if (currentDateStr !== lastDateRef.current) {
        lastDateRef.current = currentDateStr;
        const currentDayState = getBrasiliaDayState();
        if (currentDayState.startsWith('dia')) {
          const parsed = parseInt(currentDayState.replace('dia', ''));
          if (!isNaN(parsed) && parsed >= 2 && parsed <= 6) {
            setSelectedDay(parsed);
          }
        }
      }
    };

    const interval = setInterval(checkMidnight, 30000);
    return () => clearInterval(interval);
  }, []);

  // Set default interactive day based on current date if available
  useEffect(() => {
    const currentDayState = getBrasiliaDayState();
    if (currentDayState.startsWith('dia')) {
      const parsed = parseInt(currentDayState.replace('dia', ''));
      if (!isNaN(parsed) && parsed >= 2 && parsed <= 6) {
        setSelectedDay(parsed);
      }
    }
  }, []);

  const isLeader = myMember?.role === 'leader';
  const displayImage = clan?.guideImagePost1 || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLeader) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateClanGuideImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // List of forbidden items outside correct days
  const forbiddenItems = [
    { name: 'Aceleradores', type: 'speedup' },
    { name: 'Fragmentos de herói', type: 'hero' },
    { name: 'Pergaminhos de pesquisa', type: 'research' },
    { name: 'Antitoxina', type: 'toxic' },
    { name: 'Tickets de recrutamento', type: 'ticket' },
    { name: 'Missões Falcão', type: 'falcon' },
    { name: 'Operações Secretas', type: 'ops' },
    { name: 'Baús de equipamento', type: 'equip' },
    { name: 'Aceleradores de cura', type: 'heal' },
    { name: 'Boosts de treinamento', type: 'train' }
  ];

  // Activities priority ranking
  const rankedActivities = [
    { rank: '🥇', name: 'Caravana UR', points: 'Altíssima pontuação' },
    { rank: '🥈', name: 'Operações Secretas UR', points: 'Acesso rápido a metas' },
    { rank: '🥉', name: 'Fragmentos UR', points: '+10.500 pontos cada' },
    { rank: '🏅', name: 'Baús Corvo Nv4', points: 'Conforme nível do baú' },
    { rank: '🏅', name: 'Missões Falcão', points: 'Completar nos dias de bônus' }
  ];

  // Check if a day is the "Brazil Timezone Today"
  const isBrasiliaToday = (dayNum: number): boolean => {
    const todayState = getBrasiliaDayState();
    return todayState === `dia${dayNum}`;
  };

  if (selectedGuide === 'evoluir') {
    return (
      <div className="flex flex-col gap-5 p-4 sm:p-5 md:p-6 max-w-2xl mx-auto w-full pb-16 text-left">
        <button 
          onClick={() => setSelectedGuide(null)}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-mono font-bold uppercase text-[10px] tracking-wider transition-all w-fit min-h-[40px]"
        >
          <ArrowLeft size={14} /> Voltar ao Guia
        </button>

        <div className="bg-gaming-card/30 border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col gap-1 border-b border-zinc-800 pb-3">
            <span className="text-[10px] text-gaming-accent font-bold uppercase tracking-wider font-mono">Dossiê de Desenvolvimento Quick-Start</span>
            <h2 className="text-base sm:text-lg font-display font-black uppercase text-white tracking-tight">
              Como Evoluir <span className="text-gaming-accent">Rápido no Jogo</span>
            </h2>
          </div>

          <div className="flex flex-col gap-4 text-xs text-zinc-300">
            <div className="flex flex-col gap-1.5">
              <h4 className="font-display font-bold uppercase text-[11px] text-gaming-accent flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 
                Fase Básica: Missões Diárias
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                A interação mais importante ao realizar o login diário. Garanta estes itens cruciais para o desenvolvimento acelerado da sua guarnição.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <div className="bg-zinc-900/60 px-3 py-2 rounded-lg border border-zinc-800/80">
                <span className="text-zinc-350 font-bold uppercase text-[10px] block mb-0.5">⚡ Aceleradores</span>
                <p className="text-zinc-500 leading-relaxed text-[11px]">Conclua melhorias urgentes da sua base defensiva rapidamente.</p>
              </div>
              <div className="bg-zinc-900/60 px-3 py-2 rounded-lg border border-zinc-800/80">
                <span className="text-zinc-350 font-bold uppercase text-[10px] block mb-0.5">🐀 Isca de Rato</span>
                <p className="text-zinc-500 leading-relaxed text-[11px]">Item essencial para acumular recompensas para a coligação no evento Caça ao Rato.</p>
              </div>
              <div className="bg-zinc-900/60 px-3 py-2 rounded-lg border border-zinc-800/80">
                <span className="text-zinc-350 font-bold uppercase text-[10px] block mb-0.5">🐦 Essência de Corvo</span>
                <p className="text-zinc-500 leading-relaxed text-[11px]">Recurso necessário para evoluir o nível tático na Cabana de Guarda do Clã.</p>
              </div>
              <div className="bg-zinc-900/60 px-3 py-2 rounded-lg border border-zinc-800/80">
                <span className="text-zinc-350 font-bold uppercase text-[10px] block mb-0.5">💎 Diamantes</span>
                <p className="text-zinc-500 leading-relaxed text-[11px]">Recurso final. Evite gastos impulsivos; acumule de forma estrita para investimentos cruciais.</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-start gap-2.5 mt-1">
              <ShieldCheck className="text-gaming-accent shrink-0 mt-0.5" size={14} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase font-mono tracking-wider">RECOMENDAÇÃO DE LÍDER</span>
                <p className="text-zinc-400 italic text-[11px]">
                  "Não desperdice seus diamantes acelerando construções comuns. O verdadeiro trunfo é usá-los em doações estratégicas do Clã."
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider">Referência Visual</span>
                {isLeader && <span className="text-[9px] text-gaming-accent font-bold uppercase">Toque na foto para atualizar</span>}
              </div>
              <div className="aspect-video sm:h-[180px] rounded-lg border border-zinc-800 overflow-hidden bg-black/40 relative group">
                <img src={displayImage} alt="Guia de Missões" className="w-full h-full object-cover" />
                {isLeader && (
                  <label className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-1.5">
                    <ImageIcon size={18} className="text-gaming-accent" />
                    <span className="text-[10px] font-bold uppercase text-white">Substituir Arquivo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 max-w-4xl mx-auto w-full pb-16 text-left font-sans text-zinc-100">
      
      {/* Title block */}
      <div className="flex flex-col gap-1 border-b border-zinc-805 pb-3">
        <div className="flex items-center gap-1.5 font-mono">
          <BookOpen size={13} className="text-gaming-accent animate-pulse" />
          <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-400">
            Last Asylum: Plague
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-base sm:text-lg font-display font-black tracking-tight uppercase">
            Guia & <span className="text-gaming-accent">Dicas do Evento A x A</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 bg-zinc-900/60 border border-white/5 px-2.5 py-0.5 rounded-md shadow-sm w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gaming-accent animate-pulse" />
            <span className="text-[7.5px] font-bold font-mono uppercase tracking-wider text-zinc-400 animate-pulse">
              Fórmula de Eficiência Ativa • 5 Dias
            </span>
          </div>
        </div>
      </div>

      {/* SVS Notice Box for timing/countdown in header context */}
      <GuerraSvNotice />

      {/* Pinned Objective & Golden Rule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-zinc-900/10 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-zinc-400" />
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider">Objetivo</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold">
            Maximizar pontos do evento gastando o mínimo possível de recursos.
          </p>
        </div>

        <div className="bg-amber-955/5 border border-amber-500/15 rounded-xl p-3 flex flex-col gap-1 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-amber-500 animate-pulse" />
            <span className="text-[9px] font-mono font-bold uppercase text-amber-550 tracking-wider">Regra de Ouro</span>
          </div>
          <p className="text-[11px] text-amber-100 font-bold leading-relaxed italic">
            "Se gera pontos no evento: guarde recursos e use somente no dia correto."
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-white/5 w-full shadow-md">
        <button 
          onClick={() => { setActiveTab('cronograma'); setSelectedGuide(null); }}
          className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer border ${
            activeTab === 'cronograma' 
              ? 'bg-gaming-purple border-gaming-purple text-white shadow' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          📅 Cronograma
        </button>
        <button 
          onClick={() => { setActiveTab('geral'); setSelectedGuide(null); }}
          className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer border ${
            activeTab === 'geral' 
              ? 'bg-gaming-purple border-gaming-purple text-white shadow' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          🛡️ Geral & Prep
        </button>
        <button 
          onClick={() => { setActiveTab('f2p'); setSelectedGuide(null); }}
          className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer border ${
            activeTab === 'f2p' 
              ? 'bg-gaming-purple border-gaming-purple text-white shadow' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          💎 F2P & Ativ.
        </button>
        <button 
          onClick={() => { setActiveTab('avisos'); setSelectedGuide(null); }}
          className={`py-1.5 px-0.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer border ${
            activeTab === 'avisos' 
              ? 'bg-gaming-purple border-gaming-purple text-white shadow' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          📢 Regras
        </button>
      </div>

      {/* Main Tab Render Switcher */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CRONOGRAMA DIÁRIO (DAY BY DAY SELECTOR) */}
          {activeTab === 'cronograma' && (
            <motion.div
              key="tab-cronograma"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">Cronograma de Eventos diários do A x A:</span>
                
                {/* Horizontal day pills */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[2, 3, 4, 5, 6].map((dayNum) => {
                    const isToday = isBrasiliaToday(dayNum);
                    const isSelected = selectedDay === dayNum;
                    
                    return (
                      <button
                        key={dayNum}
                        onClick={() => setSelectedDay(dayNum)}
                        className={`py-2 px-1 rounded-lg border text-[10px] font-extrabold uppercase transition-all duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-gaming-gold border-gaming-gold text-black font-black shadow-md' 
                            : isToday 
                              ? 'bg-gaming-purple/40 border-gaming-gold/60 text-gaming-gold font-bold animate-pulse'
                              : 'bg-gaming-card/40 hover:bg-gaming-card/85 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="text-[8px] opacity-75 font-mono">D{dayNum - 1}</span>
                        <span className="truncate max-w-full">
                          {dayNum === 2 && 'Secretas'}
                          {dayNum === 3 && 'Pesquisa'}
                          {dayNum === 4 && 'Heróis'}
                          {dayNum === 5 && 'Treino'}
                          {dayNum === 6 && 'Guerra'}
                        </span>
                        {isToday && <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-gaming-gold" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Contents Card */}
              <div className="bg-gaming-card/20 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-1 md:h-1.5 bg-gaming-purple w-full" />
                
                {/* Dynamic Header on selected day */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gaming-purple/20 flex items-center justify-center text-gaming-accent shrink-0">
                      {selectedDay === 2 && <Compass size={12} />}
                      {selectedDay === 3 && <TrendingUp size={12} />}
                      {selectedDay === 4 && <Award size={12} />}
                      {selectedDay === 5 && <Sword size={12} />}
                      {selectedDay === 6 && <Skull size={12} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono uppercase font-bold text-gaming-accent tracking-wider leading-none">FASE D{selectedDay - 1} DO ARSENAL</span>
                      <h3 className="text-sm font-black uppercase text-white mt-0.5">
                        {selectedDay === 2 && 'D1 — Operações Secretas'}
                        {selectedDay === 3 && 'D2 — Pesquisa & Equipamentos'}
                        {selectedDay === 4 && 'D3 — Heróis'}
                        {selectedDay === 5 && 'D4 — Treinamento'}
                        {selectedDay === 6 && 'D5 — PvP / Guerra'}
                      </h3>
                    </div>
                  </div>

                  {/* Operational status badge */}
                  <div className="shrink-0">
                    {isBrasiliaToday(selectedDay) ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gaming-gold text-black animate-pulse font-mono">
                        FASE ATIVA HOJE (BR)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">
                        AGUARDANDO CRONOGRAMA
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Specific Detail Panels */}
                {selectedDay === 2 && (
                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-zinc-300">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5 flex items-start gap-2">
                      <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-red-400 uppercase font-mono block">Prioridade Máxima</span>
                        <p className="text-zinc-300 text-[11px] mt-0.5 font-medium">Assegure-se de focar nas Operações Secretas e nos contratos de caravanas de patrulha superiores.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-0.5">
                      <div className="p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Operação Secreta UR</span>
                        <span className="text-[10px] font-mono font-bold text-gaming-accent">+78.750 pts</span>
                      </div>
                      <div className="p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Caravana UR</span>
                        <span className="text-[10px] font-mono font-bold text-gaming-gold">+105.000 pts</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                      <span className="text-[10px] font-bold text-gaming-accent uppercase font-mono tracking-wider block mb-1">Estratégias Cruciais</span>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        • Guarde tentativas UR do dia interior e atualize seus contratos até aparecer status UR. Use diamantes de forma controlada apenas se necessário.<br />
                        • <strong className="text-zinc-200">Construção:</strong> Faça upgrades em construções baratas ou rápidas usando speedups pequenos acumulados.<br />
                        • <strong className="text-zinc-200">Recrutamento:</strong> Use apenas tickets básicos e grátis.
                      </p>
                      <div className="text-[10px] text-red-400 font-bold uppercase mt-1 flex items-center gap-1">
                        ❌ NÃO usar recrutamento premium sob nenhuma circunstância.
                      </div>
                    </div>
                  </div>
                )}

                {selectedDay === 3 && (
                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-zinc-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Missão Falcão</span>
                        <span className="text-zinc-200 font-bold text-[11px] block mt-0.5">+13.500 pontos</span>
                        <p className="text-[10px] text-zinc-450 mt-0.5">Sempre complete integralmente hoje.</p>
                      </div>
                      <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Baús Corvo</span>
                        <span className="text-gaming-gold font-bold text-[11px] block mt-0.5">Maior nível = Maior ganho</span>
                        <p className="text-[10px] text-zinc-450 mt-0.5">Guarde TODOS os Nv3/Nv4 acumulados para abrir hoje.</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg space-y-1.5">
                      <span className="text-[10px] font-bold text-gaming-gold uppercase font-mono tracking-wider block">Pesquisas Científicas</span>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        • Finalize as tecnologias complexas do laboratório que foram estancadas deliberadamente em 95% nos dias anteriores.<br />
                        • Faça o consumo planejado de speedups e pergaminhos de pesquisa.
                      </p>
                    </div>

                    <div className="bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-lg">
                      <span className="text-[10px] font-bold text-white uppercase font-mono block mb-1">✔️ Tecnologias Recomendadas para Evoluir:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px] text-zinc-400 font-bold uppercase font-mono">
                        <span className="bg-zinc-950/60 p-1.5 rounded text-center border border-zinc-900 text-gaming-accent">Ataque de Tropas</span>
                        <span className="bg-zinc-950/60 p-1.5 rounded text-center border border-zinc-900 text-gaming-accent">HP de Tropas</span>
                        <span className="bg-zinc-950/60 p-1.5 rounded text-center border border-zinc-900">Veloc. Construção</span>
                        <span className="bg-zinc-950/60 p-1.5 rounded text-center border border-zinc-900">Veloc. Pesquisa</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDay === 4 && (
                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-zinc-300">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5 flex items-start gap-2">
                      <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-red-500 uppercase font-mono block">EXTREMAMENTE IMPORTANTE</span>
                        <p className="text-zinc-300 text-[11px] mt-0.5 font-bold leading-normal">
                          Nunca, jamais gaste fragmentos UR fora deste dia específico!
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                        <span className="text-[8px] text-zinc-500 uppercase block font-mono">Recrutamento Herói</span>
                        <span className="text-zinc-200 text-xs font-bold font-mono block mt-0.5">+2025 pts</span>
                      </div>
                      <div className="p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                        <span className="text-[8px] text-gaming-accent uppercase block font-mono">Fragmentos UR</span>
                        <span className="text-gaming-accent text-xs font-bold font-mono block mt-0.5">+10.500 pts</span>
                      </div>
                      <div className="p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                        <span className="text-[8px] text-zinc-500 uppercase block font-mono">SSR / SR Frags</span>
                        <span className="text-zinc-300 text-xs font-bold font-mono block mt-0.5">+3675 / +1050</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg space-y-1 shadow-inner">
                      <span className="text-[10px] font-bold text-gaming-accent uppercase font-mono tracking-wider block">Consumos Adicionais</span>
                      <p className="text-[11px] text-zinc-400">
                        • <strong className="text-zinc-200">Insígnias de Habilidade:</strong> Use todas hoje para subir habilidades importantes dos generais principais.<br />
                        • <strong className="text-zinc-200">Limitação de Antitoxina:</strong> Use estritamente 660 unidades de antitoxina para fechar os marcos sem desperdício de soro.
                      </p>
                    </div>
                  </div>
                )}

                {selectedDay === 5 && (
                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-zinc-300">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5">
                      <span className="text-[10px] font-bold text-gaming-accent uppercase font-mono block">Diretiva de Treino de Tropas</span>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                        Neste dia, configure longos treinos de quartel durante a noite e finalize-os com aceleradores táticos apenas durante o dia do evento.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                        <span className="text-[10px] font-bold text-gaming-accent uppercase font-mono block mb-1">✔️ Melhor Estratégia</span>
                        <p className="text-[11px] text-zinc-400 leading-normal">Treinar prioritariamente e de forma estrita as tropas do maior Tier de guarnição que tiver disponível.</p>
                      </div>
                      <div className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono block mb-1">⚖️ Sobras Residuais</span>
                        <p className="text-[11px] text-zinc-400 leading-normal">Use apenas sobras pequenas e recursos descartáveis para construções e pesquisas de preenchimento.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase font-mono text-gaming-gold bg-gaming-purple/10 border border-gaming-purple/20 p-2 rounded-lg">
                      <span>⚡ Missões Falcão do Dia: Sempre completar para maximizar o percentual.</span>
                    </div>
                  </div>
                )}

                {selectedDay === 6 && (
                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-zinc-300">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
                      <span className="text-[10px] font-bold text-red-400 uppercase font-mono block">🔥 PvP — O Combate Final</span>
                      <p className="text-zinc-300 text-[11px] mt-0.5 leading-normal">
                        Este dia recompensa pesadamente as baixas e mortes inimigas na arena. Mas cuidado para não quebrar sua própria guarnição principal!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                        <span className="text-red-400 font-bold block uppercase text-[10px] mb-1">❌ Proibido:</span>
                        <p className="text-[11px] text-zinc-400">Não sacrifique suas tropas fortes ou de tier alto. Evite expô-las de forma irrefletida.</p>
                      </div>
                      <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-lg">
                        <span className="text-gaming-accent font-bold block uppercase text-[10px] mb-1">✅ Recomendado:</span>
                        <p className="text-[11px] text-zinc-400">Use tropas descartáveis de tier baixo para sacrifício mútuo em disputas controladas.</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg">
                      <span className="text-[10px] font-mono font-bold text-gaming-gold uppercase block">Mais Ações Recomendadas:</span>
                      <p className="text-[11px] text-zinc-400 leading-normal mt-1">
                        • <strong className="text-zinc-200">Operações Secretas:</strong> Guarde outra grande leva de tentativas UR para fechar hoje.<br />
                        • <strong className="text-zinc-200">Cura Defensiva:</strong> Use TODOS os speedups aceleradores de cura estocados hoje.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 2: GENERAL RULES & PREPARATION */}
          {activeTab === 'geral' && (
            <motion.div
              key="tab-geral"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3.5"
            >
              {/* Warnings Checklist - Items list */}
              <div className="bg-gaming-card/30 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-1.5 border-b border-zinc-800/60 pb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-[10px] font-mono font-bold uppercase text-red-400">Regras Gerais — NÃO USE fora do dia correto:</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {forbiddenItems.map((item, id) => (
                    <div 
                      key={id}
                      className="bg-zinc-950/50 border border-zinc-900 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400"
                    >
                      <span className="text-red-500 animate-pulse font-mono font-bold text-[9px] shrink-0">✕</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prep steps breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Construction and Research */}
                <div className="bg-gaming-card/20 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-gaming-accent text-[10px] font-mono font-bold uppercase border-b border-zinc-800 pb-1.5 block">
                    🏗️ Preparação de Base & Oficinas
                  </span>
                  
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="border-l-2 border-gaming-purple pl-2.5">
                      <h4 className="text-[10px] font-extrabold uppercase text-white tracking-wide">Construção Estrutural</h4>
                      <p className="text-zinc-400 mt-0.5 text-[11px]">Guarde todos os speedups de obras. Deixe edifícios e guarnições quase prontas sem apertar o botão de concluir.</p>
                    </div>
                    <div className="border-l-2 border-gaming-purple pl-2.5">
                      <h4 className="text-[10px] font-extrabold uppercase text-white tracking-wide">Pesquisa Tecnológica</h4>
                      <p className="text-zinc-400 mt-0.5 text-[11px]">Guarde aceleradores e pergaminhos para o D2. Deixe as pesquisas mais complexas travadas deliberadamente em 95% para ganho rápido.</p>
                    </div>
                  </div>
                </div>

                {/* Heroes, Equipments, PvP */}
                <div className="bg-gaming-card/20 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-gaming-accent text-[10px] font-mono font-bold uppercase border-b border-zinc-800 pb-1.5 block">
                    🛡️ Preparação de Generais & Arsenal
                  </span>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="border-l-2 border-gaming-purple pl-2.5">
                      <h4 className="text-[10px] font-extrabold uppercase text-white tracking-wide">Treinamento de Generais (Heróis)</h4>
                      <p className="text-zinc-400 mt-0.5 text-[11px]">Estoque fragmentos de heróis de categoria UR / SSR / SR, insígnias de habilidade militar e tickets premium para o dia de pontuação máxima (D3).</p>
                    </div>
                    <div className="border-l-2 border-gaming-purple pl-2.5">
                      <h4 className="text-[10px] font-extrabold uppercase text-white tracking-wide">Inventário & PvP</h4>
                      <p className="text-zinc-400 mt-0.5 text-[11px]">Acumule baús Corvo Nv3 e Nv4, missões táticas de Falcão abertas, aceleradores rápidos de cura hospitalar e tropas de tier baixo descartáveis.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Special Guide Mini Card */}
              <div 
                onClick={() => setSelectedGuide('evoluir')}
                className="bg-gaming-card/35 border border-gaming-border/80 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:border-gaming-accent transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-gaming-purple/20 flex items-center justify-center text-gaming-accent">
                    <TrendingUp size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gaming-accent uppercase font-mono leading-none">Dossiê Especial Integrado</span>
                    <h4 className="text-xs font-black uppercase text-white mt-0.5">Como Evoluir Rápido no Jogo ➜</h4>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-500" />
              </div>
            </motion.div>
          )}

          {/* TAB 3: F2P STATEGIES & ACTIVITIES */}
          {activeTab === 'f2p' && (
            <motion.div
              key="tab-f2p"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3.5"
            >
              {/* Never vs Always cards split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* STRICTLY PROHIBITED */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 border-b border-red-500/20 pb-1.5">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />
                    <span className="text-red-400 text-[10px] font-mono font-bold uppercase">❌ NUNCA FAÇA NO EVENTO</span>
                  </div>
                  
                  <div className="space-y-2 text-xs font-medium text-zinc-300">
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">•</span>
                      <p>Gastar seus diamantes em speedups ou acelerações aleatórias sem foco nas metas diárias.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">•</span>
                      <p>Abrir fustigações, baús táticos ou fardos Corvo antes do dia de fase correta.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">•</span>
                      <p>Gastar fragmentos de generais de categoria alta UR cedo para subir estrelas obsoletas.</p>
                    </div>
                  </div>
                </div>

                {/* DELIBERATELY RECOMMENDED */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 border-b border-emerald-500/20 pb-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-[10px] font-mono font-bold uppercase">✅ SEMPRE RECOMENDADO</span>
                  </div>
                  
                  <div className="space-y-2 text-xs font-medium text-zinc-300">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <p>Acumular recursos passivamente durante o pré-evento mantendo disciplina rígida.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <p>Priorizar estritamente os objetivos e caravanas táticas de categoria UR.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <p>Sincronizar seus grandes consumos e picos de aceleração de aliança com o evento de pico do Clã.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Rated list of Activities */}
              <div className="bg-gaming-card/30 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-gaming-accent text-[10px] font-mono font-bold uppercase border-b border-zinc-800 pb-1.5 block">
                  🏆 Ranking de Recompensa: Atividades Mais Importantes
                </span>

                <div className="flex flex-col gap-2">
                  {rankedActivities.map((act, idx) => (
                    <div 
                      key={idx}
                      className="bg-zinc-950/40 border border-zinc-900/60 p-2 rounded-lg flex items-center justify-between hover:border-zinc-800 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs shrink-0">{act.rank}</span>
                        <span className="text-xs font-bold text-white uppercase">{act.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/80">
                        {act.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ALLIANCE LAW & REPORTS BOARD */}
          {activeTab === 'avisos' && (
            <motion.div
              key="tab-avisos"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3.5"
            >
              {/* Alliance rules box */}
              <div className="bg-gaming-card/35 border border-gaming-border rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden text-left shadow-sm">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                  <ShieldCheck className="text-gaming-accent shrink-0" size={15} />
                  <h4 className="font-display font-extrabold text-[11px] uppercase text-white tracking-wide">
                    Código de Aliança: Regramento Oficial SVS
                  </h4>
                </div>
                
                <p className="text-xs text-zinc-350 leading-relaxed font-medium">
                  As regras foram reajustadas para a Grande Final SVS de Alianças: O roubo de caravanas e caixotes do adversário do <span className="text-white font-extrabold uppercase">Servidor 175</span> está integralmente liberado e incentivado para fins táticos e sabotagem.
                  Contudo, continua terminantemente <strong className="text-red-400 uppercase">proibido</strong> saquear ou sabotar caravanas ou caixotes de jogadores do nosso próprio <strong className="text-gaming-accent uppercase">Servidor 176</strong>.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
                  <div className="px-2 py-1.5 bg-zinc-950 border border-zinc-900 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
                    ➜ Servidor Adversário: Roubo Liberado
                  </div>
                  <div className="px-2 py-1.5 bg-zinc-950 border border-red-950/40 rounded text-[9px] font-bold text-red-500 uppercase tracking-wide">
                    ✕ Servidor 176: Proteção Mútua Rígida
                  </div>
                  
                  <button 
                    onClick={async () => {
                      await reportTheft();
                      setShowTheftReported(true);
                      setTimeout(() => setShowTheftReported(false), 4500);
                    }}
                    className="px-3.5 py-1.5 bg-gaming-purple hover:bg-gaming-purple/90 border border-gaming-border text-white active:bg-gaming-purple/70 rounded-md transition-all text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer min-h-[40px] ml-auto"
                  >
                    <MessageSquareWarning size={12} className="text-white" />
                    Denunciar Furto Interno
                  </button>
                </div>

                {/* Alert Toast feedback */}
                <AnimatePresence>
                  {showTheftReported && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-2 right-2 bg-zinc-950 border border-gaming-gold text-gaming-gold rounded-lg px-3 py-2 text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 shadow"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gaming-gold animate-ping" />
                      Denúncia enviada ao QG dos Oficiais para punição!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mural Announcements */}
              <div className="bg-gaming-card/25 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                  <Megaphone size={12} className="text-gaming-accent animate-bounce" /> MURAL DE AVISOS DO CLÃ
                </span>
                
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg flex items-start gap-3">
                    <Activity size={13} className="text-gaming-accent mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase">Plano de Guerra Sv Liberado</h5>
                      <p className="text-zinc-400 text-[11px] mt-0.5 leading-normal">
                        O cronograma tático passo a passo de eventos diários já se encontra totalmente ativo! Use a aba <strong className="text-gaming-accent">"Cronograma"</strong> para ver as datas e programar suas metas de acúmulo de insígnias, frags e speedups.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg flex items-start gap-3">
                    <Activity size={13} className="text-gaming-accent mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase">Recurso de Economia de Energia</h5>
                      <p className="text-zinc-400 text-[11px] mt-0.5 leading-normal">
                        Jogadores móveis com aparelhos menos rápidos podem habilitar o robusto <strong className="text-gaming-accent">Modo Eco</strong> na tela de configurações para ocultar animações pesadas e preservar o uso de bateria.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg flex items-start gap-3 opacity-75">
                    <Activity size={13} className="text-zinc-500 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-zinc-300 uppercase">Monitoramento Geral do Clã</h5>
                      <p className="text-zinc-500 text-[11px] mt-0.5 leading-normal">
                        Nenhuma invasão destrutiva hostil ou saques maciços relatados na guarnição principal do Servidor 176 nas últimas horas. Doações de clã incentivadas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
