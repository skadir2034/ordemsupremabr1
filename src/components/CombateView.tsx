import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Target, 
  Shield, 
  Zap, 
  Lock, 
  Clock, 
  Compass, 
  Trophy, 
  Calendar, 
  ShieldCheck, 
  Backpack, 
  Users 
} from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';

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

export function CombateView() {
  const { isGuest, myMember, members, updateMemberData, isEcoMode, completeMission } = useClan();
  const [loading, setLoading] = useState(false);

  // Dynamic Brasília Time zone helpers
  const getBrasiliaTime = (): Date => {
    try {
      const tzString = 'America/Sao_Paulo';
      const localDateStr = new Date().toLocaleString('en-US', { timeZone: tzString });
      return new Date(localDateStr);
    } catch (err) {
      const utc = new Date();
      return new Date(utc.getTime() - (3 * 60 * 60 * 1000));
    }
  };

  const getBrasiliaTodayAtTime = (hour: number, minute: number): Date => {
    const now = new Date();
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const parts = formatter.formatToParts(now);
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      return new Date(`${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-03:00`);
    } catch (err) {
      const d = new Date();
      d.setHours(hour, minute, 0, 0);
      return d;
    }
  };

  const isEventActiveToday = (eventId: 'elixir' | 'rato'): { active: boolean; label: string; daysStr: string } => {
    const date = getBrasiliaTime();
    const day = date.getDay(); // 0 = Domingo, 1 = Segunda ... 6 = Sábado
    
    if (eventId === 'elixir') {
      return {
        active: false,
        label: 'ENCERRADO 🛑',
        daysStr: 'Temporada Finalizada, aguardando reabertura oficial'
      };
    } else {
      // Mondays, Wednesdays, Fridays, Sundays (Segunda, Quarta, Sexta, Domingo)
      const active = day === 1 || day === 3 || day === 5 || day === 0;
      return {
        active,
        label: active ? 'ABERTO HOJE' : 'INDISPONÍVEL HOJE 🔒',
        daysStr: 'Segundas, Quartas, Sextas e Domingos'
      };
    }
  };

  // Countdown support for Brasília Time (GMT-3)
  const calculateTimeLeft = () => {
    const activeInfo = isEventActiveToday('elixir');
    if (!activeInfo.active) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
    }
    const targetDate = getBrasiliaTodayAtTime(23, 0); // Active until 23:00 Brasília time
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

  // Complete Espírito Engajado mission instantly upon opening events page with a completed or pending registration
  useEffect(() => {
    const hasEventParticipation = myMember?.combatGroup || 
      myMember?.completedMissions?.includes('caca_rato_pending') || 
      myMember?.completedMissions?.includes('caca_rato_confirm');
      
    if (hasEventParticipation && !myMember?.completedMissions?.includes('open_missions_and_event')) {
      completeMission('open_missions_and_event', 25);
    }
  }, [myMember?.combatGroup, myMember?.completedMissions, completeMission]);

  // Get active combat group
  const activeGroup = myMember?.combatGroup;

  const [selectedEvent, setSelectedEvent] = useState<'elixir' | 'rato' | null>(null);

  const [ratoCountdown, setRatoCountdown] = useState({ status: '', text: '', isActive: false });

  useEffect(() => {
    const updateRatoStatus = () => {
      const activeInfo = isEventActiveToday('rato');
      if (!activeInfo.active) {
        setRatoCountdown({
          status: "🔒 INDISPONÍVEL HOJE",
          text: `EVENTO BLOQUEADO • Abre: Segundas, Quartas, Sextas e Domingos`,
          isActive: false
        });
        return;
      }

      const now = new Date();
      const targetTime = getBrasiliaTodayAtTime(22, 0).getTime();
      const nowTime = now.getTime();
      
      if (nowTime < targetTime) {
        const diff = targetTime - nowTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setRatoCountdown({
          status: "AGUARDANDO INÍCIO",
          text: `INICIA HOJE ÀS 22:00 • Faltam ${hours}h ${minutes}m ${seconds}s`,
          isActive: false
        });
      } else {
        const endOfDay = targetTime + (2 * 60 * 60 * 1000); // 2 hours duration
        const diff = endOfDay - nowTime;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setRatoCountdown({
            status: "EVENTO ATIVO ⚔️",
            text: `RATO DISPONÍVEL • Restam: ${hours}h ${minutes}m ${seconds}s`,
            isActive: true
          });
        } else {
          setRatoCountdown({
            status: "FINALIZADO HOJE ✅",
            text: `AGUARDANDO O PRÓXIMO DIA DE INCURSÃO`,
            isActive: false
          });
        }
      }
    };

    updateRatoStatus();
    const interval = setInterval(updateRatoStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterGroup = async (group: 'A' | 'B' | 'C') => {
    if (isGuest) {
      alert("Contas de convidado temporárias não podem participar de nenhum evento no modo combate!");
      return;
    }
    if (!myMember) return;

    if (!isEventActiveToday('elixir').active) {
      alert("Este torneio está oficialmente encerrado nesta temporada da Aliança! Novas inscrições e alistamentos suspensos até a reabertura oficial.");
      return;
    }

    if (myMember.combatGroup === group) {
      alert("Você já está alistado neste regimento de combate!");
      return;
    }

    const LIMITS = {
      'A': 7,
      'B': 7,
      'C': 6
    };

    const currentCount = members.filter(m => m.combatGroup === group).length;
    if (currentCount >= LIMITS[group]) {
      alert(`O Regimento ${group} de Combate está lotado! Limite máximo de ${LIMITS[group]} vagas atingido.`);
      return;
    }

    setLoading(true);
    try {
      const hasClaimedElixir = myMember.completedMissions?.includes('elixir_confirm');
      if (hasClaimedElixir) {
        alert("Sua participação na Luta pelo Elixir já foi liberada e creditada por um líder!");
        return;
      }
      const isPending = myMember.completedMissions?.includes('elixir_pending');
      let newCompleted = myMember.completedMissions || [];
      if (!isPending) {
        newCompleted = [...newCompleted, 'elixir_pending'];
      }

      await updateMemberData({
        combatGroup: group,
        combatGroupClaimed: false,
        completedMissions: newCompleted
      });
      playConnectionSound(true);
      alert(`Alistamento confirmado no Regimento ${group}! A sua participação foi registrada e aguarda confirmação final do Líder Supremo no Painel de Liderança para liberar seus 50 XP.`);
    } catch (err) {
      console.error(err);
      alert("Falha ao registrar regimento de combate.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRato = async () => {
    if (isGuest) {
      alert("Contas de convidado temporárias não podem participar de nenhum evento no modo combate!");
      return;
    }
    if (!myMember) return;

    if (!isEventActiveToday('rato').active) {
      alert("Este evento está indisponível hoje! Inscrições e confirmações fechadas até o próximo dia correto (Segundas, Quartas, Sextas e Domingos).");
      return;
    }

    const hasClaimedRato = myMember?.completedMissions?.includes('caca_rato_confirm');
    if (hasClaimedRato) {
      alert("Você já participou da Caça ao Rato e seus 25 XP já foram creditados!");
      return;
    }

    const isPending = myMember?.completedMissions?.includes('caca_rato_pending');
    if (isPending) {
      alert("Você já está Ativo no evento Caça ao Rato (inicia às 22:00h nos dias de incursão)! Seu status é participante ativo, aguardando apenas o término do evento para que o Líder distribua as recompensas.");
      return;
    }

    setLoading(true);
    try {
      const newCompleted = [...(myMember.completedMissions || []), 'caca_rato_pending'];
      
      await updateMemberData({
        completedMissions: newCompleted
      });
      playConnectionSound(true);
      alert("Inscrição na Caça ao Rato realizada com sucesso! Você agora está ATIVO no evento (inicia às 22:00h nos dias de incursão). O bônus de 25 XP será enviado pelo Líder Supremo ao final do evento.");
    } catch (err) {
      console.error(err);
      alert("Erro ao confirmar presença.");
    } finally {
      setLoading(false);
    }
  };

  const MAX_BAITS_TARGET = 100;

  // Find inventory from completedMissions
  const getBaitInventory = (): number => {
    const record = myMember?.completedMissions?.find((s: string) => s.startsWith('ratbait_inv_'));
    if (record) {
      const val = parseInt(record.replace('ratbait_inv_', ''), 10);
      return isNaN(val) ? 0 : val;
    }
    // Starter amount if not set
    return 20;
  };

  // Find member-specific donated count from completedMissions
  const getMemberDonated = (member: any): number => {
    const record = member?.completedMissions?.find((s: string) => s.startsWith('ratbait_donated_'));
    if (record) {
      const val = parseInt(record.replace('ratbait_donated_', ''), 10);
      return isNaN(val) ? 0 : val;
    }
    return 0;
  };

  // Total baits donated by the entire clan (reactive!)
  const totalDonatedBaits = members.reduce((acc, m) => acc + getMemberDonated(m), 0);

  // Multiplier formula: ranges from x1.0 up to x5.0 at MAX_BAITS_TARGET (100)
  const calculateDamageMultiplier = () => {
    if (totalDonatedBaits >= MAX_BAITS_TARGET) return 5.0;
    const mult = 1.0 + (4.0 * (totalDonatedBaits / MAX_BAITS_TARGET));
    return parseFloat(mult.toFixed(2));
  };

  const damageMultiplier = calculateDamageMultiplier();

  const handleDonateBait = async (amount: number) => {
    if (isGuest) {
      alert("Contas de convidado temporárias não podem fazer doações de isca no modo combate!");
      return;
    }
    if (!myMember) return;

    const currentInv = getBaitInventory();
    if (currentInv <= 0) {
      alert("Você não possui Iscas de Rato disponíveis! Utilize a bancada de trabalho rúnica logo abaixo para fabricar mais.");
      return;
    }

    const actualAmount = Math.min(amount, currentInv);
    const totalDonated = totalDonatedBaits;
    if (totalDonated >= MAX_BAITS_TARGET) {
      alert("⚠️ AVISO CRÍTICO: A Armadilha de Rato já está no nível máximo (100 iscas com multiplicador x5)! Não desperdice seus recursos e guarde suas iscas para a próxima invasão!");
      return;
    }

    const remainingSpace = MAX_BAITS_TARGET - totalDonated;
    const actualAmountToDonate = Math.min(actualAmount, remainingSpace);

    if (actualAmountToDonate <= 0) {
      alert("A Armadilha já está completamente carregada no nível máximo!");
      return;
    }

    setLoading(true);
    try {
      const currentDonated = getMemberDonated(myMember);
      const newInv = currentInv - actualAmountToDonate;
      const newDonated = currentDonated + actualAmountToDonate;

      // Filter out old records to avoid duplicate array items
      let cleanMissions = (myMember.completedMissions || []).filter(
        (s: string) => !s.startsWith('ratbait_inv_') && !s.startsWith('ratbait_donated_')
      );

      // Push updated records
      cleanMissions.push(`ratbait_inv_${newInv}`);
      cleanMissions.push(`ratbait_donated_${newDonated}`);

      await updateMemberData({
        completedMissions: cleanMissions
      });

      playConnectionSound(true);
      alert(`Doação executada! Você depositou ${actualAmountToDonate} Iscas de Rato na Armadilha da Aliança. Dano de aliança amplificado!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao depositar iscas.");
    } finally {
      setLoading(false);
    }
  };

  const handleCraftBaits = async () => {
    if (isGuest) {
      alert("Contas de convidado temporárias não podem fabricar iscas!");
      return;
    }
    if (!myMember) return;

    setLoading(true);
    try {
      const currentInv = getBaitInventory();
      const newInv = currentInv + 10;

      let cleanMissions = (myMember.completedMissions || []).filter(
        (s: string) => !s.startsWith('ratbait_inv_')
      );
      cleanMissions.push(`ratbait_inv_${newInv}`);

      await updateMemberData({
        completedMissions: cleanMissions
      });
      alert("Você fabricou +10 Iscas de Rato rúnicas adicionais com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Falha ao fabricar iscas.");
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
  const themeBgClass = isGroupA ? 'bg-red-950/20' : isGroupB ? 'bg-amber-950/20' : 'bg-blue-920/20';
  const themeAccentBg = isGroupA ? 'bg-red-500' : isGroupB ? 'bg-gaming-gold' : 'bg-blue-400';

  return (
    <div className="flex flex-col gap-5 p-3 sm:p-4 md:p-6 max-w-6xl mx-auto w-full pb-20 selection:bg-gaming-gold selection:text-black font-sans">
      {/* War Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gaming-gold animate-pulse shrink-0" />
            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-[0.2em] font-mono">Central de Torneios & Eventos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black uppercase italic tracking-tight text-white leading-none">
            TEMPORADA DE <span className="text-shadow-gold text-gaming-gold">GLÓRIA</span>
          </h2>
        </div>
        
        {/* Active Event Banner & Status Indicator */}
        <div className="bg-zinc-950/80 border border-white/5 px-4 py-2 rounded-xl flex flex-col items-center justify-center shrink-0 sm:min-w-[225px] shadow-md">
          <span className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Status Coletivo</span>
          <span className="text-[11px] font-mono font-black text-zinc-450 mt-0.5">⚔️ CICLO ATIVO DE GUERRA</span>
          
          <div className="mt-1 pb-0.5 w-full flex flex-col items-center">
            {isEventActiveToday('rato').active ? (
              <span className="text-[8.5px] font-black uppercase text-emerald-400 tracking-wider font-mono animate-pulse flex items-center gap-1">
                • 🐀 CAÇA AO RATO: ATIVO HOJE! •
              </span>
            ) : (
              <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider font-mono flex items-center gap-1">
                • 🔒 CAÇA AO RATO: FECHADO HOJE •
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SELETOR DE EVENTOS RÚNICOS - ABAS SELETORAS MODERNAS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950/30 border border-white/5 p-2 rounded-2xl text-left">
        <div className="flex bg-zinc-900/50 border border-white/5 p-1 rounded-sm w-full sm:max-w-sm">
          <button
            onClick={() => setSelectedEvent(selectedEvent === 'elixir' ? null : 'elixir')}
            className={`flex-1 py-1.5 px-3 rounded text-[10px] sm:text-[11px] font-display font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedEvent === 'elixir'
                ? 'bg-red-500 text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy size={11} />
            Luta pelo Elixir
          </button>
          <button
            onClick={() => setSelectedEvent(selectedEvent === 'rato' ? null : 'rato')}
            className={`flex-1 py-1.5 px-3 rounded text-[10px] sm:text-[11px] font-display font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedEvent === 'rato'
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass size={11} />
            Caça ao Rato
            {isEventActiveToday('rato').active && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {selectedEvent ? (
          <button
            onClick={() => setSelectedEvent(null)}
            className="text-[9px] uppercase font-bold text-gaming-gold tracking-wider bg-gaming-gold/10 hover:bg-gaming-gold/20 px-3 py-1 cursor-pointer rounded border border-gaming-gold/25 transition-all"
          >
            ↩ Voltar à Lista de Eventos
          </button>
        ) : (
          <div className="text-[9px] uppercase font-bold text-zinc-550 tracking-wider bg-black/20 px-2.5 py-1 rounded border border-zinc-850">
            Selecione um evento abaixo para abrir detalhes
          </div>
        )}
      </div>

      {/* PAINEL CENTRAL DE TORNEIOS DA ALIANÇA */}
      {selectedEvent === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {/* Collapsed Caça ao Rato */}
          {(() => {
            const state = isEventActiveToday('rato');
            return (
              <motion.div 
                whileHover={{ scale: 1.012 }}
                onClick={() => setSelectedEvent('rato')}
                className="cursor-pointer transition-all rounded-2xl p-4.5 bg-zinc-950/20 border border-white/5 hover:border-amber-500/35 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                      <Compass size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-100 flex items-center gap-1.5">
                        Caça ao Rato
                      </h3>
                      <span className="text-[7.5px] uppercase font-bold text-zinc-500 tracking-wider block">Incursão e Controle de Pragas</span>
                    </div>
                  </div>
                  <span className={`text-[7.5px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded ${state.active ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/15 animate-pulse' : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800'}`}>
                    {state.active ? 'Aberto Hoje 🟢' : 'Fechado Hoje 🔒'}
                  </span>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[8px] uppercase tracking-wider font-bold">
                  <span className="text-amber-500/90 hover:text-amber-400">Expandir & Ver Detalhes →</span>
                  <span className="text-zinc-500 font-mono">Bônus: +25 XP</span>
                </div>
              </motion.div>
            );
          })()}

          {/* Collapsed Luta pelo Elixir */}
          {(() => {
            const state = isEventActiveToday('elixir');
            return (
              <motion.div 
                whileHover={{ scale: 1.012 }}
                onClick={() => setSelectedEvent('elixir')}
                className="cursor-pointer transition-all rounded-2xl p-4.5 bg-zinc-950/20 border border-white/5 hover:border-red-500/35 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-100">
                        Luta pelo Elixir
                      </h3>
                      <span className="text-[7.5px] uppercase font-bold text-zinc-500 tracking-wider block">Torneio de Clãs de Alto Nível</span>
                    </div>
                  </div>
                  <span className="text-[7.5px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900/50 text-red-500/70 border border-zinc-800">
                    Encerrado 🛑
                  </span>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[8px] uppercase tracking-wider font-bold">
                  <span className="text-red-400/90 hover:text-red-300">Expandir & Ver Detalhes →</span>
                  <span className="text-zinc-500 font-mono">Bônus: +50 XP</span>
                </div>
              </motion.div>
            );
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 text-left">
          {/* Opened Event Card displaying full details, descriptions, and registers */}
          {selectedEvent === 'rato' && (() => {
            const state = isEventActiveToday('rato');
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border-2 border-amber-500/40 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl relative"
              >
                {/* Close Button top-right */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 text-[9.5px] uppercase font-bold text-zinc-400 hover:text-white bg-black/40 border border-white/5 px-2.5 py-1 rounded-md cursor-pointer transition-all shrink-0 z-30"
                >
                  ✕ Fechar Detalhes
                </button>

                <div className="absolute top-0 left-0 bg-amber-500 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-br-2xl">
                  {state.active ? 'INÍCIO: HOJE ÀS 22:00H • +25 XP' : '🔒 INDISPONÍVEL HOJE'}
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-amber-500/15 border-amber-500/20 text-amber-400">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                        Caça ao Rato
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[7.5px] uppercase font-bold text-zinc-500 tracking-wider">Incursão e Controle de Pragas</span>
                        {state.active ? (
                          <span className={`text-[8px] font-black uppercase tracking-wider w-fit px-1.5 py-0.5 rounded mt-1 bg-gaming-gold/20 text-gaming-gold border border-gaming-gold/30 animate-pulse`}>
                            🟢 INCURSÃO HOJE ÀS 22:00H!
                          </span>
                        ) : (
                          <span className={`text-[8px] font-bold uppercase tracking-wider w-fit px-1.5 py-0.5 rounded mt-1 bg-zinc-900/50 text-zinc-500 border border-zinc-800`}>
                            🔴 INDISPONÍVEL HOJE (Abre às 22:00 nos dias de incursão)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-300 font-bold uppercase italic mb-4 max-w-4xl">
                    Invasão especial para abate rápido e coleta de recompensas em bônus individuais na Alcatéia. Use iscas de rato para ativar bônus!
                  </p>
                </div>
              </motion.div>
            );
          })()}

          {selectedEvent === 'elixir' && (() => {
            const state = isEventActiveToday('elixir');
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border-2 border-red-500/40 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl relative"
              >
                {/* Close Button top-right */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 text-[9.5px] uppercase font-bold text-zinc-400 hover:text-white bg-black/40 border border-white/5 px-2.5 py-1 rounded-md cursor-pointer transition-all shrink-0 z-30"
                >
                  ✕ Fechar Detalhes
                </button>

                <div className="absolute top-0 left-0 bg-red-500 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-br-2xl">
                  OBRIGATÓRIO • RECOMPENSA: 50 XP
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-red-500/15 border-red-500/30 text-red-400">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                        Luta pelo Elixir
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[7.5px] uppercase font-bold text-zinc-500 tracking-wider">Torneio de Clãs de Alto Nível</span>
                        <span className="text-[8px] font-black uppercase tracking-wider w-fit px-1.5 py-0.5 rounded mt-1 bg-red-500/15 text-red-400 border border-red-500/20">
                          🛑 CONFRONTO REGISTRADO COLETIVAMENTE
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-300 font-bold uppercase italic mb-4 max-w-4xl">
                    O principal confronto estratégico tático por depósitos de Elixir da aliança. O comparecimento é estritamente compulsório para todos os guerreiros listados.
                  </p>
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}

      {/* COMUNICADO OFICIAL DE ADIAMENTO - ONLY FOR ELIXIR */}
      <AnimatePresence>
        {selectedEvent === 'elixir' && (
          <motion.div
            initial={{ scale: 0.98, opacity: 0, height: 0 }}
            animate={{ scale: 1, opacity: 1, height: 'auto' }}
            exit={{ scale: 0.98, opacity: 0, height: 0 }}
            className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.05)] flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-1 bg-amber-600/80 text-[7px] font-black uppercase text-black tracking-widest rounded-bl-xl font-mono animate-pulse">
              DIRETÓRIO
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Calendar className="text-amber-400 animate-pulse" size={20} />
            </div>
            <div className="flex flex-col gap-0.5 w-full text-center sm:text-left">
              <span className="text-[8px] uppercase font-black tracking-widest text-amber-500 font-mono">AVISO DE ADIAMENTO E CALENDÁRIO:</span>
              <p className="text-[11px] text-zinc-300 leading-normal font-bold uppercase italic">
                "ATENÇÃO GUERREIROS: O evento Luta pelo Elixir foi ADIADO por tempo indeterminado. Fiquem de prontidão para novas atualizações da liderança!"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedEvent === 'elixir' && (
          <motion.div
            key="elixir-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* A) OPERATIONAL PROTOCOLS SECTION */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-5 md:p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-zinc-800/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-2.5 border-b border-zinc-800/40 pb-3">
                  <Compass className="text-gaming-gold" size={20} />
                  <div>
                    <h3 className="font-display font-black uppercase text-base text-white tracking-wide">PLANEJAMENTO TÁTICO & PROTOCOLO</h3>
                    <p className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest leading-none">
                      LIGAÇÃO DIRECIONAL E LOGÍSTICA DE COMBATE
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-white/80 leading-relaxed font-bold uppercase italic border-l-2 border-gaming-gold/40 pl-3">
                  "Para garantir a vitória da nossa aliança, precisamos de <strong className="text-gaming-gold font-extrabold text-shadow-gold animate-pulse">disciplina, coordenação e foco nos objetivos corretos</strong>. Não basta ter poder; é preciso inteligência."
                </p>

                <div className="flex flex-col gap-4 mt-1">
                  <h4 className="text-[10px] uppercase font-black text-gaming-gold tracking-widest flex items-center gap-1.5 border-b border-zinc-800/40 pb-1.5">
                    <Zap size={12} className="text-gaming-gold" /> FASES DO CONFRONTO (CRITICAL INFO)
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="border border-indigo-950/60 bg-indigo-950/10 rounded-2xl p-3.5 border-l-4 border-l-indigo-500 transition-all hover:bg-indigo-950/15">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center font-mono font-black text-[10px] text-indigo-300">1</span>
                        <h5 className="text-[11px] font-black uppercase text-indigo-200 tracking-wider">Preparação (Antes do Evento)</h5>
                      </div>
                      <p className="text-[10px] text-white/70 uppercase leading-relaxed font-bold font-mono">
                        • <strong className="text-indigo-400">Escala de Guerra:</strong> O R5/R4 definirá os 20 membros do deploy e reservas.<br />
                        • <strong className="text-indigo-400">Logística:</strong> Todos com exércitos curados e aceleradores prontos.
                      </p>
                    </div>

                    <div className="border border-cyan-950/60 bg-cyan-950/10 rounded-2xl p-3.5 border-l-4 border-l-cyan-400 transition-all hover:bg-cyan-950/15">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-400/20 flex items-center justify-center font-mono font-black text-[10px] text-cyan-200">2</span>
                        <h5 className="text-[11px] font-black uppercase text-cyan-300 tracking-wider">Fase Inicial (0 a 10 min) • "Corrida pelo Ouro"</h5>
                      </div>
                      <p className="text-[10px] text-white/70 uppercase leading-relaxed font-bold font-mono">
                        • <strong className="text-cyan-400">Objetivo Primário:</strong> Capturar Oficinas de Alquimia.<br />
                        • <strong className="text-cyan-400">Tática:</strong> Evite batalhas soltas. Segurar as duas Oficinas gera bônus imediato.
                      </p>
                    </div>

                    <div className="border border-amber-950/60 bg-amber-950/10 rounded-2xl p-3.5 border-l-4 border-l-amber-500 transition-all hover:bg-amber-950/15">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center font-mono font-black text-[10px] text-amber-300">3</span>
                        <h5 className="text-[11px] font-black uppercase text-amber-300 tracking-wider">Fase Intermediária (10 a 13 min) • "Verdade"</h5>
                      </div>
                      <p className="text-[10px] text-white/70 uppercase leading-relaxed font-bold font-mono">
                        • <strong className="text-amber-400">Castelo do Elixir:</strong> Abre exatamente aos 10 minutos.<br />
                        • <strong className="text-amber-400">Tática de Domínio:</strong> Toda a guilda deve marchar junta ao centro.<br />
                        • <strong className="text-amber-400">Altificação:</strong> Ocupe os Altares para ativar bônus de dano de tropa.
                      </p>
                    </div>

                    <div className="border border-red-950/60 bg-red-950/10 rounded-2xl p-3.5 border-l-4 border-l-red-500 transition-all hover:bg-red-950/15">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center font-mono font-black text-[10px] text-red-350">4</span>
                        <h5 className="text-[11px] font-black uppercase text-red-300 tracking-wider">Fase Final (13 a 30 min) • "Defesa Crucial"</h5>
                      </div>
                      <p className="text-[10px] text-white/70 uppercase leading-relaxed font-bold font-mono">
                        • <strong className="text-red-400">Forte e Kits:</strong> Enviem tropas rápidas para coletar ervas e manter o cerco.<br />
                        • <strong className="text-red-400">Contenção Crítica:</strong> Garanta que o inimigo não colete os Kits Doutores!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/30 border border-zinc-800/60 p-4 rounded-xl flex flex-col gap-3">
                  <h4 className="text-[10px] uppercase font-black text-gaming-gold tracking-widest flex items-center gap-1.5 font-mono">
                    <Target size={12} className="text-gaming-gold animate-pulse" /> DIRETRIZES RÁPIDAS DE DISPARO
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[9px] uppercase font-bold text-white/70">
                    <div className="flex gap-2">
                      <span className="text-gaming-gold font-extrabold font-mono">01.</span>
                      <span>Ataques Isolados Proibidos: O Ataque coordenado (rally) é a única ferramenta.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gaming-gold font-extrabold font-mono">02.</span>
                      <span>Defesa de Tenda: Segure uma Tenda de Cura para repor guerreiros vivos.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gaming-gold font-extrabold font-mono">03.</span>
                      <span>Portais: Marchas usando o Portal reduzem o deslocamento em 80%.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gaming-gold font-extrabold font-mono">04.</span>
                      <span>Cadeia de Voz: Obedeça as ordens do R5/R4 no Discord em tempo real.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* B) INTERACTIVE SECTION */}
            <div className="flex flex-col gap-6">
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                {!isEventActiveToday('elixir').active && (
                  <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center">
                    <Lock className="text-zinc-600 mb-3 animate-pulse" size={40} />
                    <h4 className="text-sm font-display font-black uppercase text-zinc-400 tracking-wider mb-2">EVENTO OFICIALMENTE ENCERRADO</h4>
                    <p className="text-[10px] uppercase font-bold text-white/50 max-w-xs leading-relaxed mb-4">
                      A temporada de batalhas táticas por Elixir foi encerrada por diretrizes oficiais da Liderança da Aliança.
                    </p>
                    <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded-xl mb-4 max-w-xs">
                      <p className="text-[9px] text-red-500 uppercase font-black tracking-widest font-mono">
                        STATUS: AGUARDANDO NOVA TEMPORADA
                      </p>
                    </div>
                    <p className="text-[9px] text-zinc-500 uppercase font-bold max-w-xs leading-relaxed">
                      Novas inscrições suspensas temporariamente até reabertura oficial.
                    </p>
                  </div>
                )}
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
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-gaming-gold animate-pulse" size={20} />
                    <h3 className="font-display font-black uppercase text-sm tracking-widest text-white">RECRUTAMENTO OPERACIONAL</h3>
                  </div>
                  <span className="text-[10px] bg-zinc-850 border border-zinc-800 px-2 py-1 rounded-md text-zinc-400 font-mono font-bold">
                    VAGAS TOTAIS: <span className="text-white font-black">{groupA.length + groupB.length + groupC.length} / 20</span>
                  </span>
                </div>
                
                <p className="text-[10px] uppercase font-bold text-white/70 leading-relaxed">
                  Assuma seu posto regulamentar de combate. A escolha de seu regimento estratégico de deploy libera materiais táticos fechados. <span className="text-gaming-gold font-bold italic block mt-1">Ao registrar-se, você receberá 50 XP após a validação pós-evento e confirmação da batalha.</span>
                </p>

                {/* ALERTA DE ADIAMENTO */}
                <div className="bg-amber-950/25 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-md">
                  <span className="text-sm">⚠️</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">RECRUTAMENTO E ALISTAMENTO SUSPENSOS</span>
                    <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-wide leading-relaxed mt-0.5">
                      Os alistamentos de regimento estão congelados devido ao adiamento do Torneio do Elixir. Os guerreiros já inscritos continuam seguros na fila.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
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
                          <div className="flex flex-col">
                            <span className="text-xs uppercase font-black tracking-wider">Regimento A - Elite de Assalto</span>
                            <span className={`text-[9px] font-bold uppercase transition-colors ${7 - groupA.length <= 0 ? 'text-red-500 animate-pulse font-black' : 'text-zinc-400'}`}>
                              {7 - groupA.length <= 0 ? '🚫 Vagas Esgotadas' : `Slots Disponíveis: ${7 - groupA.length} de 7`}
                            </span>
                          </div>
                        </div>
                        {activeGroup === 'A' && (
                          <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest font-mono ${
                            myMember?.completedMissions?.includes('elixir_confirm')
                              ? 'bg-gaming-purple text-white'
                              : 'bg-orange-600 text-white animate-pulse'
                          }`}>
                            {myMember?.completedMissions?.includes('elixir_confirm') ? '✓ APROVADO' : '⏳ PENDENTE LÍDER'} (50 XP)
                          </span>
                        )}
                      </div>
                    </button>
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
                          <div className="flex flex-col">
                            <span className="text-xs uppercase font-black tracking-wider">Regimento B - Suporte e Buffs</span>
                            <span className={`text-[9px] font-bold uppercase transition-colors ${7 - groupB.length <= 0 ? 'text-red-500 animate-pulse font-black' : 'text-zinc-400'}`}>
                              {7 - groupB.length <= 0 ? '🚫 Vagas Esgotadas' : `Slots Disponíveis: ${7 - groupB.length} de 7`}
                            </span>
                          </div>
                        </div>
                        {activeGroup === 'B' && (
                          <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest font-mono ${
                            myMember?.completedMissions?.includes('elixir_confirm')
                              ? 'bg-gaming-purple text-white'
                              : 'bg-amber-500 text-black animate-pulse'
                          }`}>
                            {myMember?.completedMissions?.includes('elixir_confirm') ? '✓ APROVADO' : '⏳ PENDENTE LÍDER'} (50 XP)
                          </span>
                        )}
                      </div>
                    </button>
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
                          <div className="flex flex-col">
                            <span className="text-xs uppercase font-black tracking-wider">Regimento C - Logística e Coleta</span>
                            <span className={`text-[9px] font-bold uppercase transition-colors ${6 - groupC.length <= 0 ? 'text-red-500 animate-pulse font-black' : 'text-zinc-400'}`}>
                              {6 - groupC.length <= 0 ? '🚫 Vagas Esgotadas' : `Slots Disponíveis: ${6 - groupC.length} de 6`}
                            </span>
                          </div>
                        </div>
                        {activeGroup === 'C' && (
                          <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest font-mono ${
                            myMember?.completedMissions?.includes('elixir_confirm')
                              ? 'bg-gaming-purple text-white'
                              : 'bg-blue-600 text-white animate-pulse'
                          }`}>
                            {myMember?.completedMissions?.includes('elixir_confirm') ? '✓ APROVADO' : '⏳ PENDENTE LÍDER'} (50 XP)
                          </span>
                        )}
                      </div>
                    </button>
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
          </motion.div>
        )}

        {selectedEvent === 'rato' && (
          <motion.div
            key="rato-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* INVASÃO ESPECIAL: EVENT DETAILS & INFORMATION */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-5 md:p-6 flex flex-col gap-5 shadow-xl relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-linear-to-b from-zinc-800/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-2.5 border-b border-zinc-800/40 pb-3">
                  <Compass className="text-amber-500" size={20} />
                  <div>
                    <h3 className="font-display font-black uppercase text-base text-white tracking-wide">CAÇA AO RATO: CONTROLE DE PRAGAS</h3>
                    <p className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest leading-none mt-0.5">
                      DIRETRIZ DE INCURSÃO OPCIONAL & RECOMPENSA DE SEGUNDO SARGENTO/GUERREIROS
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-bold uppercase italic border-l-2 border-amber-500/40 pl-3">
                  "O controle de pragas garante o fluxo contínuo de suprimentos em nossa Alcatéia. A caçada de roedores é um dever sagrado militar de combate da guilda!"
                </p>

                {/* DYNAMIC TIMER BADGE FOR CAÇA AO RATO */}
                <div className="border border-gaming-gold/30 bg-purple-950/20 rounded-2xl p-5 border-l-4 border-l-gaming-gold shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                  <div>
                    <span className="text-[9px] uppercase font-black text-gaming-gold tracking-widest font-mono">STATUS DO CICLO DE ATIVIDADE</span>
                    <h4 className="text-sm font-display font-black uppercase text-purple-200 tracking-wide mt-0.5">{ratoCountdown.status}</h4>
                    <p className="text-xs text-zinc-200 font-extrabold uppercase font-mono tracking-wide mt-1 animate-pulse">
                      ⏳ {ratoCountdown.text}
                    </p>
                  </div>
                  <div className="bg-black/30 border border-white/5 py-1.5 px-3.5 rounded-full font-mono text-[9px] uppercase font-black text-white/60 shrink-0">
                    CONTAGEM PERMANENTE RECORRENTE
                  </div>
                </div>

                {/* INFO BLOCKS FOR BAITS AND 22:00 INVOCATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                  <div className="border border-red-950/65 bg-red-950/15 rounded-2xl p-4 border-l-4 border-l-red-500">
                    <h5 className="text-xs font-black uppercase text-red-300 tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-red-400" />
                      Invocação do Rato às 22:00
                    </h5>
                    <p className="text-[10px] text-zinc-300 uppercase leading-relaxed font-bold font-mono mt-1">
                      O Rato Supremo da Alcatéia Suprema <strong className="text-white">será invocado impreterivelmente às 22:00 horas nos dias de incursão</strong> (Horário de Brasília) — Segundas, Quartas, Sextas e Domingos. Esteja totalmente online com seus combatentes sincronizados e preparados a este horário para o abate rápido em equipe.
                    </p>
                  </div>

                  <div className="border border-amber-950/65 bg-amber-950/15 rounded-2xl p-4 border-l-4 border-l-amber-500">
                    <h5 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-400" />
                      Funcionamento das Iscas
                    </h5>
                    <p className="text-[10px] text-zinc-300 uppercase leading-relaxed font-bold font-mono mt-1">
                      Suas <strong className="text-white">Iscas de Rato</strong> são essenciais para erguer as armadilhas. Coletando e confirmando presença na varredura, ativamos o multiplicador de dano militar do clã! Este item aumenta massivamente o multiplicador da aliança, elevando o dano líquido total contra chefes e nas raids de guilda.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1e1f22]/40 border border-white/5 rounded-2xl p-4 flex items-start gap-3 mt-1">
                  <span className="text-lg">🔥</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider font-mono">DINÂMICA DE PROGRESSO ATUALIZADA</span>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide leading-relaxed mt-0.5">
                      Como a totalidade do clã ativamente participa do mutirão, o limite máximo do multiplicador é alcançado extremamente rápido de forma instantânea. Logo, removemos os botões individuais de depósitos manuais repetitivos: sua contribuição e bônus integral agora são garantidos ao clicar em confirmar sua presença no painel lateral!
                    </p>
                  </div>
                </div>

                <div className="bg-gaming-purple/10 border border-gaming-purple/20 rounded-2xl p-4 flex items-start gap-3 mt-1">
                  <span className="text-lg">💰</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase text-gaming-gold tracking-wider font-mono">BÔNUS DE CONFIRMAÇÃO</span>
                    <p className="text-[10.5px] text-zinc-300 font-bold uppercase tracking-wide leading-relaxed mt-0.5 animate-pulse">
                      Garante +25 XP direto na guilda após aprovação dos oficiais. Cadastre sua presença ao lado para entrar na lista de convocação!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PAINEL DE INSCRIÇÃO DA CAÇADA & CONFIRMADOS */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 text-left">
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden font-sans">
                {!isEventActiveToday('rato').active && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center">
                    <Lock className="text-zinc-500 mb-3 animate-pulse" size={40} />
                    <h4 className="text-sm font-display font-black uppercase text-zinc-400 tracking-wider mb-2">EVENTO BLOQUEADO HOJE</h4>
                    <p className="text-[10px] uppercase font-bold text-white/50 max-w-xs leading-relaxed mb-4">
                      O cronograma oficial da Aliança reserva este evento apenas para os dias designados.
                    </p>
                    <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-xl mb-4 max-w-xs">
                      <p className="text-[9px] text-amber-500 uppercase font-black tracking-widest font-mono">
                        HOJE CORRESPONDE A DIA DE OUTRAS MISSÕES
                      </p>
                    </div>
                    <p className="text-[9px] text-zinc-500 uppercase font-bold max-w-xs leading-relaxed">
                      Abertura automática às Segundas, Quartas, Sextas e Domingos às 23h!
                    </p>
                  </div>
                )}
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
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-amber-500 animate-pulse" size={20} />
                    <h3 className="font-display font-black uppercase text-xs sm:text-sm tracking-widest text-white">REIVINDICAR PRESENÇA</h3>
                  </div>
                </div>

                <p className="text-[10.5px] uppercase font-bold text-white/70 leading-relaxed">
                  Confirme sua presença voluntária no mutirão de combate às pragas da Alcatéia Suprema.
                </p>

                <button
                  disabled={loading || myMember?.completedMissions?.includes('caca_rato_confirm') || myMember?.completedMissions?.includes('caca_rato_pending')}
                  onClick={handleRegisterRato}
                  className={`w-full py-4 rounded-xl font-display font-black uppercase tracking-widest text-xs transition-all relative overflow-hidden cursor-pointer ${
                    myMember?.completedMissions?.includes('caca_rato_confirm')
                      ? 'bg-gaming-purple/15 border border-gaming-purple/35 text-gaming-gold cursor-not-allowed text-center'
                      : myMember?.completedMissions?.includes('caca_rato_pending')
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 cursor-not-allowed text-center animate-pulse'
                        : 'bg-amber-500 hover:bg-white text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] text-center'
                  }`}
                >
                  {myMember?.completedMissions?.includes('caca_rato_confirm')
                    ? "✓ XP COLETADO (RECOMPENSADO)"
                    : myMember?.completedMissions?.includes('caca_rato_pending')
                      ? "⚔️ INSCRIÇÃO ATIVA (AGUARDANDO FIM)"
                      : "INSCREVER-SE NA CAÇADA & REQUISITAR XP"}
                </button>
              </div>

              {/* LISTA DE INTEGRANTES CONFIRMADOS NA CAÇA AO RATO */}
              <div className="bg-zinc-900/10 border border-zinc-850 rounded-3xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">
                    GUERREIROS INTEGRANTES ({members.filter(m => m.completedMissions?.includes('caca_rato_pending') || m.completedMissions?.includes('caca_rato_confirm')).length})
                  </span>
                </div>
                
                {members.filter(m => m.completedMissions?.includes('caca_rato_pending') || m.completedMissions?.includes('caca_rato_confirm')).length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                    {members.filter(m => m.completedMissions?.includes('caca_rato_pending') || m.completedMissions?.includes('caca_rato_confirm')).map(m => {
                      const isApproved = m.completedMissions?.includes('caca_rato_confirm');
                      return (
                        <div key={m.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                          <span className="text-[11px] font-extrabold uppercase text-white tracking-wide truncate max-w-[130px]">{m.name}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isApproved 
                              ? 'bg-gaming-gold/15 text-gaming-gold border border-gaming-gold/25' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          }`}>
                            {isApproved ? 'XP ENTREGUE' : 'ATIVO NO EVENTO'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[9px] uppercase font-bold text-white/20 italic text-center py-4">Nenhum guerreiro confirmado ainda. Seja o primeiro!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {selectedEvent === null && (
          <motion.div
            key="empty-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="border border-white/5 bg-zinc-950/20 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4 py-12 max-w-lg mx-auto shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-gaming-gold/10 flex items-center justify-center border border-gaming-gold/20 text-gaming-gold animate-bounce">
              <Compass size={24} />
            </div>
            <div>
              <h4 className="text-sm font-display font-black uppercase tracking-wider text-white">OPERAÇÕES TÁTICAS DE GUERRA</h4>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed mt-1 font-bold italic">
                Selecione um dos eventos ou torneios listados acima para visualizar as diretrizes táticas oficiais, regras, alistamentos e garantir sua premiação de XP!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
