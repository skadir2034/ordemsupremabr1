import React, { useState, useEffect } from 'react';
import { Trophy, Sword, Clock } from 'lucide-react';

export function GuerraSvNotice() {
  const targetSat = "2026-05-30T03:00:00Z";
  const targetSun = "2026-05-31T03:00:00Z";

  const calculateTime = (targetStr: string) => {
    const target = new Date(targetStr).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, completed: false };
  };

  const [timeLeftSat, setTimeLeftSat] = useState(calculateTime(targetSat));
  const [timeLeftSun, setTimeLeftSun] = useState(calculateTime(targetSun));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSat(calculateTime(targetSat));
      setTimeLeftSun(calculateTime(targetSun));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 sm:p-5 bg-gaming-card/40 border border-zinc-800 rounded-2xl relative overflow-hidden flex flex-col gap-4 text-left shadow-lg">
      {/* Subtle Gold glow */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-gaming-gold/[0.02] rounded-full blur-2xl pointer-events-none" />
      
      {/* Announcement top */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gaming-gold shrink-0">
            <Trophy size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-gaming-gold font-mono">
              ★ FASE ELIMINATÓRIA • RESULTADO
            </span>
            <h4 className="text-sm sm:text-base font-display font-black uppercase text-white tracking-wide">
              Mural de Conquistas da Alcatéia
            </h4>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg w-fit flex items-center gap-2 self-start sm:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gaming-gold animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300 font-mono">CLASSIFICADO PARA A FINAL</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h5 className="text-white font-black text-xs sm:text-sm uppercase tracking-wide leading-snug">
          Vencemos a Semifinal em cima da <span className="text-zinc-200 underline decoration-zinc-500/40 decoration-wavy font-extrabold">Bloodpact</span> por <span className="text-gaming-gold font-black bg-gaming-gold/10 px-2.5 py-0.5 rounded border border-gaming-gold/20 text-xs font-mono ml-1">9 x 4</span>!
        </h5>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
          Nossos guerreiros lutaram bravamente nesta primeira etapa com tática impecável e controle absoluto de recursos, assegurando nossa passagem oficial de campeões.
        </p>
        
        <div className="flex items-center gap-2.5 p-3 bg-zinc-950/30 border border-zinc-900 rounded-xl">
          <Sword size={14} className="text-gaming-gold shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold uppercase text-zinc-300 font-mono tracking-wide">
            CONFRONTO: <span className="text-white font-extrabold">Servidor 176 (NÓS)</span> vs <span className="text-zinc-400 font-extrabold">Servidor 175</span>
          </span>
        </div>

        {/* Compact, Clean Countdown inside layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 pt-3 border-t border-zinc-800/40">
          <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-zinc-800/80 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Sword size={12} className="text-zinc-500 shrink-0" /> CRONÔMETRO S x S:
            </span>
            {timeLeftSat.completed ? (
              <span className="text-[10px] font-bold text-gaming-gold uppercase font-mono animate-pulse">LUTA ATIVA</span>
            ) : (
              <span className="text-xs font-mono font-black text-white">
                {timeLeftSat.days}d {String(timeLeftSat.hours).padStart(2, '0')}h {String(timeLeftSat.minutes).padStart(2, '0')}m {String(timeLeftSat.seconds).padStart(2, '0')}s
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-zinc-800/80 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Trophy size={12} className="text-zinc-500 shrink-0" /> CRONÔMETRO A x A:
            </span>
            {timeLeftSun.completed ? (
              <span className="text-[10px] font-bold text-gaming-gold uppercase font-mono animate-pulse">LIBERADO</span>
            ) : (
              <span className="text-xs font-mono font-black text-gaming-gold">
                {timeLeftSun.days}d {String(timeLeftSun.hours).padStart(2, '0')}h {String(timeLeftSun.minutes).padStart(2, '0')}m {String(timeLeftSun.seconds).padStart(2, '0')}s
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GuerraGeralTimers() {
  const targetSat = "2026-05-30T03:00:00Z";
  const targetSun = "2026-05-31T03:00:00Z";

  const calculateTime = (targetStr: string) => {
    const target = new Date(targetStr).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, completed: false };
  };

  const [timeLeftSat, setTimeLeftSat] = useState(calculateTime(targetSat));
  const [timeLeftSun, setTimeLeftSun] = useState(calculateTime(targetSun));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSat(calculateTime(targetSat));
      setTimeLeftSun(calculateTime(targetSun));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
      {/* S x S Timer Card */}
      <div className="p-4 bg-gaming-card/20 border border-zinc-800 rounded-2xl flex flex-col gap-3 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gaming-gold">
            <Sword size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gaming-gold font-mono">CONFRONTO FINAL GLOBAL</span>
            <span className="text-xs font-display font-black uppercase text-white tracking-wide">Servidor X Servidor (S x S)</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed text-left">
          A guerra em escala total de servidores contra o <span className="text-zinc-300 font-extrabold uppercase">Servidor 175</span> se inicia sábado no horário oficial do servidor.
        </p>
        
        {/* CountDown */}
        <div className="mt-1 p-2.5 bg-zinc-950/30 border border-zinc-900 rounded-xl flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
            <Clock size={11} className="text-zinc-500" /> S x S (SÁBADO):
          </span>
          {timeLeftSat.completed ? (
            <span className="text-xs font-bold text-gaming-gold uppercase font-mono animate-pulse">ATIVO</span>
          ) : (
            <span className="text-xs font-mono font-black text-white">
              {timeLeftSat.days}d {String(timeLeftSat.hours).padStart(2, '0')}h {String(timeLeftSat.minutes).padStart(2, '0')}m {String(timeLeftSat.seconds).padStart(2, '0')}s
            </span>
          )}
        </div>
      </div>

      {/* A x A Timer Card */}
      <div className="p-4 bg-gaming-card/20 border border-zinc-800 rounded-2xl flex flex-col gap-3 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gaming-gold">
            <Trophy size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gaming-gold font-mono">CONFRONTO SETORIAL</span>
            <span className="text-xs font-display font-black uppercase text-white tracking-wide">Aliança X Aliança (A x A)</span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed text-left">
          O confronto principal de Alianças se inicia <span className="text-gaming-gold font-bold">meia-noite de Domingo (00h)</span>! Todos os recursos guardados devem ser aplicados.
        </p>
        
        {/* CountDown */}
        <div className="mt-1 p-2.5 bg-zinc-950/30 border border-zinc-900 rounded-xl flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gaming-gold font-mono flex items-center gap-1.5">
            <Clock size={11} className="text-zinc-500" /> RECURSOS (DOMINGO):
          </span>
          {timeLeftSun.completed ? (
            <span className="text-xs font-bold text-gaming-gold uppercase font-mono animate-pulse">LIBERADO</span>
          ) : (
            <span className="text-xs font-mono font-black text-gaming-gold">
              {timeLeftSun.days}d {String(timeLeftSun.hours).padStart(2, '0')}h {String(timeLeftSun.minutes).padStart(2, '0')}m {String(timeLeftSun.seconds).padStart(2, '0')}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
