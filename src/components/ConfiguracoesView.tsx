import React, { useEffect } from 'react';
import { Zap, Palette, Settings, Trash2 } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function ConfiguracoesView() {
  const { logout, myMember, updateMemberData, isEcoMode, toggleEcoMode, isOptimizing, deleteMember, completeMission } = useClan();

  useEffect(() => {
    completeMission('check_optimization', 20);
  }, [completeMission]);

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
      <h2 className="text-xl font-display font-black uppercase italic tracking-tight text-white">
        Ajustes da <span className="text-gaming-gold">Alcatéia</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Optimization Section */}
        <div className="col-span-1 lg:col-span-2 bg-linear-to-br from-gaming-purple/10 to-transparent border border-gaming-purple/20 rounded-xl p-5 flex flex-col gap-5 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(157,128,245,0.05)_0%,transparent_60%)]" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gaming-purple/20 text-gaming-purple border border-gaming-purple/20 shrink-0 ${isOptimizing ? 'animate-spin' : ''}`}>
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-display font-black uppercase text-sm italic tracking-wide flex items-center gap-1.5 text-white">
                  Central de Performance & Hardware
                  <span className="bg-gaming-gold/15 text-gaming-gold text-[7px] px-2 py-0.5 rounded-full border border-gaming-gold/20 font-black uppercase font-mono tracking-widest">
                    v3.0 PRO
                  </span>
                </h4>
                <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-tight mt-0.5">
                  Ajuste a fidelidade gráfica e consumo de bateria baseados no seu tipo de dispositivo
                </p>
              </div>
            </div>
            
            <div className="text-left">
              <span className="text-[8px] uppercase font-black text-white/40 tracking-widest block font-sans">PERFIL ATUAL:</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isEcoMode ? 'text-sky-450' : 'text-gaming-gold'}`}>
                {isEcoMode ? '⚡ MÁXIMA FLUIDEZ (CELULAR FRACO)' : '🚀 EXTRA ELEGÂNCIA (LENDÁRIO)'}
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (!isEcoMode) {
                  toggleEcoMode();
                }
              }}
              disabled={isOptimizing}
              className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer outline-none ${
                isEcoMode 
                  ? 'bg-sky-500/10 border-sky-500 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.15)] font-black' 
                  : 'bg-white/5 border-white/5 hover:border-white/15 text-white/60 hover:text-white'
              }`}
            >
              <span className="text-xs">📱 CELULAR FRACO</span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-400">FPS Máximo & Bateria</span>
            </button>
            
            <button
              onClick={() => {
                if (isEcoMode) {
                  toggleEcoMode();
                }
              }}
              disabled={isOptimizing}
              className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer outline-none ${
                !isEcoMode 
                  ? 'bg-gaming-gold/15 border border-gaming-gold/30 text-gaming-gold shadow-[0_0_15px_rgba(226,180,77,0.15)] font-black' 
                  : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:border-white/15'
              }`}
            >
              <span className="text-xs">⚡ NEUTRO / EQUILIBRADO</span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-400">Equilibrado / Estável</span>
            </button>

            <button
              onClick={() => {
                if (isEcoMode) {
                  toggleEcoMode();
                }
              }}
              disabled={isOptimizing}
              className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer outline-none ${
                !isEcoMode 
                  ? 'bg-linear-to-r from-purple-950/40 to-gaming-card border border-gaming-purple shadow-[0_0_20px_rgba(157,128,245,0.2)] text-white font-black' 
                  : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:border-white/15'
              }`}
            >
              <span className="text-xs">🚀 PC / CELULAR FORTE</span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-400">Gráficos Ultra 120 FPS</span>
            </button>
          </div>

          {/* Render Checklist Metrics */}
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest font-mono">Processador CPU</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isEcoMode ? 'bg-sky-400' : 'bg-gaming-gold'}`} />
                <span className="text-[10px] font-black uppercase text-white font-mono">
                  {isEcoMode ? 'Carga Reduzida (-50%)' : 'Modo Full Performance'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest font-mono">Placa de Vídeo GPU</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[10px] font-black uppercase text-white font-mono">
                  {isEcoMode ? 'Aceleração Compositor 3D' : 'Efeitos Shaders de Luxo'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest font-mono">Memória RAM</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[10px] font-black uppercase text-white font-mono">
                  {isEcoMode ? 'Pré-render Otimizado' : 'Modo Render Fluido'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest font-mono">Animações & Blurs</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isEcoMode ? 'bg-sky-400' : 'bg-gaming-gold'}`} />
                <span className="text-[10px] font-black uppercase text-white font-mono">
                  {isEcoMode ? 'Ignoradas/Sem Lag' : 'Ativas 120Hz'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gaming-card/35 border border-gaming-border rounded-xl p-4 flex flex-col gap-5 shadow-lg">
           <div className="flex items-center gap-2 text-white">
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
                        type="button"
                        onClick={() => handleThemeChange(t.id as any)}
                        className={`py-2 px-1 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${myMember?.appTheme === t.id ? 'bg-gaming-gold text-black border-gaming-gold shadow-[0_0_10px_rgba(226,180,77,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
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

        <div className="bg-gaming-card/35 border border-gaming-border rounded-xl p-4 flex flex-col gap-4 shadow-lg text-white">
           <div className="flex items-center gap-2">
              <Settings className="text-gaming-gold" size={18} />
              <h4 className="font-display font-black uppercase text-xs">Identificação & Segurança</h4>
           </div>
           
           <div className="space-y-3 flex-1">
              <button 
                type="button"
                onClick={logout}
                className="w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                Encerrar Caçada (Sair)
              </button>

              <div className="pt-4 border-t border-white/5">
                <h5 className="text-[8px] uppercase font-black text-red-500 tracking-widest mb-2">Sair da Alcatéia</h5>
                <button 
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
