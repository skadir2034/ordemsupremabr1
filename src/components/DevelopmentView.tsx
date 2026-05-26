import React, { useState } from 'react';
import { 
  X, 
  Compass, 
  Lock, 
  Flame 
} from 'lucide-react';

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

export function DevelopmentView({ tab, progress = 65 }: { tab: string, progress?: number }) {
  const [selectedCoord, setSelectedCoord] = useState<string | null>(null);
  const [tacticalLog, setTacticalLog] = useState<string[]>(['Iniciando telemetria operacional...']);
  
  const tabNames: Record<string, string> = {
    combate: 'Torneios & Eventos',
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter text-white">
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
            <div className="flex flex-col gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase italic text-white/60 text-left">
              <div className="flex justify-between"><span>Defensores Escalados:</span> <span className="text-white">100 / 100</span></div>
              <div className="flex justify-between"><span>Poder Coletivo:</span> <span className="text-gaming-gold">SUPREMO</span></div>
              <div className="flex justify-between"><span>Coesão do Sistema:</span> <span className="text-sky-400">98% Estável</span></div>
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
                type="button"
                onClick={() => {
                  const rands = ["Lançando isca no flanco Leste!", "Formando barreira no flanco Central!", "Tropas de elite aguardando sinal!", "Sincronia de voz carregada!"];
                  const selected = rands[Math.floor(Math.random() * rands.length)];
                  addLog(selected);
                }}
                className="w-full py-2 bg-gaming-purple/20 hover:bg-gaming-purple/35 border border-gaming-purple/30 text-gaming-purple rounded-xl font-display font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer"
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter text-white">
            Controle de <span className="text-gaming-gold">Territórios</span>
          </h2>
          <p className="text-[10px] text-white/50 uppercase font-black tracking-widest italic mt-1">Selecione uma área para sincronizar defesas com o Firestore</p>
        </div>

        {/* Grade de Territórios Interativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-gaming-card border border-gaming-border p-5 rounded-2xl flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest border-b border-white/5 pb-2 block text-left">Matriz de Insígnias da Ordem Suprema</span>
            <div className="grid grid-cols-4 gap-2 py-2">
              {['A-1', 'A-2', 'A-3', 'A-4', 'B-1', 'B-2', 'B-3', 'B-4', 'C-1', 'C-2', 'C-3', 'C-4'].map(coord => {
                const isDominated = ['A-1', 'B-2', 'C-3', 'A-4'].includes(coord);
                const isContested = ['B-1', 'C-4'].includes(coord);
                return (
                  <button 
                    key={coord}
                    type="button"
                    onClick={() => {
                      setSelectedCoord(coord);
                      playConnectionSound(true);
                    }}
                    className={`p-3 rounded-xl border font-mono text-xs font-black uppercase tracking-widest transition-all cursor-pointer outline-none ${
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
            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest border-b border-white/5 pb-2 text-left">Status do Quadrante</span>
            {selectedCoord ? (
              <div className="flex-1 flex flex-col gap-4 text-left justify-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Coordenada</span>
                  <span className="text-3xl font-display font-black text-gaming-gold italic">Região {selectedCoord}</span>
                </div>
                <div className="flex flex-col gap-1 text-[10px] uppercase font-black text-white/60">
                  <p>Incursão Inimiga: <span className="text-red-400 font-bold">Nenhum perigo</span></p>
                  <p>Força da Guarnição: <span className="text-gaming-purple">95.000 Power</span></p>
                  <p>Bônus de Região: <span className="text-gaming-gold">XP EM DOBRO</span></p>
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
        <div className="bg-gaming-card/30 border border-gaming-border rounded-2xl p-6 flex flex-col gap-4 text-center items-center justify-center relative overflow-hidden py-8 font-sans">
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter text-white">
            Histórico de <span className="text-gaming-gold">Guerras</span>
          </h2>
          <p className="text-[10px] text-white/50 uppercase font-black tracking-widest italic mt-1">Insígnias imortais gravadas de forma definitiva na aliança</p>
        </div>

        {/* Lista de Insígnias */}
        <div className="flex flex-col gap-3">
          {[
            { opponent: '⚔️ Necros Guild (NECS)', result: 'vitoria', score: '300x120', date: '18/05/2026', desc: 'Batalha pela ponte celestial no Quadrante Leste.', reward: '+500 Troféus' },
            { opponent: '💀 Lord Knights (KNGS)', result: 'vitoria', score: '280x270', date: '12/05/2526', desc: 'Combate tenso com invasão militar de madrugada.', reward: '+350 Troféus' },
            { opponent: '🛡️ Veterans Team (VETR)', result: 'empate', score: '150x150', date: '05/05/2026', desc: 'Draw tático em campo aberto em condições extremas.', reward: '+50 Troféus' },
            { opponent: '🔥 Shadow Legion (SLGN)', result: 'vitoria', score: '300x40', date: '29/04/2026', desc: 'Aniquilação completa da tropa mercenária inimiga.', reward: '+600 Troféus' }
          ].map((item, index) => (
            <div key={index} className="bg-gaming-card border border-gaming-border p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gaming-purple/20 transition-all text-left">
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-display font-black uppercase text-white/90">{item.opponent}</span>
                <span className="text-[9px] text-white/40 uppercase font-bold tracking-wide italic">{item.desc} | {item.date}</span>
              </div>
              <div className="flex sm:flex-col items-end gap-2 sm:gap-1 w-full sm:w-auto justify-between border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm inline-block ${item.result === 'vitoria' ? 'bg-gaming-gold/15 text-gaming-gold' : 'bg-yellow-500/10 text-yellow-400'}`}>{item.result}</span>
                  <span className="font-mono text-xs font-black text-white/50 tracking-wider">{item.score}</span>
                </div>
                <span className="text-[9px] font-black text-gaming-gold tracking-widest uppercase italic">{item.reward}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Em Desenvolvimento Warning */}
        <div className="bg-gaming-card/30 border border-gaming-border rounded-2xl p-6 flex flex-col gap-4 text-center items-center justify-center relative overflow-hidden py-8 font-sans">
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
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 text-white">
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
