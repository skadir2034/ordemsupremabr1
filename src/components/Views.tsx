import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Target, 
  Shield, 
  Zap, 
  Sword, 
  MapPin, 
  AlertTriangle, 
  Backpack, 
  Gem, 
  CheckCircle2, 
  User, 
  Trophy, 
  Star, 
  Settings, 
  Palette, 
  Trash2,
  Lock,
  Clock,
  Compass,
  Camera,
  ShoppingBag,
  CreditCard,
  Gift,
  ShieldCheck,
  ShieldAlert,
  Plus,
  UserPlus,
  Edit2,
  Users,
  Newspaper,
  BookOpen,
  Anchor,
  Crown,
  ChevronRight,
  MessageSquareWarning,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Bell,
  Megaphone,
  Activity,
  ChevronUp,
  ChevronDown,
  X,
  Flame
} from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';
import { storage } from '../lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const playConnectionSound = (isConnect: boolean) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isConnect ? 440 : 220, ctx.currentTime);
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (err) {}
};

const getBrasiliaDayState = (): string => {
  try {
    const tzString = 'America/Sao_Paulo';
    const localDateStr = new Date().toLocaleString('en-US', { timeZone: tzString });
    const dStr = new Date(localDateStr);
    const dayOfWeek = dStr.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    
    switch (dayOfWeek) {
      case 1: return 'dia1';
      case 2: return 'dia2';
      case 3: return 'dia3';
      case 4: return 'dia4';
      case 5: return 'dia5';
      case 6: return 'dia6';
      case 0: return 'prep'; // Sunday as Prep
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

const getDynamicGuerraTabs = () => {
  let todayDayOfWeek = 4;
  try {
    const tzString = 'America/Sao_Paulo';
    const localDateStr = new Date().toLocaleString('en-US', { timeZone: tzString });
    todayDayOfWeek = new Date(localDateStr).getDay();
  } catch (err) {
    todayDayOfWeek = new Date().getUTCDay();
  }

  const dayNumbers: Record<string, number> = {
    dia1: 1,
    dia2: 2,
    dia3: 3,
    dia4: 4,
    dia5: 5,
    dia6: 6
  };

  const getLabelForTab = (id: string, baseLabel: string) => {
    if (id === 'prep') {
      if (todayDayOfWeek === 0) {
        return '🛡️ Geral & Prep (Hoje)';
      }
      return '🛡️ Geral & Prep';
    }
    if (id === 'f2p') {
      return '💎 Dicas F2P';
    }

    const dayNum = dayNumbers[id];
    if (!dayNum) return baseLabel;

    if (todayDayOfWeek === 0) {
      return `⚡ Dia ${dayNum}`;
    }

    if (dayNum < todayDayOfWeek) {
      return `✅ Dia ${dayNum} (Fin.)`;
    } else if (dayNum === todayDayOfWeek) {
      return `🔥 Dia ${dayNum} (Hoje)`;
    } else {
      let icon = '⚡';
      if (dayNum === 5) icon = '💪';
      if (dayNum === 6) icon = '💀';
      return `${icon} Dia ${dayNum}`;
    }
  };

  return [
    { id: 'prep', label: getLabelForTab('prep', '🛡️ Geral & Prep') },
    { id: 'dia1', label: getLabelForTab('dia1', 'Dia 1') },
    { id: 'dia2', label: getLabelForTab('dia2', 'Dia 2') },
    { id: 'dia3', label: getLabelForTab('dia3', 'Dia 3') },
    { id: 'dia4', label: getLabelForTab('dia4', 'Dia 4') },
    { id: 'dia5', label: getLabelForTab('dia5', 'Dia 5') },
    { id: 'dia6', label: getLabelForTab('dia6', 'Dia 6') },
    { id: 'f2p', label: getLabelForTab('f2p', '💎 Dicas F2P') }
  ];
};

function DayHeader({ dayNum, title }: { dayNum: number; title: string }) {
  let todayDayOfWeek = 4;
  try {
    const tzString = 'America/Sao_Paulo';
    const localDateStr = new Date().toLocaleString('en-US', { timeZone: tzString });
    todayDayOfWeek = new Date(localDateStr).getDay();
  } catch (err) {
    todayDayOfWeek = new Date().getUTCDay();
  }

  if (todayDayOfWeek === 0) {
    return (
      <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Clock size={14} className="text-white/40" />
          <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">AGENDADO — COMEÇA NA SEMANA</span>
        </div>
        <span className="text-[8px] font-bold text-white/30 uppercase">{title}</span>
      </div>
    );
  }

  if (dayNum < todayDayOfWeek) {
    return (
      <div className="bg-[#0b120b] border border-green-500/20 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <CheckCircle2 size={14} className="text-green-500" />
          <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">DIA CONCLUÍDO COM SUCESSO</span>
        </div>
        <span className="text-[8px] font-bold text-white/30 uppercase">HISTÓRICO</span>
      </div>
    );
  } else if (dayNum === todayDayOfWeek) {
    if (dayNum === 6) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-2 flex-wrap">
            <Skull size={14} className="text-red-500 animate-pulse" />
            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">GUERRA TOTAL ATIVA HOJE</span>
          </div>
          <span className="text-[8px] font-bold text-white/30 uppercase">DIA 6 ATIVO</span>
        </div>
      );
    }
    return (
      <div className="bg-gaming-gold/10 border border-gaming-gold/30 p-3 rounded-xl flex items-center justify-between shadow-[0_0_20px_rgba(251,191,36,0.05)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-gaming-gold animate-ping shrink-0" />
          <span className="text-[9px] text-gaming-gold font-black uppercase tracking-widest">OBRIGATÓRIO HOJE — {title}</span>
        </div>
        <span className="text-[8px] font-black text-black bg-gaming-gold px-1.5 py-0.5 rounded uppercase">ATIVO</span>
      </div>
    );
  } else {
    return (
      <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Clock size={14} className="text-white/40" />
          <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">AGENDADO — SÓ ABRA NO DIA</span>
        </div>
        <span className="text-[8px] font-bold text-white/30 uppercase">{title}</span>
      </div>
    );
  }
}

function DayNotice({ dayNum }: { dayNum: number }) {
  let todayDayOfWeek = 4;
  try {
    const tzString = 'America/Sao_Paulo';
    const localDateStr = new Date().toLocaleString('en-US', { timeZone: tzString });
    todayDayOfWeek = new Date(localDateStr).getDay();
  } catch (err) {
    todayDayOfWeek = new Date().getUTCDay();
  }

  if (todayDayOfWeek === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
        <Clock size={18} className="text-white/40 shrink-0" />
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-[10px] text-white/50 font-black uppercase tracking-wider">EVENTO AGENDADO</span>
          <p className="text-[9px] text-white/40 uppercase font-bold leading-tight m-0">ESTE DIA COMEÇARÁ NA PRÓXIMA SEMANA. ACUMULE SEUS RECURSOS.</p>
        </div>
      </div>
    );
  }

  if (dayNum < todayDayOfWeek) {
    return (
      <div className="bg-[#0b120b] border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 shrink-0">
          <CheckCircle2 size={16} />
        </div>
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-[10px] text-green-400 font-black uppercase tracking-wider">Fase Finalizada</span>
          <p className="text-[9px] text-white/50 uppercase font-bold leading-tight m-0">As metas deste dia já foram concluídas no cronograma semanal.</p>
        </div>
      </div>
    );
  } else if (dayNum === todayDayOfWeek) {
    return (
      <div className="bg-gaming-gold/15 border border-gaming-gold/35 p-4 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(197,160,89,0.06)]">
        <div className="w-8 h-8 bg-gaming-gold/20 rounded-full flex items-center justify-center text-gaming-gold shrink-0 animate-pulse">
          <Zap size={16} fill="currentColor" />
        </div>
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-[10px] text-gaming-gold font-black uppercase tracking-wider animate-pulse">Fase Ativa — Fogo Máximo</span>
          <p className="text-[9px] text-white/80 uppercase font-black leading-tight m-0">Todos os recursos guardados para este dia específico devem ser liberados agora para maximizar os pontos do Clã!</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-[#120a0a] border border-red-500/15 p-4 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shrink-0">
          <AlertTriangle size={16} />
        </div>
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-[10px] text-red-500/80 font-black uppercase tracking-wider">🚨 Bloqueado / Guardar Recursos</span>
          <p className="text-[9px] text-white/40 uppercase font-bold leading-tight m-0">NÃO gaste recursos desse dia hoje! Guarde-os estritamente para o dia de ativação correta.</p>
        </div>
      </div>
    );
  }
}

// --- GUIA VIEW ---
export function GuiaView() {
  const { isEcoMode, myMember, clan, updateClanGuideImage, updateClanGuerraDia1Image, reportTheft } = useClan();
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [showTheftReported, setShowTheftReported] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'guias' | 'guerra' | 'avisos'>('guerra');
  const [guerraDay, setGuerraDay] = useState<string>(getBrasiliaDayState());
  const lastDateRef = useRef<string>('');

  useEffect(() => {
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
        const newDay = getBrasiliaDayState();
        setGuerraDay(newDay);
      }
    };

    const interval = setInterval(checkMidnight, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const isLeader = myMember?.role === 'leader';
  const displayImage = clan?.guideImagePost1 || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070';
  const guerraDia1Image = clan?.guideImageGuerraDia1 || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070';

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

  const handleGuerraDia1ImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLeader) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateClanGuerraDia1Image(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  if (selectedGuide === 'evoluir') {
    return (
      <div className="flex flex-col gap-5 p-3 sm:p-5 md:p-8 max-w-4xl mx-auto w-full pb-16">
        <button 
          onClick={() => setSelectedGuide(null)}
          className="flex items-center gap-2 text-gaming-gold font-black uppercase text-[10px] tracking-widest hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft size={14} /> Voltar ao Guia
        </button>

        <div className="bg-gaming-card/40 border border-gaming-border rounded-2xl p-5 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
          {!isEcoMode && (
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap size={80} />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter">
              Como Evoluir <span className="text-gaming-gold">Rápido no Jogo</span>
            </h2>
          </div>

          {/* Post Tabs Selection */}
          <div className="flex gap-2 sm:gap-4 border-b border-white/5 pb-3 overflow-x-auto custom-scrollbar">
             <button className="px-4 py-1.5 bg-gaming-gold text-black rounded-full font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] whitespace-nowrap">Post #1: Missões</button>
             <button className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-full font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] whitespace-nowrap cursor-not-allowed">Post #2: Em Breve</button>
          </div>

          <div className="flex flex-col gap-6 sm:gap-8">
             {/* Post 1 Content */}
             <div className="flex flex-col gap-5 sm:gap-6">
                <div className="flex flex-col gap-2">
                   <h4 className="font-display font-black uppercase text-base sm:text-lg text-gaming-gold italic flex items-center gap-2">
                      <Zap className="w-5 h-5" fill="currentColor" /> 
                      Post 1: Missões Diárias
                   </h4>
                   <p className="text-xs sm:text-sm text-white/80 font-bold uppercase italic leading-relaxed tracking-wide">
                      A interação mais importante ao logar. É através dela que você garante itens cruciais para o seu desenvolvimento acelerado.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                   <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-gaming-gold/20 transition-all">
                      <span className="text-gaming-gold font-black text-[9px] sm:text-[10px] uppercase tracking-widest block mb-1">⚡ Aceleradores de Construção</span>
                      <p className="text-[10px] sm:text-xs text-white/40 uppercase font-bold italic leading-relaxed">Fundamental para garantir que suas melhorias de base sejam concluídas em tempo recorde.</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-gaming-gold/20 transition-all">
                      <span className="text-gaming-gold font-black text-[9px] sm:text-[10px] uppercase tracking-widest block mb-1">🐀 Isca de Rato</span>
                      <p className="text-[10px] sm:text-xs text-white/40 uppercase font-bold italic leading-relaxed">Item vital para o evento "Caça ao Rato". Será melhor explicado no quadro de missões antes da Raid.</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-gaming-gold/20 transition-all">
                      <span className="text-gaming-gold font-black text-[9px] sm:text-[10px] uppercase tracking-widest block mb-1">🐦 Essência de Corvo</span>
                      <p className="text-[10px] sm:text-xs text-white/40 uppercase font-bold italic leading-relaxed">Recurso necessário para realizar o upgrade do Corvo na Cabana do Corvo.</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-gaming-gold/20 transition-all">
                      <span className="text-gaming-gold font-black text-[9px] sm:text-[10px] uppercase tracking-widest block mb-1">💎 Diamantes</span>
                      <p className="text-[10px] sm:text-xs text-white/40 uppercase font-bold italic leading-relaxed">Recurso final necessário para recursos avançados. Não gaste à toa no jogo!</p>
                   </div>
                </div>

                <div className="p-4 sm:p-5 md:p-6 bg-red-500/10 border border-red-500/20 rounded-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 opacity-10">
                      <AlertTriangle size={48} />
                   </div>
                   <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck size={16} className="text-red-500" />
                      <span className="text-[10px] sm:text-[11px] text-red-500 font-black uppercase tracking-[0.3em]">RECOMENDAÇÃO DO LÍDER</span>
                   </div>
                   <p className="text-xs sm:text-sm text-white/60 font-bold uppercase italic leading-relaxed">
                      "Mantenha o foco em acumular diamantes. Eles serão seu maior trunfo para dominar recursos em fases mais avançadas da guerra."
                   </p>
                </div>

                {/* Single Visual Support Image at the bottom */}
                <div className="flex flex-col gap-2 mt-2">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] uppercase font-black text-white/30 tracking-[0.3em]">Referência Visual: Menu de Missões</span>
                      {isLeader && <span className="text-[8px] text-gaming-gold font-black uppercase italic">Toque na imagem para alterar permanentemente</span>}
                   </div>
                   <div className="aspect-video md:h-[300px] rounded-2xl border border-white/10 overflow-hidden bg-black/40 group relative">
                      <img src={displayImage} alt="Guia de Missões" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                      {isLeader && (
                        <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-4">
                           <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                              <ImageIcon size={24} className="text-gaming-gold" />
                           </div>
                           <div className="text-center">
                              <span className="text-xs font-black uppercase tracking-[0.2em] text-white block">Substituir Imagem</span>
                              <span className="text-[8px] font-bold text-white/40 uppercase">Formatos: JPG, PNG, WEBP</span>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 p-3 sm:p-5 md:p-8 max-w-6xl mx-auto w-full pb-16">
      <AnimatePresence>
        {showTheftReported && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-green-500 text-black rounded-full font-black uppercase text-[10px] tracking-widest shadow-[0_0_50px_rgba(34,197,94,0.3)] flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Denúncia Enviada aos Líderes
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col">
           <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-gaming-gold/20 rounded-lg text-gaming-gold border border-gaming-gold/30">
                 <BookOpen size={14} />
              </div>
              <span className="text-[9px] uppercase font-black text-gaming-gold tracking-[0.4em]">Codex da Aliança</span>
           </div>
           <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-black uppercase italic tracking-tighter leading-none">
             Guia & <span className="text-gaming-gold">Dicas Estratégicas</span>
           </h2>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
           <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Manual Atualizado v2.5</span>
        </div>
      </div>

      {/* Guia Tabs Swiper */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit overflow-x-auto max-w-full custom-scrollbar">
        <button 
          onClick={() => setActiveSubTab('guias')}
          className={`px-4 sm:px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'guias' ? 'bg-gaming-gold text-black shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Guias Oficiais
        </button>
        <button 
          onClick={() => setActiveSubTab('guerra')}
          className={`px-4 sm:px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeSubTab === 'guerra' ? 'bg-gaming-gold text-black shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Guerra Sv (5 Dias) 🔥
        </button>
        <button 
          onClick={() => setActiveSubTab('avisos')}
          className={`px-4 sm:px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeSubTab === 'avisos' ? 'bg-gaming-gold text-black shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          Avisos
        </button>
      </div>

      {activeSubTab === 'avisos' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gaming-card/20 border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col gap-5 w-full"
        >
          {/* Header */}
          <div className="flex flex-col gap-1 p-4 bg-gaming-card/40 border border-white/10 rounded-2xl relative overflow-hidden">
            {!isEcoMode && (
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Bell size={100} className="text-gaming-gold" />
              </div>
            )}
            <span className="text-gaming-gold font-black uppercase text-[9px] tracking-[0.2em] flex items-center gap-1.5">
              <Megaphone size={12} /> MURAL DE ANÚNCIOS DO CLÃ
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-black uppercase italic tracking-tighter text-white">
              Avisos & Notificações
            </h3>
            <p className="text-xs text-white/50 font-bold uppercase italic leading-relaxed">
              Fique por dentro das últimas estratégias, atualizações e comunicados oficiais.
            </p>
          </div>

          {/* Announcements List */}
          <div className="flex flex-col gap-4">
            {/* Aviso 1 */}
            <div className="p-4 bg-gaming-gold/5 border border-gaming-gold/20 rounded-xl relative overflow-hidden flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-10 h-10 bg-gaming-gold/10 border border-gaming-gold/20 rounded-xl flex items-center justify-center text-gaming-gold shrink-0">
                <Compass size={20} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-gaming-gold text-black text-[7px] font-black uppercase rounded">NOVO GUIA</span>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Publicado hoje</span>
                </div>
                <h4 className="text-sm font-display font-black uppercase text-white tracking-tight">Guia da Guerra de Servidores Disponível!</h4>
                <p className="text-[11px] sm:text-xs text-white/70 font-bold uppercase italic leading-relaxed">
                  O planejamento tático completo de 5 dias para o evento <span className="text-gaming-gold">Last Asylum: Plague</span> já está operacional! 
                  Selecione a aba <strong className="text-gaming-gold">"Guerra Sv (5 Dias) 🔥"</strong> para conferir as tarefas obrigatórias dia a dia. 
                  Hoje estamos no <strong className="text-gaming-gold">Dia 3 (Pesquisa & Equipamentos)</strong>. Use seus recursos com sabedoria!
                </p>
              </div>
            </div>

            {/* Aviso 2 */}
            <div className="p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl flex flex-col sm:flex-row gap-4 items-start transition-all">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/60 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-white/10 text-white/60 text-[7px] font-black uppercase rounded">SISTEMA</span>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Recentemente</span>
                </div>
                <h4 className="text-sm font-display font-black uppercase text-white tracking-tight">Otimizações e Modo Econômico</h4>
                <p className="text-[11px] sm:text-xs text-white/60 font-bold uppercase italic leading-relaxed">
                  Implementamos o componente de segurança <span className="text-gaming-gold">SafeAvatar</span> em todo o aplicativo. 
                  Se você estiver usando dados móveis ou jogando em locais com bateria baixa, ative o <strong className="text-gaming-gold">Modo Eco</strong> nas Configurações para reduzir efeitos visuais, ocultar avatares pesados e reproduzir GIFs de forma estática.
                </p>
              </div>
            </div>

            {/* Aviso 3 */}
            <div className="p-4 bg-white/[0.02]/5 border border-white/5 hover:border-white/10 rounded-xl flex flex-col sm:flex-row gap-4 items-start transition-all">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/45 shrink-0">
                <Activity size={20} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-white/10 text-white/40 text-[7px] font-black uppercase rounded">GERAL</span>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Silencioso</span>
                </div>
                <h4 className="text-sm font-display font-black uppercase text-white/70 tracking-tight">Status da Mobilização</h4>
                <p className="text-[11px] sm:text-xs text-white/50 font-bold uppercase italic leading-relaxed">
                  Não existem alertas de bombardeamento, mobilização hostil imprevista ou saques em massa no momento. Mantenham as doações diárias ativas para garantir bônus de combate coletivos para todo o clã!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : activeSubTab === 'guerra' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-5 w-full bg-gaming-card/20 border border-white/5 rounded-2xl p-4 sm:p-6"
        >
          {/* Header strategic */}
          <div className="flex flex-col gap-1.5 p-4 bg-gaming-card/40 border border-white/10 rounded-2xl relative overflow-hidden">
            {!isEcoMode && (
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Skull size={100} className="text-gaming-gold" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gaming-gold font-black uppercase text-[9px] tracking-[0.2em] flex items-center gap-1.5">
                <Star size={12} fill="currentColor" /> LAST ASYLUM: PLAGUE
              </span>
              <span className="px-2.5 py-0.5 bg-gaming-gold/10 border border-gaming-gold/20 rounded-full text-[8px] font-black uppercase tracking-widest text-gaming-gold animate-pulse">
                GUIA OFICIAL
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black uppercase italic tracking-tighter text-white">
              Guerra de Servidores <span className="text-gaming-gold">(5 Dias)</span>
            </h3>
            <p className="text-xs text-white/50 font-bold uppercase italic leading-relaxed">
              Maximizar pontos do evento gastando o mínimo possível de recursos.
            </p>
            <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl mt-1">
              <span className="text-[10px] md:text-xs text-red-400 font-extrabold uppercase italic">
                ➡️ Regra de Ouro: Guardar recursos e usar somente no dia correto.
              </span>
            </div>
          </div>

          {/* Days Interactive Pills - Responsive Horizontal Scroller */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Cronologia do Evento (Selecione o Dia abaixo):</span>
            <div className="flex gap-2 pb-2 overflow-x-auto max-w-full custom-scrollbar scrollbar-thin scroll-smooth pr-2">
              {getDynamicGuerraTabs().map((tab) => {
                const isActive = guerraDay === tab.id;
                const isToday = tab.id === getBrasiliaDayState();
                return (
                  <button
                    key={tab.id}
                    onClick={() => setGuerraDay(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 focus:outline-none min-h-[44px] ${
                      isActive 
                        ? 'bg-gaming-gold border-gaming-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.25)] font-black' 
                        : isToday 
                          ? 'bg-gaming-gold/10 hover:bg-gaming-gold/20 border-gaming-gold/30 text-gaming-gold animate-pulse'
                          : 'bg-white/5 hover:bg-white/10 active:bg-white/15 border-white/5 text-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content panel powered by active tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={guerraDay}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="bg-black/20 border border-white/5 p-4 sm:p-5 rounded-2xl"
            >
              {guerraDay === 'prep' && (
                <div className="flex flex-col gap-4">
                  {/* General Rules */}
                  <div className="bg-[#120a0a] border border-red-500/20 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">REGRAS GERAIS: NÃO USE FORA DO DIA</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-white/75 uppercase text-[9px] font-black italic">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Aceleradores
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Fragmentos de Herói
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Pergaminhos
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Antitoxina
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Tickets Recrutamento
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Missões Falcão
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Operações Secretas
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Baús de Equip.
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Aceleradores Cura
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-1.5">
                        <span className="text-red-500 font-bold">❌</span> Boosts Treino
                      </div>
                    </div>
                  </div>

                  {/* Preparation */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Compass size={16} className="text-gaming-gold" />
                      <span className="text-[10px] text-gaming-gold font-black uppercase tracking-[0.2em]">PREPARAÇÃO ANTES DO EVENTO</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="border-l-2 border-gaming-gold pl-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-gaming-gold">Construção</h4>
                        <p className="text-[10px] text-white/60 uppercase font-bold tracking-wide leading-relaxed mt-0.5">• Guarde speedups<br />• Deixe builds quase prontas</p>
                      </div>

                      <div className="border-l-2 border-blue-500 pl-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-400">Pesquisa</h4>
                        <p className="text-[10px] text-white/60 uppercase font-bold tracking-wide leading-relaxed mt-0.5">• Guarde speedups & pergaminhos<br />• Segure tecnologias in 95%</p>
                      </div>

                      <div className="border-l-2 border-purple-500 pl-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-400">Heróis</h4>
                        <p className="text-[10px] text-white/60 uppercase font-bold tracking-wide leading-relaxed mt-0.5">• Fragmentos UR/SSR/SR<br />• Insígnias de habilidade & tickets premium</p>
                      </div>

                      <div className="border-l-2 border-green-500 pl-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-green-400">Equipamentos</h4>
                        <p className="text-[10px] text-white/60 uppercase font-bold tracking-wide leading-relaxed mt-0.5">• Guarde Baús Corvo Nv3/Nv4<br />• Segure Missões Falcão</p>
                      </div>

                      <div className="border-l-2 border-red-500 pl-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-red-400">PvP</h4>
                        <p className="text-[10px] text-white/60 uppercase font-bold tracking-wide leading-relaxed mt-0.5">• Speedups de cura<br />• Tropas fracas para sacrifício</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {guerraDay === 'dia1' && (
                <div className="flex flex-col gap-5">
                  <DayHeader dayNum={1} title="DIA 1" />
                  <DayNotice dayNum={1} />

                  {/* Customizable Visual Reference for Day 1 */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-gaming-gold" />
                        <h4 className="font-display font-black uppercase text-xs text-white italic">Referência Visual: Missões Diárias (Dia 1)</h4>
                      </div>
                      {isLeader ? (
                        <span className="px-2 py-0.5 bg-gaming-gold text-black text-[6px] font-black uppercase rounded animate-pulse">EDITÁVEL PELO LÍDER</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/40 text-[6px] font-black uppercase rounded">FIXO / SÓ LEITURA</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-white/60 font-bold uppercase italic leading-relaxed">
                        Examine a foto personalizada abaixo com as instruções diretas enviadas pela liderança para o Dia 1.
                      </p>
                      
                      <div className="aspect-video md:h-[300px] rounded-xl border border-white/10 overflow-hidden bg-black/40 group relative">
                        <img 
                          src={guerraDia1Image} 
                          alt="Diretriz Visual Dia 1" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                        />
                        {isLeader && (
                          <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-2 p-4">
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                              <ImageIcon size={20} className="text-gaming-gold" />
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white block">Substituir Imagem do Dia 1</span>
                              <span className="text-[8px] font-bold text-white/40 uppercase">Toque para selecionar foto</span>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleGuerraDia1ImageUpload} 
                            />
                          </label>
                        )}
                      </div>
                      
                      {isLeader && (
                        <p className="text-[8px] text-gaming-gold font-bold uppercase italic text-center">
                          * Como líder, as alterações feitas aqui são sincronizadas instantaneamente para todos os membros do clã.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {guerraDay === 'dia2' && (
                <div className="flex flex-col gap-4">
                  <DayHeader dayNum={2} title="DIA 2" />
                  <DayNotice dayNum={2} />

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Skull size={16} className="text-red-500" />
                        <h4 className="font-display font-black uppercase text-xs sm:text-sm text-white italic">DIA 2 — OPERAÇÕES SECRETAS</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[6px] font-black uppercase rounded">FOGO MÁXIMO</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block">Operação Secreta UR</span>
                          <span className="text-[11px] text-gaming-gold font-extrabold uppercase">+78.750 pontos</span>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block">Caravana UR</span>
                          <span className="text-[11px] text-gaming-gold font-extrabold uppercase">+105.000 pontos</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-white/60 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-gaming-gold font-black">📝 Estratégia</span>
                        <span>• Guarde tentativas UR. Atualize até aparecer missão UR.</span>
                        <span>• Use diamantes somente se necessário.</span>
                      </div>

                      <div className="text-[10px] text-white/60 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-blue-400 font-black">🔨 Construção</span>
                        <span>• Use speedups pequenos e upgrades baratos.</span>
                      </div>

                      <div className="text-[10px] text-white/60 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-purple-400 font-black">🎟️ Recrutamento</span>
                        <span>• Apenas use tickets básicos/grátis.</span>
                        <span className="text-red-500 font-black">❌ NÃO usar recrutamento premium.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {guerraDay === 'dia3' && (
                <div className="flex flex-col gap-4">
                  <DayHeader dayNum={3} title="DIA 3" />
                  <DayNotice dayNum={3} />

                  <div className="bg-gaming-card border border-gaming-gold/35 p-4 rounded-xl flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Zap size={16} fill="currentColor" className="text-gaming-gold animate-bounce" />
                        <h4 className="font-display font-black uppercase text-xs sm:text-sm text-white italic">DIA 3 — PESQUISA & EQUIPAMENTOS</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-gaming-gold text-black text-[7px] font-black uppercase rounded">FOGO LIVRE</span>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block">Missão Falcão</span>
                          <span className="text-xs text-gaming-gold font-black uppercase">+13.500 pontos</span>
                          <span className="block text-[8px] text-red-400 uppercase font-bold mt-1">Sempre complete hoje!</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block">Baús Corvo</span>
                          <span className="text-xs text-gaming-gold font-black uppercase">Mais nível = Mais ganho</span>
                          <span className="block text-[8px] text-green-400 uppercase font-bold mt-1">✅ Guarde TODOS os Nv3/Nv4 para hoje!</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-white/80 tracking-wide font-black uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-gaming-gold font-black flex items-center gap-1">🔬 Pesquisa & Speedups</span>
                        <span>• Finalize tecnologias quase prontas imediatamente.</span>
                        <span>• Use de forma agressiva speedups e pergaminhos para estourar a pontuação.</span>
                      </div>

                      <div className="bg-white/[0.02] border border-white/10 p-3 rounded-lg">
                        <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block mb-1.5">🎓 Melhores Tecnologias Para Focar</span>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-wider text-gaming-gold">
                          <div className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> Ataque de Tropas</div>
                          <div className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> HP de Tropas</div>
                          <div className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> Vel. de Construção</div>
                          <div className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> Vel. de Pesquisa</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {guerraDay === 'dia4' && (
                <div className="flex flex-col gap-4">
                  <DayHeader dayNum={4} title="DIA 4" />
                  <DayNotice dayNum={4} />

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Crown size={16} className="text-purple-400" />
                        <h4 className="font-display font-black uppercase text-xs sm:text-sm text-white italic">DIA 4 — HERÓIS</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-red-600/20 text-red-500 text-[6px] font-black uppercase rounded animate-pulse">REQUISITO CRÍTICO</span>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center">
                          <span className="text-[8px] text-white/30 uppercase font-black block">Recrutamento</span>
                          <span className="text-[11px] text-gaming-gold font-extrabold uppercase">+2025 pontos</span>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center">
                          <span className="text-[8px] text-white/30 uppercase font-black block">Fragmentos UR</span>
                          <span className="text-[11px] text-gaming-gold font-extrabold uppercase">+10.500 pontos</span>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center">
                          <span className="text-[8px] text-white/30 uppercase font-black block">SSR / SR</span>
                          <span className="text-[10px] text-gaming-gold font-extrabold uppercase">SSR +3675 | SR +1050</span>
                        </div>
                      </div>

                      <div className="p-3 bg-gaming-gold/15 border border-gaming-gold/45 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                        <span className="text-[8px] text-gaming-gold font-black uppercase block mb-1">🔥 HORA DO FOGO MÁXIMO — USAR HOJE!</span>
                        <p className="text-[10px] text-white/90 font-black uppercase italic leading-relaxed">
                          ⚡ USE 100% DOS FRAGMENTOS UR HOJE! Não guarde mais e nunca use fora deste dia. Libere todo o estoque acumulado agora para estourar os limites de pontuação do clã!
                        </p>
                      </div>

                      <div className="text-[10px] text-white/60 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-purple-400 font-black">⚡ Insígnias de Habilidade</span>
                        <span>• Use todas as insígnias estocadas para evoluir heróis neste dia.</span>
                      </div>

                      <div className="text-[10px] text-white/60 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-green-400 font-black">🧪 Antitoxina</span>
                        <span>• Use estritamente 660 unidades de antitoxina para fechar metas de dia 4.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {guerraDay === 'dia5' && (
                <div className="flex flex-col gap-4">
                  <DayHeader dayNum={5} title="DIA 5" />
                  <DayNotice dayNum={5} />

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Sword size={16} className="text-blue-400" />
                        <h4 className="font-display font-black uppercase text-xs sm:text-sm text-white italic">DIA 5 — TREINAMENTO DE TROPAS</h4>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                        <span className="text-[8px] text-white/40 uppercase font-black block">Missão Falcão</span>
                        <span className="text-xs text-gaming-gold font-extrabold uppercase flex items-center justify-center">Sempre completar</span>
                      </div>

                      <div className="text-[10px] text-white/60 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-blue-400 font-black">🚀 Estratégia Recomendada</span>
                        <span>• Faça treinamentos de tropas longas e pesadas à noite.</span>
                        <span>• Conclua todas as filas ativas usando speedups no dia 5.</span>
                        <span className="text-gaming-gold font-extrabold">✔️ Melhor: Treinar prioritariamente tropas de tier alto.</span>
                      </div>

                      <div className="text-[10px] text-white/60 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-white/5 pt-2">
                        <span className="text-white/40 font-black">🔨 Construção e Pesquisa</span>
                        <span>• Utilize apenas sobras pequenas de recursos para as construções.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {guerraDay === 'dia6' && (
                <div className="flex flex-col gap-4">
                  <DayHeader dayNum={6} title="DIA 6" />
                  <DayNotice dayNum={6} />

                  <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                      <div className="flex items-center gap-2">
                        <Skull size={16} className="text-red-500 animate-pulse" />
                        <h4 className="font-display font-black uppercase text-xs sm:text-sm text-red-500 italic">DIA 6 — PvP / COMBATE DE SERVIDORES</h4>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="p-3 bg-black/60 border border-white/5 rounded-xl">
                        <span className="text-[8px] text-white/40 uppercase font-black block">Operações Secretas UR</span>
                        <span className="text-xs text-gaming-gold font-extrabold uppercase">Guarde uma leva de Operações UR extra para usar hoje!</span>
                      </div>

                      <div className="text-[10px] text-white/80 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-red-500/10 pt-2">
                        <span className="text-red-500 font-extrabold">🔥 Combates de Servidores</span>
                        <span>• O evento de hoje gera recompensas por abates/óbitos (MORTES).</span>
                        <span className="text-red-400 font-black">❌ NÃO SACRIFIQUE TROPAS FORTES DE TIER ALTO.</span>
                        <span>✅ Em vez disso, use tropas fracas descartáveis de tier baixo para sacrifício.</span>
                      </div>

                      <div className="text-[10px] text-white/80 tracking-wide font-bold uppercase italic leading-relaxed flex flex-col gap-1.5 border-t border-red-500/10 pt-2">
                        <span className="text-green-400 font-black">🩹 Saúde Base</span>
                        <span>• Use todos os seus aceleradores de cura estocados sem dó nem piedade.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {guerraDay === 'f2p' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl flex flex-col gap-2">
                      <span className="text-red-400 text-[9px] font-black uppercase tracking-widest block">❌ NUNCA FAÇA ISSO (F2P)</span>
                      <p className="text-[10px] text-white/60 font-black uppercase leading-relaxed italic">• Gastar diamantes aleatoriamente.<br />• Abrir baús fora do dia correto.<br />• Gastar fragmentos de heróis cedo.</p>
                    </div>

                    <div className="bg-green-500/5 border border-green-500/10 p-3.5 rounded-xl flex flex-col gap-2">
                      <span className="text-green-400 text-[9px] font-black uppercase tracking-widest block">✅ SEMPRE FAÇA ISSO (F2P)</span>
                      <p className="text-[10px] text-white/60 font-black uppercase leading-relaxed italic">• Acumular o máximo de recursos.<br />• Priorizar estritamente os objetivos UR.<br />• Sincronizar gastos com o dia correto do evento.</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-3">
                    <span className="text-gaming-gold text-[9px] font-black uppercase tracking-widest block mb-1">⭐ ATIVIDADES DE IMPORTÂNCIA SUPREMA (PONTOS)</span>
                    <div className="flex flex-col gap-2">
                      {[
                        { rank: '🥇', label: 'Caravana UR' },
                        { rank: '🥈', label: 'Operações Secretas UR' },
                        { rank: '🥉', label: 'Fragmentos UR de Heróis' },
                        { rank: '🏅', label: 'Baús de Corvo Nível 4' },
                        { rank: '🏅', label: 'Missões Falcão Diárias' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-black/40 rounded-lg border border-white/5">
                          <span className="text-sm">{item.rank}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-white">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : (
        <>
      {/* Main Feature: Breaking News Portal */}
      <div 
        onClick={() => setSelectedGuide('evoluir')}
        className="relative group overflow-hidden rounded-2xl bg-gaming-card border border-white/10 h-[200px] sm:h-[260px] md:h-[350px] cursor-pointer"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599394022918-6c276a570aba?q=80&w=2070')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-50 grayscale group-hover:grayscale-0" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute top-0 right-0 p-4">
           <div className="px-3 py-1 bg-gaming-gold text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl animate-bounce">
              🔥 TOP DICA
           </div>
        </div>

        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 flex flex-col gap-2 sm:gap-3">
           <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-red-600 text-white text-[7px] font-black uppercase tracking-widest rounded-full">Destaque</span>
              <span className="px-2 py-0.5 bg-white/10 text-white/60 text-[7px] font-black uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-md">Iniciante</span>
           </div>
           <h3 className="text-xl sm:text-2xl md:text-4xl font-display font-black uppercase italic tracking-tighter leading-none max-w-2xl">
              COMO EVOLUIR <span className="text-gaming-gold">RECORDISTA!</span>
           </h3>
           <p className="text-[10px] sm:text-xs md:text-base text-white/80 font-bold uppercase italic max-w-xl leading-relaxed">
              Descubra o ciclo perfeito de missões diárias e o uso inteligente de diamantes para dominar o servidor em tempo recorde.
           </p>
           <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg font-black uppercase text-[9px] tracking-widest group-hover:bg-gaming-gold transition-colors">
                 Abrir Guia <ChevronRight size={12} />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Guide Item 1: Táticas de Batalha */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="relative group overflow-hidden bg-gaming-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-5 md:p-8 flex flex-col gap-6 transition-all cursor-not-allowed shadow-2xl pb-16 md:pb-20"
        >
           <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
           
           <div className="absolute top-4 right-5">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest text-blue-400">Desenvolvimento</span>
              </div>
           </div>
           
           <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-blue-600/30 to-blue-900/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-linear-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sword className="w-6 h-6 md:w-8 md:h-8 relative z-10" />
           </div>
           
           <div className="relative z-10">
              <h4 className="font-display font-black uppercase text-xl md:text-2xl mb-1.5 italic text-white group-hover:text-blue-300 transition-colors tracking-tighter leading-snug">Táticas de <br /><span className="text-blue-500">Batalha ⚔️</span></h4>
              <p className="text-[10px] text-white/40 uppercase font-bold leading-relaxed italic group-hover:text-white/60 transition-colors">
                Estratégias avançadas de mobilização rápida e contra-ataque cirúrgico para suprimir defesas inimigas.
              </p>
           </div>
           
           <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center text-blue-400/30 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] gap-1.5">
                 Protocolos Militares <ChevronRight size={12} />
              </div>
              <div className="w-8 h-8 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/10 group-hover:text-blue-500/40 transition-colors">
                <Zap size={14} />
              </div>
           </div>

           {/* Stylized progress track */}
           <div className="absolute bottom-4 left-5 right-5 flex flex-col gap-1">
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  className="h-full bg-linear-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
           </div>
        </motion.div>

        {/* Guide Item 2: Farm de Diamantes */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="relative group overflow-hidden bg-gaming-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-5 md:p-8 flex flex-col gap-6 transition-all cursor-not-allowed shadow-2xl pb-16 md:pb-20"
        >
           <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-gaming-gold/40 to-transparent" />

           <div className="absolute top-4 right-5">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gaming-gold/10 border border-gaming-gold/20 rounded-full">
                <span className="w-1 h-1 bg-gaming-gold rounded-full animate-pulse" />
                <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest text-gaming-gold">Desenvolvimento</span>
              </div>
           </div>

           <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-gaming-gold/30 to-gaming-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gaming-gold group-hover:scale-110 group-hover:-rotate-6 transition-all border border-gaming-gold/30 shadow-[0_0_40px_rgba(251,191,36,0.15)] relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-linear-to-t from-gaming-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gem className="w-6 h-6 md:w-8 md:h-8 relative z-10" />
           </div>

           <div className="relative z-10">
              <h4 className="font-display font-black uppercase text-xl md:text-2xl mb-1.5 italic text-white group-hover:text-gaming-gold transition-colors tracking-tighter leading-snug">Farm de <br /><span className="text-gaming-gold">Diamantes 💎</span></h4>
              <p className="text-[10px] text-white/40 uppercase font-bold leading-relaxed italic group-hover:text-white/60 transition-colors">
                Metodologias de extração máxima de recursos e otimização de rotas para acumular riqueza lendária.
              </p>
           </div>

           <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center text-gaming-gold/30 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] gap-1.5">
                 Tesouro da Aliança <ChevronRight size={12} />
              </div>
              <div className="w-8 h-8 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/10 group-hover:text-gaming-gold/40 transition-colors">
                <Trophy size={14} />
              </div>
           </div>

           {/* Stylized progress track */}
           <div className="absolute bottom-4 left-5 right-5 flex flex-col gap-1">
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  className="h-full bg-linear-to-r from-gaming-gold to-yellow-200 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                />
              </div>
           </div>
        </motion.div>

        {/* Guide Item 3: Defesa de Base */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="relative group overflow-hidden bg-gaming-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-5 md:p-8 flex flex-col gap-6 transition-all cursor-not-allowed shadow-2xl pb-16 md:pb-20"
        >
           <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-green-500/40 to-transparent" />

           <div className="absolute top-4 right-5">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest text-green-400">Desenvolvimento</span>
              </div>
           </div>

           <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-green-600/30 to-green-900/10 rounded-xl md:rounded-2xl flex items-center justify-center text-green-400 group-hover:scale-110 group-hover:rotate-12 transition-all border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.15)] relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-linear-to-t from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="w-6 h-6 md:w-8 md:h-8 relative z-10" />
           </div>

           <div className="relative z-10">
              <h4 className="font-display font-black uppercase text-xl md:text-2xl mb-1.5 italic text-white group-hover:text-green-300 transition-colors tracking-tighter leading-snug">Defesa <br /><span className="text-green-500">de Base 🛡️</span></h4>
              <p className="text-[10px] text-white/40 uppercase font-bold leading-relaxed italic group-hover:text-white/60 transition-colors">
                Fortificações impenetráveis e sistemas de alerta precoce para neutralizar invasões noturnas.
              </p>
           </div>

           <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center text-green-400/30 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] gap-1.5">
                 Arquitetura Defensiva <ChevronRight size={12} />
              </div>
              <div className="w-8 h-8 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/10 group-hover:text-green-500/40 transition-colors">
                <ShieldAlert size={14} />
              </div>
           </div>

           {/* Stylized progress track */}
           <div className="absolute bottom-4 left-5 right-5 flex flex-col gap-1">
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '30%' }}
                  className="h-full bg-linear-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                />
              </div>
           </div>
        </motion.div>

        {/* Rules & Warnings Section */}
        <div className="lg:col-span-3">
           <div className="bg-linear-to-r from-red-950/20 to-transparent border border-red-500/20 rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center gap-5 md:gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                 <AlertTriangle size={100} />
              </div>
              
              <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                 <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                 <h4 className="font-display font-black uppercase text-lg sm:text-xl md:text-2xl mb-1 text-red-500 italic flex items-center justify-center md:justify-start gap-2">
                    Código de Honra: Caravanas 🚨
                 </h4>
                 <p className="text-xs sm:text-sm text-white/60 font-bold uppercase leading-relaxed italic mb-4">
                    "É terminantemente PROIBIDO roubar caravanas e caixotes de jogadores do nosso próprio servidor. Isso gera retaliação severa e banimento imediato da aliança."
                 </p>
                 <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5 text-[8px] font-black uppercase tracking-widest">
                       <CheckCircle2 size={12} className="text-green-500" /> Respeite Aliados
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5 text-[8px] font-black uppercase tracking-widest text-red-400">
                       <AlertTriangle size={12} /> Multa de 50 Moedas
                    </div>
                    <button 
                      onClick={async () => {
                        await reportTheft();
                        setShowTheftReported(true);
                        setTimeout(() => setShowTheftReported(false), 5000);
                      }}
                      className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-black rounded-lg hover:bg-white transition-all font-black uppercase text-[8px] tracking-widest"
                    >
                       <MessageSquareWarning size={12} /> Denunciar Furto
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

// --- COMBATE VIEW ---
export function CombateView() {
  const { isGuest, myMember, members, updateMemberData, isEcoMode } = useClan();
  const [loading, setLoading] = useState(false);

  // Countdown support for Brasilia Time (GMT-3)
  const calculateTimeLeft = () => {
    // Target: May 22, 2026 at 23:00 Brasília Time (UTC-3) -> 2026-05-23T02:00:00Z
    const targetDate = new Date("2026-05-22T23:00:00-03:00");
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, completed: false };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get active combat group
  const activeGroup = myMember?.combatGroup;

  const handleRegisterGroup = async (group: 'A' | 'B' | 'C') => {
    if (isGuest) {
      alert("Contas de convidado temporárias não podem participar de nenhum evento no modo combate!");
      return;
    }
    if (!myMember) return;
    setLoading(true);
    try {
      await updateMemberData({
        combatGroup: group,
        combatGroupClaimed: myMember.combatGroupClaimed || false
      });
      playConnectionSound(true);
      alert("Operação confirmada sob juramento de sangue! Você receberá 50 XP após a conclusão do evento.");
    } catch (err) {
      console.error(err);
      alert("Falha ao registrar regimento de combate.");
    } finally {
      setLoading(false);
    }
  };

  // Group distributions from members list
  const groupA = members.filter(m => m.combatGroup === 'A');
  const groupB = members.filter(m => m.combatGroup === 'B');
  const groupC = members.filter(m => m.combatGroup === 'C');

  const getGroupMembers = (group: 'A' | 'B' | 'C') => {
    if (group === 'A') return groupA;
    if (group === 'B') return groupB;
    return groupC;
  };

  const currentGroupAllies = activeGroup ? getGroupMembers(activeGroup as 'A' | 'B' | 'C') : [];

  const strategicContent = {
    'A': {
      title: "⚔️ Regimento A - Elite de Assalto",
      focus: "Castelo do Elixir — Zona Vermelha",
      action: "Investida rápida militar. Convergência total na marca exata dos 10 min. Prioridade: conquistar e defender o centro do mapa sob fogo cerrado.",
      bullets: [
        "Lideradores natos de rally: quebrar a muralha inimiga no centro.",
        "Bloquear acessos secundários ao Castelo do Elixir a todo custo.",
        "Formar escudo tático de defesa para dar cobertura aos regimentos de suporte."
      ]
    },
    'B': {
      title: "🛡️ Regimento B - Suporte e Buffs",
      focus: "Relíquia e Altar Amaldiçoado",
      action: "Garantir buffs ofensivos e debuffs debilitantes sobre a aliança inimiga. Reforçar o Castelo sob comando do R5/R4.",
      bullets: [
        "Controlar velozmente o Altar Amaldiçoado no início do cronômetro.",
        "Posicionar tropas de cura e suporte de recuo estratégico na retaguarda.",
        "Efetuar intervenção rápida em pontos de conflito para virar o jogo físico."
      ]
    },
    'C': {
      title: "📦 Regimento C - Logística e Coleta",
      focus: "Oficinas de Alquimia & Kits",
      action: "Coleta ininterrupta de ervas nos Acampamentos e estrangulamento da economia adversária. Caçar e erradicar os Kits inimigos.",
      bullets: [
        "Capturar e segurar imediatamente as Oficinas de Alquimia logo na fase de largada.",
        "Impedir que qualquer invasor rival obtenha Kits Doutores.",
        "Manter rotas logísticas seguras para alimentar os guerreiros na linha de frente."
      ]
    }
  };

  const isGroupA = activeGroup === 'A';
  const isGroupB = activeGroup === 'B';
  const isGroupC = activeGroup === 'C';
  const themeTextClass = isGroupA ? 'text-red-500' : isGroupB ? 'text-gaming-gold' : 'text-blue-400';
  const themeBorderClass = isGroupA ? 'border-red-600/30' : isGroupB ? 'border-gaming-gold/30' : 'border-blue-500/30';
  const themeBgClass = isGroupA ? 'bg-red-950/20' : isGroupB ? 'bg-amber-950/20' : 'bg-blue-950/20';
  const themeAccentBg = isGroupA ? 'bg-red-500' : isGroupB ? 'bg-gaming-gold' : 'bg-blue-400';
  const themeAccentText = isGroupA ? 'text-red-200' : isGroupB ? 'text-amber-200' : 'text-blue-200';

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto w-full pb-20 selection:bg-gaming-gold selection:text-black">
      {/* War Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
            <span className="text-[10px] uppercase font-black text-white/50 tracking-[0.4em] font-mono">OPERAÇÃO DE BRIEFING DA GUILDA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black uppercase italic tracking-tighter text-white">
            CENTRAL DE DEPLOY — <span className="text-gaming-gold text-shadow-gold">LUTA PELO ELIXIR</span>
          </h2>
        </div>
        
        {/* Date Container with Countdown under it */}
        <div className="bg-zinc-900/60 border border-zinc-800 px-5 py-3 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[220px] shadow-lg">
          <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider font-mono">HORA DA INVASÃO (BRT)</span>
          <span className="text-sm font-mono font-black text-white italic">AMANHÃ • 22/05 às 23:00</span>
          
          {/* CRONÔMETRO DE BRASÍLIA */}
          <div className="mt-2 pt-1.5 border-t border-zinc-800/80 w-full flex flex-col items-center">
            <span className="text-[7px] font-black uppercase text-red-500 tracking-wider font-mono animate-pulse flex items-center gap-1 mb-1">
              <Clock size={8} className="text-red-500" /> CONTAGEM REGRESSIVA
            </span>
            {!timeLeft.completed ? (
              <div className="flex items-center gap-1 text-[11px] font-mono font-black">
                <div className="flex flex-col items-center min-w-[34px] bg-red-950/30 border border-red-900/30 px-1 py-0.5 rounded">
                  <span className="text-red-500 font-extrabold leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[5px] text-white/40 mt-0.5 uppercase tracking-tighter leading-none">DIAS</span>
                </div>
                <span className="text-red-500/50 animate-pulse">:</span>
                <div className="flex flex-col items-center min-w-[34px] bg-red-950/30 border border-red-900/30 px-1 py-0.5 rounded">
                  <span className="text-red-500 font-extrabold leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[5px] text-white/40 mt-0.5 uppercase tracking-tighter leading-none">HORAS</span>
                </div>
                <span className="text-red-500/50 animate-pulse">:</span>
                <div className="flex flex-col items-center min-w-[34px] bg-red-950/30 border border-red-900/30 px-1 py-0.5 rounded">
                  <span className="text-red-500 font-extrabold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[5px] text-white/40 mt-0.5 uppercase tracking-tighter leading-none">MIN</span>
                </div>
                <span className="text-red-500/50 animate-pulse">:</span>
                <div className="flex flex-col items-center min-w-[34px] bg-red-950/30 border border-red-900/30 px-1 py-0.5 rounded">
                  <span className="text-red-500 font-extrabold leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[5px] text-white/40 mt-0.5 uppercase tracking-tighter leading-none">SEG</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-black text-red-500 animate-pulse uppercase tracking-widest">EM CONFRONTO CORPO A CORPO!</span>
            )}
          </div>
        </div>
      </div>

      {/* CRITICAL ATTACK WAR ORDER - REMAINS RED (Very Important Alert) */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-5 bg-red-950/40 border-2 border-red-600 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.15)] flex flex-col md:flex-row items-center gap-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-1 bg-red-600 text-[8px] font-black uppercase text-white tracking-widest rounded-bl-xl font-mono animate-pulse">
          ORDEM SUPREMA
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600 flex items-center justify-center shrink-0">
          <Sword className="text-red-500 animate-pulse" size={24} />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <span className="text-[9px] uppercase font-black tracking-widest text-red-500 font-mono">COMUNICADO URGENTE DO DIRETÓRIO DE OUTPOSTS:</span>
          <p className="text-xs text-white leading-relaxed font-bold uppercase italic">
            "Atenção, aliança! Confirmado: nosso ataque conjunto será amanhã, dia 22/05, às 23:00 (horário do jogo). Todos devem estar logados e prontos para a estratégia às 23:00 em ponto. Não se atrasem!"
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* A) OPERATIONAL PROTOCOLS SECTION (Left Column) - REFINED TO GOLD/SLATE */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-zinc-800/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-zinc-800/40 pb-4">
              <Compass className="text-gaming-gold" size={24} />
              <div>
                <h3 className="font-display font-black uppercase text-lg text-white">PLANO DE CONFRONTO E OPERAÇÃO TÁTICA</h3>
                <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest leading-relaxed">
                  CÓDIGO DE ORIENTAÇÃO COORDENADA — GERENCIAMENTO DE TERRITÓRIOS
                </p>
              </div>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-bold uppercase italic">
              "Para garantir a vitória da nossa aliança, precisamos de <strong className="text-gaming-gold font-extrabold text-shadow-gold animate-pulse">disciplina, coordenação e foco nos objetivos corretos</strong>. Não basta ter poder de combate; é preciso saber quando e onde lutar."
            </p>

            <div className="flex flex-col gap-6 mt-2">
              <h4 className="text-[10px] uppercase font-black text-gaming-gold tracking-widest flex items-center gap-2 border-b border-zinc-800/45 pb-2">
                <Flame size={14} className="text-gaming-gold" /> FASES OPERACIONAIS DE DEBELAÇÃO
              </h4>

              <div className="space-y-6">
                {/* Phases using Amber/Gold instead of Red for general items */}
                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center font-display font-black text-sm text-gaming-gold shrink-0 group-hover:border-gaming-gold/50 transition-colors">1</div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">1. Preparação (Antes do Evento)</h5>
                    <p className="text-[10px] text-white/50 uppercase leading-relaxed font-bold">
                      • <strong className="text-amber-400/90">Seleção de Elenco:</strong> O R5/R4 definirá os 20 membros iniciais e os 10 reservas.<br />
                      • <strong className="text-amber-400/90">Logística:</strong> Todos com exército curado e recursos de aceleração prontos para blitz.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center font-display font-black text-sm text-gaming-gold shrink-0 group-hover:border-gaming-gold/50 transition-colors">2</div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">2. Fase Inicial (0 a 10 min) – "Corrida pelo Ouro"</h5>
                    <p className="text-[10px] text-white/55 uppercase leading-relaxed font-bold">
                      • <strong className="text-amber-400/90">Objetivo Primário:</strong> Oficinas de Alquimia.<br />
                      • <strong className="text-amber-400/90">Tática:</strong> Ignorem combates desnecessários fora do perímetro. A prioridade é capturar as duas Oficinas para gerar pontuação passiva imediata.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center font-display font-black text-sm text-gaming-gold shrink-0 group-hover:border-gaming-gold/50 transition-colors">3</div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">3. Fase Intermediária (10 a 13 min) – "Hora da Verdade"</h5>
                    <p className="text-[10px] text-white/55 uppercase leading-relaxed font-bold">
                      • <strong className="text-amber-400/90 font-extrabold">Alvo Central:</strong> Castelo do Elixir + Bases Estratégicas.<br />
                      • <strong className="text-amber-400/90 font-bold">Tática de Domínio:</strong> Aos 10 minutos, o Castelo abre. <em className="text-red-500 font-extrabold not-italic text-shadow-red animate-pulse">Toda a aliança em peso deve convergir para ele.</em><br />
                      • <strong className="text-amber-400/90 font-extrabold">Suporte Crítico:</strong> Ocupem o Altar Amaldiçoado ou a Relíquia para buffs destrutivos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center font-display font-black text-sm text-gaming-gold shrink-0 group-hover:border-gaming-gold/50 transition-colors">4</div>
                  <div className="flex flex-col gap-1">
                    <h5 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">4. Fase Final (13 a 30 min) – "Manutenção da Vitória"</h5>
                    <p className="text-[10px] text-white/55 uppercase leading-relaxed font-bold">
                      • <strong className="text-amber-400/90">Objetivo Secundário:</strong> Acampamentos + Defesa de Muralha.<br />
                      • <strong className="text-amber-400/90">Coleta e Desgaste:</strong> Enviem tropas leves para coletar ervas nos Acampamentos rapidamente.<br />
                      • <strong className="text-red-500 font-black">Manobra de Contenção:</strong> <em className="text-red-500 font-black not-italic uppercase underline">Não permitam sob hipótese alguma que o inimigo colete os Kits Doutores!</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas de Combate using Zinc-Slate background */}
            <div className="bg-zinc-950/25 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-4 shadow-inner">
              <h4 className="text-[10px] uppercase font-black text-gaming-gold tracking-widest flex items-center gap-2 font-mono">
                <Target size={14} className="text-gaming-gold animate-pulse" /> DIRETRIZES DE EMBATE DA GUILDA
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] uppercase font-bold text-white/70">
                <li className="flex gap-2">
                  <span className="text-gaming-gold font-black">🛡️ 1.</span>
                  <span>Ataques Isolados Proibidos: O Ataque coordenado (rally) é a única ferramenta para quebrar tropas R5 adversárias.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gaming-gold font-black">🛡️ 2.</span>
                  <span>Fortificação da Tenda: Ocupar e trancar estrategicamente uma das Tendas de Cura para manter a pressão viva.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gaming-gold font-black">🛡️ 3.</span>
                  <span>Manobras de Teleporte: Utilize o Portal de Migração estrategicamente para encurtar tempos de marcha militar.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gaming-gold font-black">🛡️ 4.</span>
                  <span>Silêncio de Rádio: Obedeça estritamente à cadeia de comando e canais de chat de guerra em tempo real.</span>
                </li>
                <li className="col-span-1 md:col-span-2 flex gap-2 border-t border-zinc-800 pt-2 text-white font-black animate-pulse">
                  <span className="text-red-500">🚩 5.</span>
                  <span>Ataque em Desespero: <span className="text-red-500">Nos 2 minutos cruciais do final, esvazie todos os arsenais ofensivos contra o Castelo!</span></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* B) INTERACTIVE SECTION - THREE COHESIVE TRIPLE-COLORS */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
            {isGuest && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-lg z-20 flex flex-col items-center justify-center p-6 text-center">
                <Skull className="text-red-600 mb-3 animate-pulse" size={40} />
                <h4 className="text-sm font-display font-black uppercase text-red-500 tracking-wider mb-2">CONTA TEMPORÁRIA RESTRITA</h4>
                <p className="text-[10px] uppercase font-bold text-white/70 max-w-xs leading-relaxed mb-4">
                  Contas de convidado não têm autorização regulamentar para participar de eventos de combate da Aliança.
                </p>
                <div className="bg-red-950/40 border border-red-900/30 p-2 py-1 rounded-lg mb-4">
                  <p className="text-[8px] text-red-500 uppercase font-black tracking-widest font-mono">
                    SUA CONTA FECHA EM MENOS DE 24 HORAS
                  </p>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase font-bold max-w-xs leading-relaxed">
                  Cadastre uma conta permanente para desbloquear todos os sistemas de combate tático!
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <ShieldCheck className="text-gaming-gold animate-pulse" size={20} />
              <h3 className="font-display font-black uppercase text-sm tracking-widest text-white">RECRUTAMENTO OPERACIONAL</h3>
            </div>
            
            <p className="text-[10px] uppercase font-bold text-white/70 leading-relaxed">
              Assuma seu posto regulamentar de combate. A escolha de seu regimento estratégico de deploy libera materiais táticos fechados. <span className="text-gaming-gold font-bold italic block mt-1">Ao registrar-se, você receberá 50 XP após a validação pós-evento e confirmação da batalha.</span>
            </p>

            {/* Soldiers Units/Regiments Selection */}
            <div className="flex flex-col gap-4 mt-2">
              
              {/* REGIMENTO A - RED STYLE FOR RAW POWER AND ELITE SPEED */}
              <div className="flex flex-col gap-2">
                <button
                  disabled={loading}
                  onClick={() => handleRegisterGroup('A')}
                  className={`w-full p-4 rounded-xl text-left transition-all border outline-none cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                    activeGroup === 'A'
                      ? 'bg-red-500/10 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                      : 'bg-white/5 border-white/5 hover:border-red-500/40 hover:bg-red-950/20 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <Skull size={16} className={activeGroup === 'A' ? "text-red-500" : "text-white/40 group-hover:text-red-500"} />
                      <span className="text-xs uppercase font-black tracking-wider">Regimento A - Elite de Assalto</span>
                    </div>
                    {activeGroup === 'A' && (
                      <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest font-mono">
                        CONFIRMADO
                      </span>
                    )}
                  </div>
                </button>
                {/* List registered */}
                <div className="px-2">
                  <span className="text-[8px] font-black uppercase text-white/40">GUERREIROS DO REGIMENTO ({groupA.length}):</span>
                  {groupA.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {groupA.map(m => (
                        <span key={m.id} className="text-[9px] bg-red-950/30 border border-red-900/30 px-2 py-0.5 rounded-full text-red-100 uppercase font-bold">
                          ⚔️ {m.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[9px] lowercase font-light text-white/20 block font-mono">vazio</span>
                  )}
                </div>
              </div>

              {/* REGIMENTO B - GOLD STYLE FOR RECON, FAITH AND SHIELD BUFFS */}
              <div className="flex flex-col gap-2">
                <button
                  disabled={loading}
                  onClick={() => handleRegisterGroup('B')}
                  className={`w-full p-4 rounded-xl text-left transition-all border outline-none cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                    activeGroup === 'B'
                      ? 'bg-gaming-gold/15 border-gaming-gold text-white shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                      : 'bg-white/5 border-white/5 hover:border-gaming-gold/40 hover:bg-amber-950/20 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <Shield size={16} className={activeGroup === 'B' ? "text-gaming-gold" : "text-white/40 group-hover:text-gaming-gold"} />
                      <span className="text-xs uppercase font-black tracking-wider">Regimento B - Suporte e Buffs</span>
                    </div>
                    {activeGroup === 'B' && (
                      <span className="text-[8px] bg-gaming-gold text-black px-2 py-0.5 rounded font-black uppercase tracking-widest font-mono">
                        CONFIRMADO
                      </span>
                    )}
                  </div>
                </button>
                {/* List registered */}
                <div className="px-2">
                  <span className="text-[8px] font-black uppercase text-white/40">GUERREIROS DO REGIMENTO ({groupB.length}):</span>
                  {groupB.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {groupB.map(m => (
                        <span key={m.id} className="text-[9px] bg-amber-950/35 border border-amber-900/30 px-2 py-0.5 rounded-full text-gaming-gold uppercase font-bold font-mono">
                          🛡️ {m.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[9px] lowercase font-light text-white/20 block font-mono">vazio</span>
                  )}
                </div>
              </div>

              {/* REGIMENTO C - CYAN/BLUE STYLE FOR HARVEST AND SPEED COOPERATIVE */}
              <div className="flex flex-col gap-2">
                <button
                  disabled={loading}
                  onClick={() => handleRegisterGroup('C')}
                  className={`w-full p-4 rounded-xl text-left transition-all border outline-none cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                    activeGroup === 'C'
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                      : 'bg-white/5 border-white/5 hover:border-blue-500/40 hover:bg-blue-950/20 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <Backpack size={16} className={activeGroup === 'C' ? "text-blue-400" : "text-white/40 group-hover:text-blue-400"} />
                      <span className="text-xs uppercase font-black tracking-wider">Regimento C - Logística e Coleta</span>
                    </div>
                    {activeGroup === 'C' && (
                      <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest font-mono">
                        CONFIRMADO
                      </span>
                    )}
                  </div>
                </button>
                {/* List registered */}
                <div className="px-2">
                  <span className="text-[8px] font-black uppercase text-white/40">GUERREIROS DO REGIMENTO ({groupC.length}):</span>
                  {groupC.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {groupC.map(m => (
                        <span key={m.id} className="text-[9px] bg-blue-950/30 border border-blue-900/30 px-2 py-0.5 rounded-full text-blue-200 uppercase font-black font-mono">
                          📦 {m.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[9px] lowercase font-light text-white/20 block font-mono">vazio</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* CHOPPING INTERNAL CONTENT FOR THE CHOSEN REGIMENT ADAPTS TO ACTIVE THEMATIC COLOR */}
          {activeGroup ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden ${themeBgClass} ${themeBorderClass}`}
            >
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-linear-to-b from-white/5 via-transparent to-transparent" />
              
              <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
                <Target size={18} className={`${themeTextClass} animate-pulse`} />
                <h4 className="font-display font-black uppercase text-xs text-white">REQUISITOS E MATERIAL ESTRATÉGICO</h4>
              </div>

              <div className="flex flex-col gap-3">
                <span className={`text-sm font-display font-black uppercase tracking-tight ${themeTextClass}`}>
                  {strategicContent[activeGroup as 'A' | 'B' | 'C'].title}
                </span>

                <div className="bg-black/55 border border-zinc-800/80 p-4 rounded-2xl flex flex-col gap-3">
                  <div>
                    <span className="text-[8px] font-black tracking-widest uppercase text-white/40 block mb-0.5 font-mono">Setor de Impacto:</span>
                    <span className={`text-xs font-black uppercase tracking-wider ${themeTextClass}`}>{strategicContent[activeGroup as 'A' | 'B' | 'C'].focus}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black tracking-widest uppercase text-white/40 block mb-0.5 font-mono">Objetivo Principal do Regimento:</span>
                    <p className="text-[10px] text-white/90 uppercase font-bold italic leading-relaxed">
                      "{strategicContent[activeGroup as 'A' | 'B' | 'C'].action}"
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-2">
                  <span className="text-[8px] font-black tracking-widest uppercase text-white/45 font-mono font-bold">TAREFAS CRÍTICAS DE CAMPO:</span>
                  <div className="flex flex-col gap-2">
                    {strategicContent[activeGroup as 'A' | 'B' | 'C'].bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${themeAccentBg}`} />
                        <span className="text-[10px] uppercase text-white/70 leading-normal font-bold">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COMPANIONS LIST (SAME REGIMENT) */}
              <div className="border-t border-zinc-800/80 pt-4 mt-2 flex flex-col gap-3">
                <span className="text-[8px] font-black tracking-widest uppercase text-white/45 flex items-center gap-1.5 font-mono">
                  <Users size={12} className={themeTextClass} /> COMBATENTES NO MESMO SETOR ({currentGroupAllies.length})
                </span>
                
                {currentGroupAllies.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                    {currentGroupAllies.map(member => (
                      <div key={member.id} className="flex items-center gap-3 bg-black/40 border border-zinc-800/60 p-2 rounded-xl">
                        <SafeAvatar
                          src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                          className={`w-7 h-7 rounded-full border ${themeBorderClass}`}
                          alt={member.name}
                          isEcoMode={isEcoMode}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white/90">{member.name}</span>
                          <span className={`text-[7px] uppercase font-bold tracking-widest leading-none font-mono ${themeTextClass}`}>Poder de Tropa: {member.heroPower || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] lowercase font-light text-white/20 block font-mono">vazio</span>
                )}
              </div>

            </motion.div>
          ) : (
            <div className="bg-zinc-950/5 border border-zinc-800/60 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <Lock size={28} className="text-zinc-600/30" />
              <span className="text-[9px] uppercase font-bold text-white/35 tracking-widest leading-relaxed">
                STATUS BLOQUEADO: ASSUMA SEU REGIMENTO DIRETAMENTE ACIMA PARA OBTER ACESSO AO SISTEMA DE COORDENADAS.
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// --- MAPA VIEW ---
export function MapaView() {
  const { isEcoMode } = useClan();
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">
        Mapa do <span className="text-gaming-gold">Reino</span>
      </h2>

      <div className={`bg-gaming-card/40 border border-gaming-border rounded-3xl p-1 overflow-hidden relative min-h-[500px]`}>
         {!isEcoMode && (
           <>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000')] bg-cover bg-center opacity-30 grayscale" />
             <div className="absolute inset-0 bg-gaming-bg/20 backdrop-blur-[2px]" />
           </>
         )}
         
         <div className="relative z-10 p-8 h-full flex flex-col">
            <div className={`bg-black/60 border border-white/10 p-6 rounded-2xl max-w-sm self-end ${isEcoMode ? '' : 'backdrop-blur-xl'}`}>
               <div className="flex items-center gap-3 mb-4">
                  <Skull className="text-red-500" />
                  <h4 className="font-display font-black uppercase text-lg">Próxima Raid</h4>
               </div>
               <div className="space-y-4">
                  <div>
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] block mb-1">Localização Exata</span>
                    <div className="flex items-center gap-2 text-white">
                       <MapPin size={16} className="text-gaming-gold" />
                       <span className="text-sm font-bold uppercase">Setor 7 - Zona Industrial</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] block mb-1">Como Chegar</span>
                    <p className="text-[10px] text-white/60 leading-relaxed uppercase font-bold">
                      Siga pela Rodovia Norte até o posto de controle abandonado. Entre nos túneis de manutenção e siga as marcações vermelhas do clã.
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] block mb-1">Estratégia</span>
                    <p className="text-[10px] text-gaming-gold leading-relaxed uppercase font-bold">
                      Necessário heróis com poder superior a 5000. Preparem tanques na linha de frente e snipers nos telhados sul.
                    </p>
                  </div>
               </div>
            </div>

            <div className="mt-auto flex gap-4">
               <div className={`p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 ${isEcoMode ? '' : 'backdrop-blur-md'}`}>
                  <Compass className="text-gaming-gold" />
                  <span className="text-xs font-black uppercase tracking-widest">Coordenadas: 45.2N / 12.8E</span>
               </div>
               <div className={`p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 ${isEcoMode ? '' : 'backdrop-blur-md'}`}>
                  <Clock className="text-gaming-gold" />
                  <span className="text-xs font-black uppercase tracking-widest">Início: 22:00 UTC</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- PERFIL VIEW ---
import { PerfilView } from './PerfilView';
export { PerfilView };

function DeprecatedPerfilView() {
  const { myMember, user, updateMemberData, completeMission, isEcoMode } = useClan();
  const [editingPower, setEditingPower] = useState(false);
  const [newPower, setNewPower] = useState(myMember?.heroPower || 0);

  const [profileSubView, setProfileSubView] = useState<'main' | 'aura_store' | 'discord_custom'>('main');
  const [tempStatus, setTempStatus] = useState(myMember?.customStatus || '');

  React.useEffect(() => {
    if (myMember?.customStatus !== undefined) {
      setTempStatus(myMember.customStatus);
    }
  }, [myMember?.customStatus]);
  const [purchaseStatus, setPurchaseStatus] = useState<{ id: string, message: string, type: 'success' | 'error' } | null>(null);

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploadAcceptType, setUploadAcceptType] = useState('image/*');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeTab, setStoreTab] = useState<'auras' | 'titles' | 'backgrounds' | 'colors'>('auras');

  const borders = [
    { id: 'border_cyan', title: 'Cibernética Blue', desc: 'Aura neon azul do submundo.', price: 50, color: 'border-cyan-400' },
    { id: 'border_purple', title: 'Aura Púrpura', desc: 'Proteção mística violeta.', price: 80, color: 'border-purple-500' },
    { id: 'border_gold', title: 'Fogo Dourado', desc: 'A aura lendária animada.', price: 150, color: 'border-gaming-gold', animated: true },
    { id: 'border_dark', title: 'Vazio Sombrio', desc: 'Glow vermelho do abismo.', price: 100, color: 'border-red-600' },
    { id: 'border_emerald', title: 'Jade Imperial', desc: 'Pulso de jade mística.', price: 120, color: 'border-emerald-400', animated: true },
    { id: 'border_rgb', title: 'Chroma RGB', desc: 'Arco-íris dinâmico supremo.', price: 200, color: 'border-pink-500', animated: true }
  ];

  const titles = [
    { id: 'title_reaper', title: 'Ceifador de Almas', desc: 'Carrasco gélido do inferno.', price: 70, levelRequired: 1 },
    { id: 'title_legend', title: 'Lenda Viva', desc: 'Seu nome cantado pelo tempo.', price: 150, levelRequired: 2 },
    { id: 'title_protector', title: 'Guardião do Clã', desc: 'Escudo indestrutível da ordem.', price: 50, levelRequired: 1 },
    { id: 'title_immortal', title: 'Eterno Imortal', desc: 'Aquele que transcendeu o fim.', price: 200, levelRequired: 3 },
    { id: 'title_supreme', title: 'Mestre Supremo', desc: 'Controle imensurável de energia.', price: 120, levelRequired: 2 },
    { id: 'title_shadow', title: 'Sombra Silenciosa', desc: 'Invisível, sorrateira, fatal.', price: 60, levelRequired: 1 },
    { id: 'title_cyberspy', title: 'Infiltrado Cyber', desc: 'Mestre da informação e do hack.', price: 80, levelRequired: 1 }
  ];

  const backgrounds = [
    { id: 'padrão', title: 'Alcatéia Alfa', desc: 'Fundo clássico rúnico de lobos.', price: 0, url: 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748' },
    { id: 'cibernética', title: 'Hacker Cyber', desc: 'Terminal em neon azul.', price: 40, url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070' },
    { id: 'guerra', title: 'Campo de Batalha', desc: 'Solo devastado de guerra.', price: 60, url: 'https://images.unsplash.com/photo-1599394022918-6c276a570aba?q=80&w=2070' },
    { id: 'moderna', title: 'Neon Moderna', desc: 'Fluido moderno e futurista.', price: 50, url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070' },
    { id: 'cosmos', title: 'Nebula Profunda', desc: 'Cosmos absoluto galáctico.', price: 100, url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070' },
    { id: 'vulcao', title: 'Magma Vulcânico', desc: 'Lava ardente de destruição.', price: 120, url: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?q=80&w=2070' }
  ];

  const nicknameColors = [
    { id: 'color_white', title: 'Branco Padrão', desc: 'Nome clássico de guerreiro.', price: 0, textClass: 'text-white' },
    { id: 'color_gold', title: 'Ouro Nobre', desc: 'Champagne clássico da realeza.', price: 60, textClass: 'text-[#c5a059] font-bold drop-shadow-[0_0_6px_rgba(197,160,89,0.4)]' },
    { id: 'color_red', title: 'Fúria do Alfa', desc: 'Tom carmesim escuro e imponente.', price: 40, textClass: 'text-[#b25d62] font-semibold drop-shadow-[0_0_6px_rgba(178,93,98,0.3)]' },
    { id: 'color_cyan', title: 'Prata da Geada', desc: 'Misty azul-gélido das montanhas.', price: 40, textClass: 'text-[#93c5fd] font-semibold drop-shadow-[0_0_6px_rgba(147,197,253,0.3)]' },
    { id: 'color_pink', title: 'Rosé de Inverno', desc: 'Toque místico de orquídea e névoa.', price: 50, textClass: 'text-[#c084fc] font-semibold drop-shadow-[0_0_6px_rgba(192,132,252,0.3)]' },
    { id: 'color_emerald', title: 'Sálvia do Bosque', desc: 'Verde sutil das florestas antigas.', price: 55, textClass: 'text-[#a7f3d0] font-semibold drop-shadow-[0_0_6px_rgba(167,243,208,0.3)]' },
    { id: 'color_purple', title: 'Névoa Cósmica', desc: 'Aura suave de lavanda do crepúsculo.', price: 45, textClass: 'text-[#c0a9df] font-semibold drop-shadow-[0_0_6px_rgba(192,169,223,0.3)]' },
    { id: 'color_rgb', title: 'Espírito Lunar', desc: 'Degradê suave do luar com prata e safira.', price: 120, textClass: 'text-transparent bg-clip-text bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] font-extrabold drop-shadow-[0_0_4px_rgba(226,232,240,0.3)]' }
  ];

  const handleBuyBorder = (border: any) => {
    if ((myMember?.coins || 0) < border.price) {
      setPurchaseStatus({ id: border.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }

    updateMemberData({
      coins: (myMember?.coins || 0) - border.price,
      profileBorder: border.id
    });
    setPurchaseStatus({ id: border.id, message: "Equipado com Sucesso!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleBuyTitle = (selectedTitleItem: any) => {
    const userRoleLevel = myMember?.level || 0;
    if (userRoleLevel < selectedTitleItem.levelRequired) {
      setPurchaseStatus({ id: selectedTitleItem.id, message: `Requer Nv. ${selectedTitleItem.levelRequired}!`, type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2500);
      return;
    }

    const alreadyUnlocked = myMember?.unlockedTitles || [];
    const isAlreadyUnlocked = alreadyUnlocked.includes(selectedTitleItem.title);
    const cost = isAlreadyUnlocked ? 0 : selectedTitleItem.price;

    if (!isAlreadyUnlocked && (myMember?.coins || 0) < cost) {
      setPurchaseStatus({ id: selectedTitleItem.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }

    const updatedUnlocked = isAlreadyUnlocked 
      ? alreadyUnlocked 
      : [...alreadyUnlocked, selectedTitleItem.title];

    updateMemberData({
      coins: (myMember?.coins || 0) - cost,
      title: selectedTitleItem.title,
      unlockedTitles: updatedUnlocked
    });

    setPurchaseStatus({ id: selectedTitleItem.id, message: isAlreadyUnlocked ? "Equipado!" : "Comprado & Equipado!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleBuyBackground = (bgItem: any) => {
    const currentBg = myMember?.profileBg || 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748';
    const isAlreadyUnlocked = currentBg === bgItem.url || bgItem.price === 0;
    const cost = isAlreadyUnlocked ? 0 : bgItem.price;

    if (!isAlreadyUnlocked && (myMember?.coins || 0) < cost) {
      setPurchaseStatus({ id: bgItem.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }

    updateMemberData({
      coins: (myMember?.coins || 0) - cost,
      profileBg: bgItem.url
    });

    setPurchaseStatus({ id: bgItem.id, message: "Fundo Aplicado!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleBuyColor = (colorItem: any) => {
    const alreadyUnlocked = myMember?.unlockedColors || [];
    const isAlreadyUnlocked = alreadyUnlocked.includes(colorItem.id) || colorItem.price === 0;
    const cost = isAlreadyUnlocked ? 0 : colorItem.price;

    if (!isAlreadyUnlocked && (myMember?.coins || 0) < cost) {
      setPurchaseStatus({ id: colorItem.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }

    const updatedUnlocked = isAlreadyUnlocked
      ? alreadyUnlocked
      : [...alreadyUnlocked, colorItem.id];

    updateMemberData({
      coins: (myMember?.coins || 0) - cost,
      nicknameColor: colorItem.id,
      unlockedColors: updatedUnlocked
    });

    setPurchaseStatus({ id: colorItem.id, message: isAlreadyUnlocked ? "Equipado!" : "Comprado & Equipado!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const getBorderClasses = (borderId?: string) => {
    if (isEcoMode) {
      switch (borderId) {
        case 'border_cyan': return 'border-2 border-cyan-400';
        case 'border_purple': return 'border-2 border-purple-500';
        case 'border_gold': return 'border-2 border-gaming-gold';
        case 'border_dark': return 'border-2 border-red-600';
        case 'border_emerald': return 'border-2 border-emerald-400';
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
      case 'border_emerald': return 'border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse';
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
        case 'color_emerald': return 'text-[#a7f3d0] font-semibold';
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
      case 'color_emerald': return 'text-[#a7f3d0] font-semibold drop-shadow-[0_0_8px_rgba(167,243,208,0.3)]';
      case 'color_purple': return 'text-[#c0a9df] font-semibold drop-shadow-[0_0_8px_rgba(192,169,223,0.3)]';
      case 'color_rgb': return 'bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_4px_rgba(226,232,240,0.3)]';
      default: return 'text-white';
    }
  };
  
  const compressImage = (base64: string, maxWidth = 300, maxHeight = 300): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); 
      };
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("O arquivo é muito grande (Máximo de 10MB).");
      return;
    }

    try {
      let fileToUpload: Blob | File = file;
      let mimeType = file.type || 'image/jpeg';

      if (file.type === 'image/gif') {
        // É um GIF
        mimeType = 'image/gif';
      } else {
        // É uma foto estática comum, vamos comprimi-la drasticamente no cliente para economizar rede e bateria
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Comprime redimensionando para máximo de 200x200 com 70% de qualidade
        const compressedDataUrl = await compressImage(dataUrl, 200, 200);
        
        // Converte o dataURL de volta para um Blob para upload ultra-rápido no Firebase Storage
        const arr = compressedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileToUpload = new Blob([u8arr], { type: mime });
        mimeType = mime;
      }

      const fileRef = storageRef(storage, `avatars/${user?.uid || 'unknown'}/${Date.now()}_${file.name}`);
      
      // Configurar metadados do tipo de arquivo para garantir que os navegadores carreguem e reproduzam como imagem e GIF corretos
      const metadata = { contentType: mimeType };
      const snapshot = await uploadBytes(fileRef, fileToUpload, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      await updateMemberData({ avatarUrl: downloadUrl });
      setAvatarModalOpen(false);
    } catch (err: any) {
      console.error('Failed to upload/update avatar to Firebase Storage in Views:', err);
      const errorMessage = err?.message || String(err);
      const errorCode = err?.code || 'desconhecido';
      alert(`Erro de upload: ${errorMessage} (Código: ${errorCode}). Verifique a conexão com a internet ou as permissões do Firebase Storage.`);
    }
  };

  const handlePowerUpdate = () => {
    updateMemberData({ heroPower: Number(newPower) });
    completeMission('edit_hero_power', 50);
    setEditingPower(false);
  };

  const stats = [
    { label: 'Conquistas', val: myMember?.trophies || 0, icon: Trophy, color: 'text-gaming-gold' },
    { label: 'Doações', val: myMember?.donations || 0, icon: Zap, color: 'text-blue-400' },
    { 
      label: 'Poder de Herói', 
      val: myMember?.heroPower || 0, 
      icon: Sword, 
      color: 'text-red-500',
      editable: true 
    },
    { label: 'Diamantes', val: myMember?.diamonds || 0, icon: Gem, color: 'text-gaming-gold' }
  ];

  if (profileSubView === 'discord_custom') {
    const customBorders = [
      { id: 'border_laser', title: 'Laser Arco-íris', desc: 'Pulso de laser dinâmico.', colorClass: 'border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-pulse' },
      { id: 'border_cyber', title: 'Glow Cyberpunk', desc: 'Feixe de néon ciano e magenta.', colorClass: 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-pulse' },
      { id: 'border_cosmic', title: 'Vórtice Cósmico', desc: 'Círculo celestial violeta profundo.', colorClass: 'border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.7)] animate-pulse' },
      { id: 'border_fire', title: 'Magma Sombrio', desc: 'Chamas ardentes sobre fundo rubi.', colorClass: 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse' },
      { id: 'border_gold', title: 'Fogo Dourado', desc: 'Aura nobre lendária dourada.', colorClass: 'border-gaming-gold shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse' },
      { id: 'border_rgb', title: 'Chroma Spectrum', desc: 'Pulso de neon espectral.', colorClass: 'border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.7)] animate-bounce' }
    ];

    const customBanners = [
      { id: 'none', title: 'Sem Efeito', desc: 'Apenas a arte do fundo do clã.' },
      { id: 'effect_fire', title: 'Chamas de Sangue', desc: 'Partículas vulcânicas dançantes.' },
      { id: 'effect_neon', title: 'Estrela Cyberpunk', desc: 'Cascatas de feixes neon verticais.' },
      { id: 'effect_matrix', title: 'Catarata Digital', desc: 'Feixe numérico binário hacker.' },
      { id: 'effect_cosmic', title: 'Névoa da Galáxia', desc: 'Nebulosa cósmica de lavanda.' }
    ];

    const statusTemplates = [
      "🎮 Jogando: Elden Ring",
      "🛡️ Em chamada tática da aliança",
      "⛏️ Farmando recursos na base principal",
      "⚡ Modo Tryhard Ativado!",
      "☕ Recarregando baterias...",
      "💤 AFK (Ausente no momento)"
    ];

    const handleSaveStatus = (evt: React.FormEvent) => {
      evt.preventDefault();
      updateMemberData({ customStatus: tempStatus });
      setPurchaseStatus({ id: 'status_save', message: 'Status Atualizado!', type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2000);
    };

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full pb-20 font-sans"
      >
        <button 
          onClick={() => setProfileSubView('main')}
          className="flex items-center gap-2 text-gaming-gold font-black uppercase text-[10px] tracking-widest hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft size={16} /> Voltar ao Perfil
        </button>

        <div className="bg-gaming-card border border-gaming-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-gaming-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/[0.02]">
            <div>
              <h3 className="text-2xl font-display font-black uppercase italic text-white leading-none">Personalização Discord</h3>
              <p className="text-[10px] text-gaming-gold font-bold uppercase tracking-[0.3em] mt-2">Dê ao seu perfil uma identidade gamer inigualável</p>
            </div>
            <span className="text-[9px] font-mono px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/35 rounded-xl uppercase tracking-widest text-indigo-400 font-bold">
              Estilo Discord Ativo
            </span>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Hand: Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* STATUS */}
              <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <MessageSquare size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">Status Customizado</span>
                </div>
                <form onSubmit={handleSaveStatus} className="flex gap-2.5">
                  <input
                    type="text"
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                    maxLength={60}
                    placeholder="Dispare seu status ex: 'Jogando Elden Ring...'"
                    className="flex-1 bg-white/[0.02] border border-white/10 focus:border-indigo-400 outline-none text-xs rounded-xl px-4 py-3 placeholder:text-white/20 transition-all font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 font-black text-[10px] uppercase tracking-wider rounded-xl text-white transition-all shrink-0 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  >
                    Salvar
                  </button>
                </form>
                
                {purchaseStatus?.id === 'status_save' && (
                  <span className="text-[9px] text-green-400 uppercase font-black tracking-widest text-center animate-pulse">{purchaseStatus.message}</span>
                )}

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[8px] uppercase tracking-widest font-black text-white/30">Sugestões Rápidas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {statusTemplates.map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setTempStatus(tpl)}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-white/60 hover:text-white transition-colors"
                      >
                        {tpl}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTempStatus('')}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-[9px] text-red-400 transition-colors"
                    >
                      Limpar status
                    </button>
                  </div>
                </div>
              </div>

              {/* BORDERS/AURAS */}
              <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between text-indigo-400 mb-1">
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Molduras de Avatar Animadas</span>
                  </div>
                  <span className="text-[8px] font-mono uppercase bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 rounded text-yellow-500 font-bold">DESBLOQUEADO</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {customBorders.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateMemberData({ profileBorder: b.id })}
                      className={`p-3.5 rounded-xl border flex items-center gap-3.5 text-left transition-all relative overflow-hidden group ${myMember?.profileBorder === b.id ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/5 bg-white/[0.01] hover:border-white/20'}`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${b.colorClass}`}>
                        <User size={12} className="text-white/40" />
                      </div>
                      <div className="flex flex-col overflow-hidden min-w-0">
                        <span className="text-[10px] font-black uppercase text-white tracking-wider truncate">{b.title}</span>
                        <span className="text-[8px] text-white/40 uppercase font-bold truncate leading-tight group-hover:text-white/70">{b.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BANNERS */}
              <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between text-indigo-400 mb-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Efeitos no Banner do Perfil</span>
                  </div>
                  <span className="text-[8px] font-mono uppercase bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 rounded text-yellow-500 font-bold">DESBLOQUEADO</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {customBanners.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateMemberData({ bannerEffect: b.id })}
                      className={`p-3.5 rounded-xl border flex flex-col gap-1 text-left transition-all group ${myMember?.bannerEffect === b.id ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/5 bg-white/[0.01] hover:border-white/20'}`}
                    >
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">{b.title}</span>
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-widest leading-tight group-hover:text-white/70">{b.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Hand: PREVIEW */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="text-[8px] uppercase tracking-widest font-black text-white/30 text-center block">Visualização do Seu Perfil</span>
              
              {/* DISCORD CARD MOCKUP */}
              <div className="bg-[#18191c] border border-black rounded-3xl overflow-hidden shadow-2xl relative w-full font-sans flex flex-col text-left">
                {/* Banner wrapper */}
                <div className="h-28 relative overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={myMember?.profileBg || "https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748"}
                    alt="Art"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-black/35" />

                  {/* Banner specific effects simulated inside preview */}
                  {myMember?.bannerEffect === 'effect_fire' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-950/20 via-orange-900/10 to-red-600/15 mix-blend-color-dodge animate-pulse">
                      <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.25)_0,transparent_60%)] blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
                    </div>
                  )}
                  {myMember?.bannerEffect === 'effect_neon' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-purple-900/15 to-cyan-950/20">
                      <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gradient-to-b from-cyan-400 to-transparent opacity-40 animate-pulse" />
                      <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gradient-to-b from-purple-400 to-transparent opacity-60 animate-pulse duration-2000" />
                    </div>
                  )}
                  {myMember?.bannerEffect === 'effect_matrix' && (
                    <div className="absolute inset-0 overflow-hidden font-mono text-[5px] text-green-500/20 select-none whitespace-nowrap">
                      <div className="absolute top-2 left-2">101010111</div>
                      <div className="absolute top-8 left-16">010110100</div>
                    </div>
                  )}
                  {myMember?.bannerEffect === 'effect_cosmic' && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute -inset-12 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2)_0,transparent_55%)] blur-2xl animate-pulse" style={{ animationDuration: '10s' }} />
                    </div>
                  )}
                </div>

                {/* Avatar with Custom Discord Border overlapping banner */}
                <div className="px-5 pb-5 pt-1.5 relative flex flex-col">
                  {/* Avatar wrapper */}
                  <div className="absolute -top-12 left-5">
                    <div className={`w-20 h-20 rounded-full bg-[#18191c] p-1.5 relative flex items-center justify-center ${getBorderClasses(myMember?.profileBorder)}`}>
                      <SafeAvatar
                        src={myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                        isEcoMode={isEcoMode}
                      />
                      {/* Discord Badge/Active Online Status */}
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#18191c] rounded-full flex items-center justify-center p-0.5">
                        <div className="w-full h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                      </div>
                    </div>
                  </div>

                  {/* Account detail lines */}
                  <div className="mt-10 flex flex-col bg-[#111214] border border-[#232428] rounded-xl p-4 gap-3">
                    <div className="flex flex-col">
                      <span className={`text-base font-black tracking-tight ${getNicknameColorClass(myMember?.nicknameColor)}`}>
                        {myMember?.name || 'Recruta'}
                      </span>
                      <span className="text-[9px] font-bold text-white/40 uppercase font-mono mt-0.5">
                        {user?.email}
                      </span>
                    </div>

                    {/* Simple Custom Status */}
                    <div className="h-[1px] bg-white/[0.04] w-full" />
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[7.5px] uppercase font-black text-white/35 tracking-wider font-sans">STATUS ATUAL</span>
                      {tempStatus ? (
                        <div className="text-[10px] text-white/80 font-semibold italic flex items-center gap-1 bg-[#18191c] p-2 rounded-lg border border-white/5 w-fit">
                          <span>{tempStatus}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-white/20 uppercase font-black tracking-widest italic leading-relaxed py-1">Nenhum status configurado</span>
                      )}
                    </div>

                    <div className="h-[1px] bg-white/[0.04] w-full" />

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[7.5px] uppercase font-black text-white/35 tracking-wider font-sans">SOBRE MIM</span>
                      <p className="text-[9px] text-white/50 leading-relaxed uppercase font-black tracking-wider">
                        Membro leal do Clã Alcatéia Suprema. Preparado para batalhas de arena, missões estratégicas e honra de elite militar.
                      </p>
                    </div>

                    <div className="h-[1px] bg-white/[0.04] w-full" />

                    <div className="flex flex-col gap-1 flex-wrap">
                      <span className="text-[7.5px] uppercase font-black text-white/35 tracking-wider font-sans mb-1">CONQUISTAS DO CLÃ</span>
                      <div className="flex gap-1 flex-wrap">
                        {myMember?.title && (
                          <span className="px-2 py-0.5 bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/25 rounded-md text-[7px] font-black uppercase tracking-[0.15em]">
                            🏅 {myMember.title}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[7px] font-black uppercase tracking-[0.15em]">
                          🛡️ Nv. {myMember?.level || 0}
                        </span>
                        {myMember?.premiumPass && (
                          <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-500 border border-yellow-500/25 rounded-md text-[7px] font-black uppercase tracking-[0.15em]">
                            ✨ PREMIUM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (profileSubView === 'aura_store') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-20"
      >
        <button 
          onClick={() => setProfileSubView('main')}
          className="flex items-center gap-2 text-gaming-gold font-black uppercase text-[10px] tracking-widest hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft size={16} /> Voltar ao Perfil
        </button>

        <div className="bg-gaming-card border border-gaming-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-gaming-border flex items-center justify-between bg-white/[0.02]">
            <div>
              <h3 className="text-2xl font-display font-black uppercase italic text-white leading-none">Customização & Cosméticos</h3>
              <p className="text-[10px] text-gaming-gold font-bold uppercase tracking-[0.3em] mt-2">Escolha seu visual supremo e títulos lendários</p>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-gaming-gold/10 border border-gaming-gold/20 rounded-2xl text-[10px] font-black uppercase text-gaming-gold font-mono">
              <Star size={12} fill="currentColor" /> {myMember?.coins || 0} Moedas
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Store categories subtabs */}
            <div className="grid grid-cols-4 bg-black/40 border border-white/5 rounded-2xl p-1 mb-8">
              {[
                { id: 'auras', title: 'Auras & Bordas', icon: Shield },
                { id: 'titles', title: 'Títulos de Honra', icon: Crown },
                { id: 'backgrounds', title: 'Planos de Fundo', icon: ImageIcon },
                { id: 'colors', title: 'Cores de Nick', icon: Palette }
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setStoreTab(tabItem.id as any)}
                  className={`py-3 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    storeTab === tabItem.id 
                      ? 'bg-gaming-gold text-black shadow-lg font-black' 
                      : 'text-white/40 hover:text-white hover:bg-white/[0.01]'
                  }`}
                >
                  <tabItem.icon size={12} />
                  <span className="hidden sm:inline">{tabItem.title}</span>
                  <span className="sm:hidden">{tabItem.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AURAS */}
              {storeTab === 'auras' && borders.map(border => (
                <div 
                  key={border.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${myMember?.profileBorder === border.id ? 'border-gaming-gold bg-gaming-gold/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5 bg-white/[0.01] hover:border-white/20'}`}
                >
                  <div className="flex flex-col items-center text-center gap-5 mb-6">
                    <div className={`w-20 h-20 rounded-full ${border.color} border-2 relative flex items-center justify-center ${border.animated && !isEcoMode ? 'animate-pulse' : ''} bg-black/20`}>
                      <User size={36} className="text-white/10" />
                      {border.animated && !isEcoMode && (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 border border-t-white/45 border-transparent rounded-full"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 items-center">
                      <span className="text-[11px] font-black uppercase text-white tracking-widest">{border.title}</span>
                      <p className="text-[9px] text-white/50 uppercase font-black tracking-wide leading-relaxed">{border.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBuyBorder(border)}
                    disabled={myMember?.profileBorder === border.id}
                    className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      myMember?.profileBorder === border.id 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
                        : 'bg-gaming-gold text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:-translate-y-0.5'
                    }`}
                  >
                    {purchaseStatus?.id === border.id ? purchaseStatus.message : (myMember?.profileBorder === border.id ? 'Equipado' : `${border.price} Moedas`)}
                  </button>
                </div>
              ))}

              {/* TITLES */}
              {storeTab === 'titles' && titles.map(tOption => {
                const alreadyUnlocked = myMember?.unlockedTitles || [];
                const isUnlocked = alreadyUnlocked.includes(tOption.title) || false;
                const isEquipped = myMember?.title === tOption.title;
                const levelRequired = tOption.levelRequired;
                const userLevel = myMember?.level || 1;
                const isLockedByLevel = userLevel < levelRequired;

                return (
                  <div 
                    key={tOption.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${isEquipped ? 'border-gaming-gold bg-gaming-gold/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5 bg-white/[0.01] hover:border-white/20'}`}
                  >
                    <div className="flex flex-col items-center text-center gap-4 h-full justify-between">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gaming-gold/5 border border-gaming-gold/25 flex items-center justify-center text-gaming-gold relative">
                          <Crown size={20} className={isEquipped ? 'animate-bounce' : ''} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-black uppercase text-white tracking-widest block">{tOption.title}</span>
                          <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-relaxed">{tOption.desc}</p>
                        </div>
                      </div>

                      <div className="w-full flex flex-col gap-2.5 mt-6">
                        {isLockedByLevel && (
                          <div className="flex items-center justify-center gap-1.5 text-red-500 text-[10px] uppercase font-black mb-1 animate-pulse">
                            <Lock size={10} /> Requer Nível {levelRequired}
                          </div>
                        )}
                        
                        <button 
                          onClick={() => handleBuyTitle(tOption)}
                          disabled={isEquipped || isLockedByLevel}
                          className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isEquipped 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : isLockedByLevel
                                ? 'bg-black/40 border border-white/5 text-white/20 cursor-not-allowed'
                                : isUnlocked
                                  ? 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                                  : 'bg-gaming-gold text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:-translate-y-0.5'
                          }`}
                        >
                          {purchaseStatus?.id === tOption.id 
                            ? purchaseStatus.message 
                            : isEquipped 
                              ? 'Equipado' 
                              : isUnlocked 
                                ? 'Equipar' 
                                : `${tOption.price} Moedas`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* BACKGROUNDS */}
              {storeTab === 'backgrounds' && backgrounds.map(bgOption => {
                const currentBg = myMember?.profileBg || 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748';
                const isApplied = currentBg === bgOption.url;

                return (
                  <div 
                    key={bgOption.id}
                    className={`p-4 rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${isApplied ? 'border-gaming-gold bg-gaming-gold/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5 bg-white/[0.01] hover:border-white/20'}`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="h-24 rounded-2xl overflow-hidden relative border border-white/5 bg-black/20">
                        <img src={bgOption.url} className="w-full h-full object-cover opacity-60" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="text-[10px] font-black uppercase text-white tracking-widest block">{bgOption.title}</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-white/40 uppercase font-black tracking-wide text-center px-2">{bgOption.desc}</p>
                    </div>

                    <div className="mt-4 w-full">
                      <button 
                        disabled={bgOption.id !== 'padrão'}
                        onClick={() => handleBuyBackground(bgOption)}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          bgOption.id !== 'padrão'
                            ? 'bg-white/5 border border-white/5 text-white/30 cursor-not-allowed'
                            : isApplied 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
                              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {bgOption.id !== 'padrão'
                          ? 'Em Desenvolvimento'
                          : purchaseStatus?.id === bgOption.id 
                            ? purchaseStatus.message 
                            : isApplied 
                              ? 'Equipado' 
                              : bgOption.price === 0 
                                ? 'Equipar Grátis' 
                                : `${bgOption.price} Moedas`}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* NICKNAME COLORS */}
              {storeTab === 'colors' && nicknameColors.map(colorOption => {
                const alreadyUnlocked = myMember?.unlockedColors || [];
                const isUnlocked = alreadyUnlocked.includes(colorOption.id) || colorOption.price === 0;
                const isEquipped = (myMember?.nicknameColor || 'color_white') === colorOption.id;

                return (
                  <div 
                    key={colorOption.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${isEquipped ? 'border-gaming-gold bg-gaming-gold/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5 bg-white/[0.01] hover:border-white/20'}`}
                  >
                    <div className="flex flex-col items-center text-center gap-4 h-full justify-between">
                      <div className="flex flex-col items-center gap-3 w-full">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center relative">
                          <Palette size={20} className={isEquipped ? 'text-gaming-gold animate-pulse' : 'text-white/40'} />
                        </div>
                        <div className="flex flex-col gap-1 w-full max-w-full overflow-hidden">
                          <span className={`text-sm md:text-base font-black uppercase tracking-wider block font-sans truncate py-1 ${colorOption.textClass}`}>
                            {myMember?.name || 'Recruta'}
                          </span>
                          <span className="text-[10px] font-bold text-white/80 tracking-widest block uppercase mt-1">
                            {colorOption.title}
                          </span>
                          <p className="text-[9px] text-white/40 uppercase font-black tracking-wider leading-relaxed">
                            {colorOption.desc}
                          </p>
                        </div>
                      </div>

                      <div className="w-full flex flex-col gap-2.5 mt-6">
                        <button 
                          onClick={() => handleBuyColor(colorOption)}
                          className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isEquipped 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
                              : isUnlocked
                                ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                : 'bg-gaming-gold text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:-translate-y-0.5'
                          }`}
                        >
                          {purchaseStatus?.id === colorOption.id 
                            ? purchaseStatus.message 
                            : isEquipped 
                              ? 'Equipado' 
                              : isUnlocked 
                                ? 'Equipar' 
                                : `${colorOption.price} Moedas`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-8">
      <div className="relative overflow-hidden flex flex-col lg:flex-row items-center gap-6 md:gap-8 bg-gaming-card/40 border border-gaming-border rounded-3xl p-6 md:p-8">
          {/* Background Image/Art */}
          <div className="absolute inset-0 opacity-45 sm:opacity-55 pointer-events-none">
            <img 
              src={myMember?.profileBg || "https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748"} 
              alt="Art" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0 relative z-10">
           <div 
             className={`w-32 h-32 md:w-40 md:h-40 rounded-full p-1 relative bg-black/20 flex items-center justify-center ${getBorderClasses(myMember?.profileBorder)}`}
           >
              {!isEcoMode && <div className={`absolute -inset-2 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${myMember?.profileBorder === 'border_gold' ? 'bg-gaming-gold/20' : 'bg-gaming-gold/10'}`} />}
              <SafeAvatar 
                src={myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover relative z-10"
                isEcoMode={isEcoMode}
              />
           </div>
         </div>

         <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 flex-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-black text-gaming-gold tracking-[0.4em]">Guerreiro de Elite</span>
              <h2 className={`text-3xl md:text-5xl font-display font-black uppercase italic tracking-tighter ${getNicknameColorClass(myMember?.nicknameColor)}`}>{myMember?.name || 'Recruta'}</h2>
            </div>

            <div className="flex gap-2.5 flex-wrap justify-center lg:justify-start">
              <button 
                onClick={() => setProfileSubView('aura_store')}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-gaming-gold hover:border-gaming-gold/40 hover:bg-gaming-gold/5 transition-all group"
              >
                <Palette size={14} className="group-hover:rotate-12 transition-transform" />
                Loja de Aura
              </button>
              <button 
                onClick={() => setProfileSubView('discord_custom')}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:border-indigo-400 hover:bg-indigo-500/25 transition-all group shadow-[0_0_15px_rgba(99,102,241,0.15)] align-middle"
              >
                <Sparkles size={14} className="group-hover:scale-110 transition-transform" />
                Perfil Discord
              </button>
            </div>
            <p className="text-white/40 text-[10px] md:text-xs uppercase font-bold tracking-[0.2em]">{user?.email}</p>
            <div className="flex gap-2 mt-4 flex-wrap justify-center lg:justify-start">
               {myMember?.premiumPass && (
                 <span className="px-3 py-1 bg-gaming-gold text-black rounded-full text-[9px] font-black uppercase tracking-widest">Premium</span>
               )}
               <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">Nv. {myMember?.level || 0}</span>
            </div>
         </div>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
         {stats.map(s => (
           <div 
            key={s.label} 
            onClick={() => s.editable && setEditingPower(true)}
            className={`bg-gaming-card/40 border border-gaming-border rounded-2xl p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 hover:border-gaming-gold/50 transition-all ${s.editable ? 'cursor-pointer' : ''}`}
           >
              <s.icon className={s.color} size={20} />
              <div className="text-center w-full">
                 <span className="text-[7px] md:text-[8px] uppercase font-black text-white/30 tracking-widest block">{s.label}</span>
                 {s.editable && editingPower ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="number"
                        value={newPower}
                        onChange={(e) => setNewPower(Number(e.target.value))}
                        autoFocus
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm font-mono text-center outline-none focus:border-gaming-gold transition-colors"
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePowerUpdate(); }}
                        className="bg-gaming-gold text-black p-1 rounded text-[8px]"
                      >
                        OK
                      </button>
                    </div>
                 ) : (
                    <span className="text-lg md:text-2xl font-mono font-black">{s.val.toLocaleString()}</span>
                 )}
                 {s.editable && !editingPower && (
                   <span className="text-[6px] uppercase text-gaming-gold/50 block mt-1">Clique para editar</span>
                 )}
              </div>
           </div>
         ))}
      </div>

      <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-8 flex flex-col items-center justify-center min-h-[200px] border-dashed">
         <Trophy size={48} className="text-white/10 mb-4" />
         <h4 className="font-display font-black uppercase text-lg text-white/20">Registro de Conquistas</h4>
         <p className="text-[10px] text-white/10 uppercase font-black tracking-[0.3em] mt-2">Em Desenvolvimento</p>
      </div>
    </div>
  );
}

// --- CONFIGURACOES VIEW ---
export function ConfiguracoesView() {
  const { logout, myMember, updateMemberData, isEcoMode, toggleEcoMode, isOptimizing, deleteMember, completeMission } = useClan();

  React.useEffect(() => {
    completeMission('check_optimization', 20);
  }, []);

  const handleThemeChange = (theme: 'dark' | 'neon' | 'gold' | 'classic') => {
    updateMemberData({ appTheme: theme });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMemberData({ opacityLevel: Number(e.target.value) });
  };

  const handleDeleteAccount = async () => {
    if (!myMember) return;
    
    if (confirm("TEM CERTEZA? Esta ação é irreversível e você perderá todo o seu progresso na Alcatéia Suprema. Suas medalhas, diamonds e status serão apagados.")) {
       try {
          await deleteMember(myMember.userId);
       } catch (err) {
          console.error('Erro ao deletar conta:', err);
          alert("Ocorreu um erro ao tentar deletar sua conta. Tente novamente mais tarde.");
       }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2 md:p-4 max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-display font-black uppercase italic tracking-tight">
        Ajustes da <span className="text-gaming-gold">Alcatéia</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Optimization Section */}
        <div className="col-span-1 lg:col-span-2 bg-linear-to-br from-gaming-purple/15 to-transparent border border-gaming-purple/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-lg relative overflow-hidden group">
           <div className={`p-2.5 rounded-xl bg-gaming-purple/20 text-gaming-purple border border-gaming-purple/20 group-hover:scale-105 transition-transform shrink-0 ${isOptimizing ? 'animate-spin' : ''}`}>
              <Zap size={20} fill="currentColor" />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h4 className="font-display font-bold uppercase text-sm mb-0.5 italic flex items-center justify-center md:justify-start gap-1.5">
                Modo Desempenho
                <span className="bg-gaming-gold/20 text-gaming-gold text-[7px] px-1.5 py-0.5 rounded-full border border-gaming-gold/20 font-black">CELULAR</span>
              </h4>
              <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-tight">
                {isEcoMode 
                  ? "Ativo. Gráficos simplificados para um jogo super veloz em celulares."
                  : "Modo gráfico completo com efeitos e transições ativadas."}
              </p>
           </div>
           <button 
             onClick={toggleEcoMode}
             disabled={isOptimizing}
             className={`px-4 py-2 rounded-lg font-display font-black uppercase tracking-wider text-[8px] sm:text-[9px] transition-all flex items-center gap-1.5 ${
               isEcoMode 
                ? 'bg-gaming-gold text-black hover:bg-white' 
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
             }`}
           >
              {isOptimizing ? (
                 <>
                   <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   <span>Otimizando...</span>
                 </>
              ) : isEcoMode ? (
                 <>
                   <Zap size={10} fill="currentColor" />
                   <span>Gráficos Completos</span>
                 </>
              ) : (
                 <span>Otimizar para Celular</span>
              )}
           </button>
        </div>

        <div className="bg-gaming-card/35 border border-gaming-border rounded-xl p-4 flex flex-col gap-5 shadow-lg">
           <div className="flex items-center gap-2">
              <Palette className="text-gaming-gold" size={18} />
              <h4 className="font-display font-black uppercase tracking-wider text-xs">Aparência do Lobinho</h4>
           </div>
           
           <div className="space-y-4">
              <div>
                 <span className="text-[8px] uppercase font-black text-white/40 tracking-widest block mb-2">Tema da Alcatéia</span>
                 <div className="grid grid-cols-2 gap-1.5">
                    {[
                       { id: 'dark', label: 'Alcatéia Alfa (Dourado & Roxo)' },
                       { id: 'neon', label: 'Nevasca Violeta' },
                       { id: 'gold', label: 'Ouro Rúnico' },
                       { id: 'classic', label: 'Lobo de Prata' }
                    ].map(t => (
                      <button 
                        key={t.id}
                        onClick={() => handleThemeChange(t.id as any)}
                        className={`py-2 px-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${myMember?.appTheme === t.id ? 'bg-gaming-gold text-black border-gaming-gold shadow-[0_0_10px_rgba(226,180,77,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-widest">Opacidade do Painel</span>
                    <span className="text-[10px] font-mono text-gaming-gold">{myMember?.opacityLevel || 80}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="10"
                    max="100"
                    value={myMember?.opacityLevel || 80}
                    onChange={handleOpacityChange}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gaming-gold" 
                 />
              </div>
           </div>
        </div>

        <div className="bg-gaming-card/35 border border-gaming-border rounded-xl p-4 flex flex-col gap-4 shadow-lg">
           <div className="flex items-center gap-2">
              <Settings className="text-gaming-gold" size={18} />
              <h4 className="font-display font-black uppercase text-xs">Identificação & Segurança</h4>
           </div>
           
           <div className="space-y-3 flex-1">
              <button 
                onClick={logout}
                className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Encerrar Caçada (Sair)
              </button>

              <div className="pt-4 border-t border-white/5">
                <h5 className="text-[8px] uppercase font-black text-red-500 tracking-widest mb-2">Sair da Alcatéia</h5>
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} /> Excluir Conta do Clã
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- REWARDS VIEW ---
export function RewardsView() {
  const { myMember, updateMemberData, isEcoMode } = useClan();

  const [purchaseStatus, setPurchaseStatus] = useState<{ id: string, message: string, type: 'success' | 'error' } | null>(null);

  const handleClaimReward = (reward: any) => {
    if (reward.inDevelopment) {
      setPurchaseStatus({ id: reward.id, message: "Este item está em desenvolvimento!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 3000);
      return;
    }

    if (!myMember) return;
    
    if (myMember.diamonds < reward.price) {
      setPurchaseStatus({ id: reward.id, message: `Saldo insuficiente!`, type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 3000);
      return;
    }

    if (reward.id.includes('pass') && myMember.premiumPass) {
      setPurchaseStatus({ id: reward.id, message: "Você já possui um Passe Premium ativo!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 3000);
      return;
    }

    const updates: any = {
      diamonds: myMember.diamonds - reward.price
    };

    if (reward.id.includes('pass')) {
      updates.premiumPass = true;
    }

    updateMemberData(updates);
    setPurchaseStatus({ id: reward.id, message: `Resgatado com sucesso!`, type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 3000);
  };

  const rewards = [
    { 
      id: 'weekly_pass', 
      title: 'Passe Premium Semanal', 
      desc: 'Acesso total aos benefícios premium por 7 dias.', 
      price: 100, 
      icon: Star,
      rarity: 'Raro'
    },
    { 
      id: 'monthly_pass', 
      title: 'Passe Premium Mensal', 
      desc: 'O pack definitivo de benefícios premium por 30 dias.', 
      price: 500, 
      icon: Shield,
      rarity: 'Lendário'
    },
    { 
      id: 'gift_card_50', 
      title: 'Gift Card R$ 50', 
      desc: 'Cartão presente de R$ 50 para usar como quiser.', 
      price: 200, 
      icon: CreditCard,
      rarity: 'Místico'
    },
    { 
      id: 'clan_merch', 
      title: 'Kit Aliança (Camisa + Caneca)', 
      desc: 'Mostre seu orgulho com o kit oficial personalizado.', 
      price: 200, 
      icon: ShoppingBag,
      rarity: 'Exclusivo',
      inDevelopment: true
    }
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6 p-3 sm:p-5 md:p-8">
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4`}>
        <div>
           <span className="text-[9px] uppercase font-black text-gaming-gold tracking-[0.4em] mb-1 block">Mercado Negro</span>
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter">
             Central de <span className="text-gaming-gold">Recompensas</span>
           </h2>
        </div>
        <div className={`flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-xl ${isEcoMode ? '' : 'backdrop-blur-md'}`}>
           <Gem size={18} className="text-gaming-gold animate-pulse" />
           <div className="flex flex-col">
              <span className="text-[8px] uppercase font-black text-white/30 tracking-widest">Seu Saldo</span>
              <span className="font-mono font-black text-gaming-gold text-base sm:text-lg leading-none">{myMember?.diamonds || 0}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
         {rewards.map((reward) => (
           <motion.div 
            key={reward.id}
            whileHover={!isEcoMode ? { y: -3 } : {}}
            className={`group relative bg-gaming-card/40 border border-gaming-border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 overflow-hidden transition-all hover:bg-gaming-card/60 hover:border-gaming-gold/30 ${isEcoMode ? '' : 'backdrop-blur-md'}`}
           >
              {reward.inDevelopment && (
                <div className={`absolute inset-0 bg-black/60 z-20 flex items-center justify-center rotate-[-15deg] scale-125 pointer-events-none ${isEcoMode ? '' : 'backdrop-blur-[2px]'}`}>
                   <span className="bg-gaming-gold text-black px-6 py-1.5 font-black uppercase tracking-[0.3em] text-[8px] sm:text-[9px] shadow-2xl">Em Desenvolvimento</span>
                </div>
              )}

              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 text-white group-hover:text-gaming-gold group-hover:border-gaming-gold/50 transition-all shadow-inner`}>
                       <reward.icon size={24} />
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-white/5 rounded-full border border-white/5 text-white/40">{reward.rarity}</span>
                 </div>

                 <h4 className="font-display font-black uppercase text-lg sm:text-xl mb-1.5 leading-tight group-hover:text-gaming-gold transition-colors truncate">{reward.title}</h4>
                 <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase leading-relaxed tracking-wider min-h-[36px] italic">{reward.desc}</p>
              </div>

              <div className="mt-auto relative z-10 pt-4 border-t border-white/5 flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-white/20 tracking-widest">Valor</span>
                    <div className="flex items-center gap-1.5">
                       <Gem size={12} className="text-gaming-gold" />
                       <span className="font-mono font-black text-gaming-gold text-sm sm:text-base">{reward.price}</span>
                    </div>
                 </div>
                 <button 
                  onClick={() => handleClaimReward(reward)}
                  className={`w-full py-2.5 sm:py-3 rounded-xl font-display font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all relative overflow-hidden ${
                    reward.inDevelopment 
                      ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-gaming-gold hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95'
                  }`}
                 >
                   <AnimatePresence mode="wait">
                     {purchaseStatus?.id === reward.id ? (
                       <motion.span 
                        key="status"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className={`absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] px-2 text-center text-wrap ${purchaseStatus.type === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}
                       >
                         {purchaseStatus.message}
                       </motion.span>
                     ) : (
                       <motion.span key="label">Resgatar</motion.span>
                     )}
                   </AnimatePresence>
                 </button>
              </div>

              {/* Decorative Background Icon */}
              {!isEcoMode && <reward.icon size={80} className="absolute -right-6 -bottom-6 text-white/[0.02] -rotate-12 group-hover:scale-110 transition-transform duration-700" />}
           </motion.div>
         ))}
      </div>

      <div className="bg-linear-to-r from-gaming-purple/10 to-transparent border border-gaming-purple/20 rounded-2xl p-5 flex items-center gap-4 mt-2">
         <div className="hidden md:flex w-14 h-14 bg-gaming-purple/20 rounded-full items-center justify-center text-gaming-purple flex-shrink-0 animate-pulse border border-gaming-purple/30">
            <Gift size={28} />
         </div>
         <div>
            <h5 className="font-display font-black uppercase text-base mb-1 italic">Eventos de Recarga</h5>
            <p className="text-[10px] sm:text-xs text-white/50 uppercase font-black tracking-widest leading-relaxed">Fique atento ao nosso Whatsapp para eventos especiais onde você pode ganhar diamantes em dobro e recompensas exclusivas por tempo limitado.</p>
         </div>
      </div>
    </div>
  );
}

// --- DEVELOPMENT VIEW HELPER ---
export function DevelopmentView({ tab, progress = 65 }: { tab: string, progress?: number }) {
  const [selectedCoord, setSelectedCoord] = useState<string | null>(null);
  const [tacticalLog, setTacticalLog] = useState<string[]>(['Iniciando telemetria operacional...']);
  
  const tabNames: Record<string, string> = {
    combate: 'Modo Combate',
    missoes: 'Quadro de Missões',
    social: 'Área Social',
    territorios: 'Territórios',
    batalha: 'Batalha de Clã',
    historico: 'Histórico de Guerras',
    gerencia: 'Gerência do Clã'
  };

  const addLog = (msg: string) => {
    setTacticalLog(prev => [msg, ...prev.slice(0, 4)]);
  };

  if (tab === 'batalha') {
    return (
      <div className="flex-1 flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full pb-20 text-left">
        <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">Conexão de Arena Pronta</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter">
            Arena PvP: <span className="text-gaming-gold">Batalha de Clã</span>
          </h2>
          <p className="text-[10px] text-white/50 uppercase font-black tracking-widest italic mt-1">Status: Conectando com servidor principal...</p>
        </div>

        {/* Dashboard de Monitoramento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Confronto */}
          <div className="bg-gaming-card border border-gaming-border p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Guerra Semanal</span>
              <span className="text-[8px] bg-red-400/10 text-red-400 px-1.5 py-0.5 rounded-sm font-black uppercase tracking-wider">Aguardando</span>
            </div>
            <div className="flex items-center justify-between py-2 text-center">
              <div className="flex flex-col items-center">
                <span className="text-sm font-display font-black uppercase tracking-tighter text-gaming-gold">ORDM</span>
                <span className="text-[8px] text-white/30 tracking-widest font-bold">SUPREMA ORDEM</span>
              </div>
              <span className="text-xs font-black italic text-white/20">VS</span>
              <div className="flex flex-col items-center">
                <span className="text-sm font-display font-black uppercase tracking-tighter text-red-500">NECS</span>
                <span className="text-[8px] text-white/30 tracking-widest font-bold">NECROS GUILD</span>
              </div>
            </div>
            <div className="text-center py-1 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-[10px] font-mono font-bold text-white/70">Timer de Combate: <span className="text-gaming-gold">EM AGUARDO...</span></span>
            </div>
          </div>

          {/* Telemetria */}
          <div className="bg-gaming-card border border-gaming-border p-4 rounded-2xl flex flex-col gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Relatório Operacional</span>
            <div className="flex flex-col gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase italic text-white/60">
              <div className="flex justify-between"><span>Defensores Escalados:</span> <span className="text-white">100 / 100</span></div>
              <div className="flex justify-between"><span>Poder Coletivo:</span> <span className="text-gaming-gold">SUPREMO</span></div>
              <div className="flex justify-between"><span>Coesão do Sistema:</span> <span className="text-green-400">98% Estável</span></div>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-gaming-gold h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          {/* Simulação Tática */}
          <div className="bg-gaming-card border border-gaming-border p-4 rounded-2xl flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-1">Diretivas do General</span>
            <div className="flex-1 flex flex-col justify-center gap-2">
              <button 
                onClick={() => {
                  const rands = ["Lançando isca no flanco Leste!", "Formando barreira no flanco Central!", "Tropas de elite aguardando sinal!", "Sincronia de voz carregada!"];
                  const selected = rands[Math.floor(Math.random() * rands.length)];
                  addLog(selected);
                }}
                className="w-full py-2 bg-gaming-purple/20 hover:bg-gaming-purple/35 border border-gaming-purple/30 text-gaming-purple rounded-xl font-display font-black uppercase text-[9px] tracking-widest transition-all"
              >
                Gerar Diretiva de Ataque
              </button>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5 font-mono text-[8px] text-white/40 leading-tight">
                {tacticalLog.map((log, i) => (
                  <div key={i} className={i === 0 ? "text-gaming-purple font-bold" : ""}>&gt; {log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Em Desenvolvimento Warning */}
        <div className="bg-gaming-card/30 border border-gaming-border rounded-2xl p-6 flex flex-col gap-4 text-center items-center justify-center relative overflow-hidden py-8">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-1">
            <X className="text-red-500 animate-pulse" size={24} />
          </div>
          <h4 className="text-xs sm:text-sm font-display font-black uppercase text-red-500 tracking-widest">Sistemas PvP sob Sincronização</h4>
          <p className="text-[10px] sm:text-xs text-white/50 max-w-sm font-bold uppercase italic leading-relaxed tracking-wide">
            A arena de batalha dinâmica para combates em larga escala está sendo conectada com a base central por Skadir. A tecnologia PvP Multiplayer em tempo real está sendo refinada. Retorne para a convocação geral!
          </p>
          <div className="flex gap-4">
             <div className="px-3 py-1.5 bg-gaming-gold/5 border border-gaming-gold/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-gaming-gold">Progresso: 85%</div>
             <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/30">Versão: V0.95 BETA</div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'territorios') {
    return (
      <div className="flex-1 flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full pb-20 text-left">
        <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gaming-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase text-gaming-gold tracking-[0.2em]">Mapa de Província Orbital</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter">
            Controle de <span className="text-gaming-gold">Territórios</span>
          </h2>
          <p className="text-[10px] text-white/50 uppercase font-black tracking-widest italic mt-1">Selecione uma área para sincronizar defesas com o Firestore</p>
        </div>

        {/* Grade de Territórios Interativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-gaming-card border border-gaming-border p-5 rounded-2xl flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest border-b border-white/5 pb-2 block">Matriz de Conquistas da Ordem Suprema</span>
            <div className="grid grid-cols-4 gap-2 py-2">
              {['A-1', 'A-2', 'A-3', 'A-4', 'B-1', 'B-2', 'B-3', 'B-4', 'C-1', 'C-2', 'C-3', 'C-4'].map(coord => {
                const isDominated = ['A-1', 'B-2', 'C-3', 'A-4'].includes(coord);
                const isContested = ['B-1', 'C-4'].includes(coord);
                return (
                  <button 
                    key={coord}
                    onClick={() => {
                      setSelectedCoord(coord);
                      playConnectionSound(true);
                    }}
                    className={`p-3 rounded-xl border font-mono text-xs font-black uppercase tracking-widest transition-all ${
                      selectedCoord === coord 
                        ? 'bg-gaming-gold text-black border-gaming-gold font-black scale-95' 
                        : isDominated
                        ? 'bg-gaming-purple/20 border-gaming-purple/40 text-gaming-purple hover:bg-gaming-purple/30'
                        : isContested
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/25'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-white/40 hover:text-white'
                    }`}
                  >
                    {coord}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 justify-around text-[9px] uppercase font-black tracking-wider text-white/50 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gaming-purple/30 border border-gaming-purple/50 rounded-full inline-block" /> Dominado</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/40 rounded-full inline-block" /> Contestado</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-white/5 border border-white/15 rounded-full inline-block" /> Vazio</span>
            </div>
          </div>

          <div className="bg-gaming-card border border-gaming-border p-5 rounded-2xl flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest border-b border-white/5 pb-2">Status do Quadrante</span>
            {selectedCoord ? (
              <div className="flex-1 flex flex-col gap-4 text-left justify-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Coordenada</span>
                  <span className="text-3xl font-display font-black text-gaming-gold italic">Região {selectedCoord}</span>
                </div>
                <div className="flex flex-col gap-1 text-[10px] uppercase font-black text-white/60">
                  <p>Incursão Inimiga: <span className="text-red-400 font-bold">Nenhum perigo</span></p>
                  <p>Força da Guarnição: <span className="text-gaming-purple">95.000 Power</span></p>
                  <p>Bônus de Região: <span className="text-green-400">XP EM DOBRO</span></p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <span className="text-[9px] font-black tracking-widest text-white/50">TERRITÓRIO PROTEGIDO ✅</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <Compass className="text-white/20 animate-spin" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-3 max-w-[130px]">Selecione um quadrante ao lado</span>
              </div>
            )}
          </div>
        </div>

        {/* Em Desenvolvimento Warning */}
        <div className="bg-gaming-card/30 border border-gaming-border rounded-2xl p-6 flex flex-col gap-4 text-center items-center justify-center relative overflow-hidden py-8">
          <div className="w-14 h-14 bg-gaming-gold/10 border border-gaming-gold/20 rounded-full flex items-center justify-center mb-1">
            <Compass className="text-gaming-gold animate-spin" size={24} />
          </div>
          <h4 className="text-xs sm:text-sm font-display font-black uppercase text-gaming-gold tracking-widest">Expansão de Território em Desenvolvimento</h4>
          <p className="text-[10px] sm:text-xs text-white/50 max-w-sm font-bold uppercase italic leading-relaxed tracking-wide">
            O painel de mapeamento tático por satélite está integrando novos sistemas estratégicos para combates táticos. Retorne em breve para enviar suas guarnições militares.
          </p>
          <div className="flex gap-4">
             <div className="px-3 py-1.5 bg-gaming-gold/5 border border-gaming-gold/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-gaming-gold">Progresso: 75%</div>
             <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/30">Atualização Próxima</div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'historico') {
    return (
      <div className="flex-1 flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full pb-20 text-left">
        <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gaming-purple animate-pulse" />
            <span className="text-[10px] font-black uppercase text-gaming-purple tracking-[0.2em]">Crônicas da Suprema Ordem</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter">
            Histórico de <span className="text-gaming-gold">Guerras</span>
          </h2>
          <p className="text-[10px] text-white/50 uppercase font-black tracking-widest italic mt-1">Conquistas imortais gravadas de forma definitiva na aliança</p>
        </div>

        {/* Lista de Conquistas */}
        <div className="flex flex-col gap-3">
          {[
            { opponent: '⚔️ Necros Guild (NECS)', result: 'vitoria', score: '300x120', date: '18/05/2026', desc: 'Batalha pela ponte celestial no Quadrante Leste.', reward: '+500 Troféus' },
            { opponent: '💀 Lord Knights (KNGS)', result: 'vitoria', score: '280x270', date: '12/05/2526', desc: 'Combate tenso com invasão militar de madrugada.', reward: '+350 Troféus' },
            { opponent: '🛡️ Veterans Team (VETR)', result: 'empate', score: '150x150', date: '05/05/2026', desc: 'Draw tático em campo aberto em condições extremas.', reward: '+50 Troféus' },
            { opponent: '🔥 Shadow Legion (SLGN)', result: 'vitoria', score: '300x40', date: '29/04/2026', desc: 'Aniquilação completa da tropa mercenária inimiga.', reward: '+600 Troféus' }
          ].map((item, index) => (
            <div key={index} className="bg-gaming-card border border-gaming-border p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gaming-purple/20 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-display font-black uppercase text-white/90">{item.opponent}</span>
                <span className="text-[9px] text-white/40 uppercase font-bold tracking-wide italic">{item.desc} | {item.date}</span>
              </div>
              <div className="flex sm:flex-col items-end gap-2 sm:gap-1 w-full sm:w-auto justify-between border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm inline-block ${item.result === 'vitoria' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{item.result}</span>
                  <span className="font-mono text-xs font-black text-white/50 tracking-wider">{item.score}</span>
                </div>
                <span className="text-[9px] font-black text-gaming-gold tracking-widest uppercase italic">{item.reward}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Em Desenvolvimento Warning */}
        <div className="bg-gaming-card/30 border border-gaming-border rounded-2xl p-6 flex flex-col gap-4 text-center items-center justify-center relative overflow-hidden py-8">
          <div className="w-14 h-14 bg-gaming-purple/10 border border-gaming-purple/20 rounded-full flex items-center justify-center mb-1">
            <Flame className="text-gaming-purple animate-pulse" size={24} />
          </div>
          <h4 className="text-xs sm:text-sm font-display font-black uppercase text-gaming-purple tracking-widest">Sincronizador Firestore Automático</h4>
          <p className="text-[10px] sm:text-xs text-white/50 max-w-sm font-bold uppercase italic leading-relaxed tracking-wide">
            O registro dinâmico automático está compilando arquivos da API militar. Novos conflitos automáticos serão computados e expostos nesta aba.
          </p>
          <div className="flex gap-4">
             <div className="px-3 py-1.5 bg-gaming-gold/5 border border-gaming-gold/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-gaming-gold">Progresso: 90%</div>
             <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/30">Auto-update Ativo</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12">
      <div className="w-20 h-20 bg-gaming-gold/10 border border-gaming-gold/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
        <Lock className="text-gaming-gold" size={32} />
      </div>
      <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-widest mb-4">
        {tabNames[tab] || 'Em Desenvolvimento'}
      </h2>
      <p className="text-white/40 max-w-sm uppercase text-[9px] md:text-[10px] tracking-[0.2em] font-bold leading-relaxed">
        A área de {tabNames[tab] || tab} está sendo sincronizada com o servidor principal da Aliança Suprema Ordem. Retorne em breve.
      </p>
      <div className="mt-8 flex gap-4">
         <div className="px-4 py-2 bg-gaming-gold/5 border border-gaming-gold/20 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-gaming-gold">Progresso: {progress}%</div>
         <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Stable: V0.9</div>
      </div>
    </div>
  );
}

// --- GERENCIA VIEW ---
export function GerenciaView() {
  const { user, members, myMember, deleteMember, banMember, updateMemberRole, updateClanLoginLogoImage, clan, theftReports, clearTheftReport, isEcoMode, distributeElixirXP } = useClan();
  const [editingId, setEditingId] = useState<string | null>(null);
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
        }
      } catch (err) {
        console.error('Erro ao excluir membro:', err);
        alert('Erro na operação. Verifique suas permissões de Líder.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handlePromotion = async (memberId: string, currentRole: string) => {
    if (!isLeader) return;
    
    let newRole = 'warrior';
    let actionLabel = '';

    if (currentRole === 'warrior') {
      newRole = 'diplomat';
      actionLabel = 'PROMOVER A DIPLOMATA';
    } else if (currentRole === 'diplomat') {
      newRole = 'warrior';
      actionLabel = 'REBAIXAR A GUERREIRO';
    } else {
      return; 
    }

    if (confirm(`Deseja realmente ${actionLabel} este guerreiro?`)) {
      try {
        await updateMemberRole(memberId, newRole);
      } catch (err) {
        alert('Erro ao alterar cargo.');
      }
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

  if (!isLeader) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6 opacity-40">
        <ShieldAlert size={64} className="text-red-500" />
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl font-display font-black uppercase italic text-white tracking-tighter">Acesso Negado</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 max-w-[200px]">Somente o Líder Supremo com o e-mail autorizado pode acessar as tecnologias de gestão de clã.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-6xl mx-auto w-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-500 border border-red-500/30">
                 <ShieldAlert size={16} />
              </div>
              <span className="text-[10px] uppercase font-black text-red-500 tracking-[0.4em]">Painel de Alto Comando</span>
           </div>
           <h2 className="text-4xl md:text-6xl font-display font-black uppercase italic tracking-tighter leading-none">
             Gestão de <span className="text-gaming-gold">Membros</span>
           </h2>
        </div>
      </div>

      {/* Reports Section */}
      {theftReports.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="text-lg font-display font-black uppercase italic text-red-500">Denúncias de Furto Pendentes ({theftReports.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {theftReports.map(report => (
                <motion.div 
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-red-400">Denunciado por:</span>
                    <button 
                      onClick={() => clearTheftReport(report.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-white">{report.reporterName}</h4>
                      <p className="text-[8px] font-mono font-bold text-white/30">{new Date(report.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-[9px] font-bold text-white/50 uppercase italic leading-relaxed">
                    Relatou ocorrência de furto de caravana/recursos. Verificar logs do jogo.
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <span className="text-[10px] uppercase font-black text-red-500 tracking-[0.4em] mb-1 block">Acesso Restrito</span>
           <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter">
             Gestão de <span className="text-gaming-gold">Liderança</span>
           </h2>
        </div>
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl">
           <ShieldCheck size={20} className="text-red-500" />
           <div className="flex flex-col">
              <span className="text-[8px] uppercase font-black text-white/30 tracking-widest">Status</span>
              <span className="font-display font-black text-red-500 text-xs leading-none uppercase">Admin Ativo</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
           <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <h4 className="font-display font-black uppercase text-sm tracking-widest italic">Integrantes ({members.length})</h4>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">ID Aliança: ORDM</span>
                 </div>
              </div>
              
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                 <AnimatePresence mode="popLayout">
                   {members.filter(m => m.userId !== myMember?.userId).map(m => (
                      <motion.div 
                        key={m.id} 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-all group"
                      >
                       <div className="flex items-center gap-4">
                          <SafeAvatar 
                            src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId}`} 
                            className="w-10 h-10 rounded-full border border-white/10 object-cover" 
                            alt={m.name}
                            isEcoMode={isEcoMode}
                          />
                          <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white group-hover:text-gaming-gold transition-colors">{m.name}</span>
                             </div>
                             <span className={`text-[8px] font-black uppercase tracking-widest ${getRoleBadgeColor(m.role)}`}>{getRoleLabel(m.role)}</span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                         <select 
                           value={m.role}
                           onChange={(e) => updateMemberRole(m.id, e.target.value as any)}
                           className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none hover:border-gaming-gold/40 transition-all cursor-pointer"
                         >
                           <option value="diplomat" className="bg-gaming-card">Diplomata</option>
                           <option value="military_leader" className="bg-gaming-card">Líder Militar</option>
                           <option value="recruiter" className="bg-gaming-card">Recrutador</option>
                           <option value="muse" className="bg-gaming-card">Musa</option>
                           <option value="warrior" className="bg-gaming-card">Guerreiro</option>
                         </select>

                          <button 
                             disabled={deletingId === m.id}
                             onClick={() => handleDeleteMember(m.id, m.name, true)}
                             className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                             title="Remover Membro"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </motion.div>
                  ))}
                 </AnimatePresence>
                 {members.length <= 1 && (
                   <div className="py-24 text-center flex flex-col items-center gap-4 opacity-20">
                      <Users size={48} />
                      <div className="text-[10px] uppercase font-black tracking-widest">
                        Nenhum outro guerreiro na aliança para gerenciar.
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-6 flex flex-col gap-6">
              <h4 className="font-display font-black uppercase text-sm tracking-widest italic border-b border-white/5 pb-4">Ações Estratégicas</h4>
              
              <div className="space-y-3">
                 <button 
                   onClick={() => {
                     const target = prompt('Digite o nome exato do jogador:');
                     if (target) {
                       const member = members.find(m => m.name.toLowerCase().trim() === target.toLowerCase().trim());
                       if (member) {
                         setEditingId(member.id);
                       } else {
                         alert('Membro não encontrado.');
                       }
                     }
                   }}
                   className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all font-display font-black uppercase text-[10px] tracking-widest"
                 >
                    <UserPlus size={16} /> Buscar Guerreiro
                 </button>
                 
                 <button 
                   onClick={() => setEditingId(editingId === 'all' ? null : 'all')}
                   className={`w-full py-4 border rounded-xl flex items-center justify-center gap-3 transition-all font-display font-black uppercase text-[10px] tracking-widest ${editingId === 'all' ? 'bg-gaming-gold text-black border-gaming-gold shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-white/5 border-white/10 text-white hover:bg-white/5'}`}
                 >
                    <Edit2 size={16} /> {editingId === 'all' ? 'Finalizar Edição' : 'Gerenciar Todos'}
                 </button>
              </div>
           </div>

            {/* Gerenciamento de Logo do Login de Todos */}
            <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-6 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Palette className="text-gaming-gold animate-pulse" size={18} />
                <h4 className="font-display font-black uppercase text-sm tracking-widest italic">Logo do Login para Todos</h4>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-[10px] text-white/50 leading-relaxed font-bold uppercase italic">
                  Altere a foto do logo em todas as telas de login oficiais da Suprema Ordem.
                </p>

                {/* Previsualização em Tempo Real */}
                <div className="flex items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[8px] uppercase tracking-widest text-white/20 font-black">Visualização Atual:</span>
                    <div className="w-16 h-16 hex-clip bg-linear-to-br from-gaming-gold/20 to-gaming-purple/20 border border-gaming-gold/30 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                      <img 
                        src={clan?.loginLogoImage || "/src/assets/images/supreme_order_gold_logo_1778976451328.png"} 
                        alt="Logo Preview" 
                        className="w-10 h-10 object-contain drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Inputs do Logo */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-black text-white/40 tracking-widest">Opção 1: Upload de Arquivo</span>
                    <label className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all font-display font-black uppercase text-[9px] tracking-widest text-white/80 shrink-0 select-none">
                      <Camera size={14} className="text-gaming-gold" /> Escolher Foto...
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            if (event.target?.result) {
                              try {
                                 await updateClanLoginLogoImage(event.target.result as string);
                                 alert("Logo do login atualizado com sucesso para todos!");
                              } catch (err: any) {
                                 console.error("Erro ao salvar loginLogo:", err);
                                 alert("Não foi possível persistir no Firestore. Lembre-se de aceitar/adicionar as regras de segurança.");
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[9px] uppercase font-black text-white/40 tracking-widest">Opção 2: URL de Imagem da Web</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://exemplo.com/sua-logo.png" 
                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-white outline-none focus:border-gaming-gold/40 transition-all placeholder-white/20"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              try {
                                await updateClanLoginLogoImage(val);
                                e.currentTarget.value = "";
                                alert("Logo alterado com sucesso!");
                              } catch (err) {
                                alert("Erro ao salvar.");
                              }
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={async (e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const val = input?.value?.trim();
                          if (val) {
                            try {
                              await updateClanLoginLogoImage(val);
                              input.value = "";
                              alert("Logo alterado com sucesso!");
                            } catch (err) {
                              alert("Erro ao salvar.");
                            }
                          }
                        }}
                        className="px-3 py-2 bg-gaming-gold text-black rounded-xl font-display font-black uppercase text-[10px] tracking-widest hover:bg-gaming-gold/80 transition-all"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>

                  {/* Restaurar Logo Padrão */}
                  <button 
                    onClick={async () => {
                      if (confirm("Deseja mesmo restaurar o logo oficial padrão da Suprema Ordem?")) {
                        try {
                          await updateClanLoginLogoImage("");
                          alert("Logo oficial restaurado!");
                        } catch (err) {
                          alert("Erro ao restaurar.");
                        }
                      }
                    }}
                    className="w-full py-2 bg-red-400/5 hover:bg-red-400/15 border border-red-500/10 hover:border-red-500/30 text-red-400 rounded-xl font-display font-black uppercase text-[9px] tracking-widest transition-all"
                  >
                    Restaurar Logo Padrão
                  </button>
                </div>
              </div>
            </div>

            {/* Luta pelo Elixir - Consolidação do Evento */}
            <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Trophy className="text-gaming-gold animate-pulse" size={18} />
                <h4 className="font-display font-black uppercase text-sm tracking-widest italic">Luta pelo Elixir — Consolidação</h4>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-white/50 underline uppercase font-black tracking-wider leading-relaxed">
                  Status de Inscrições dos Guerreiros:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Grupo A</span>
                    <span className="text-base font-black text-red-500">{members.filter(m => m.combatGroup === 'A').length}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Grupo B</span>
                    <span className="text-base font-black text-gaming-gold">{members.filter(m => m.combatGroup === 'B').length}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Grupo C</span>
                    <span className="text-base font-black text-blue-400">{members.filter(m => m.combatGroup === 'C').length}</span>
                  </div>
                </div>

                {/* Eligible participants waiting for validation */}
                <div className="mt-2 flex flex-col gap-1.5 text-[10px] font-bold uppercase text-white/70">
                  <p>Inscritos Totais: <span className="text-white font-extrabold">{members.filter(m => m.combatGroup !== undefined).length}</span></p>
                  <p>Aguardando XP (50): <span className="text-gaming-gold font-extrabold">{members.filter(m => m.combatGroup !== undefined && m.combatGroupClaimed !== true).length}</span></p>
                </div>

                <button
                  disabled={settling}
                  onClick={async () => {
                    if (confirm("Confirmar a conclusão da Luta pelo Elixir e conceder 50 XP para todos os guerreiros inscritos nas Unidades de Combate?")) {
                      setSettling(true);
                      try {
                        const rewarded = await distributeElixirXP();
                        alert(`Sucesso! Conclusão do Luta pelo Elixir confirmada e 50 XP distribuídos para ${rewarded} guerreiros participantes.`);
                      } catch (err) {
                        console.error(err);
                        alert("Erro ao consolidar evento.");
                      } finally {
                        setSettling(false);
                      }
                    }
                  }}
                  className="w-full mt-2 py-3 bg-gaming-gold hover:bg-white text-black hover:text-black rounded-xl font-display font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_0_20px_rgba(251,191,36,0.15)] disabled:opacity-50 cursor-pointer"
                >
                  {settling ? "Processando..." : "Confirmar Conclusão & Conceder 50 XP"}
                </button>
              </div>
            </div>

           <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-6 flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase text-white/20 tracking-widest">Aviso Importante</h4>
              <p className="text-[10px] text-white/50 leading-relaxed font-bold uppercase italic">
                Ao expulsar um integrante, seu acesso à Supremacia será revogado imediatamente. Transferir a liderança é uma ação irreversível.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
