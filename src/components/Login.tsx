import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  signInWithRedirect 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useClan } from '../context/ClanContext';
import { motion } from 'motion/react';
import { LogIn, RefreshCw, AlertCircle, ShieldAlert, Gamepad2, Crown, Sparkles, Trophy } from 'lucide-react';

export function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'google' | 'guest'>('guest');
  const [guestNickname, setGuestNickname] = useState('');
  const { loginAsGuest, clan } = useClan();
  const loginLogo = clan?.loginLogoImage || "/src/assets/images/supreme_order_gold_logo_1778976451328.png";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    
    try {
      await setPersistence(auth, browserLocalPersistence);
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        const result = await signInWithPopup(auth, provider);
        console.log('Login successful:', result.user.uid);
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' || 
            popupError.code === 'auth/cancelled-popup-request') {
          throw popupError;
        }
        
        console.warn('Popup failed, trying redirect...', popupError);
        await signInWithRedirect(auth, provider);
      }
    } catch (err: any) {
      console.error('Login failed', err);
      if (err.code === 'auth/popup-blocked') {
        setError('O popup de login foi bloqueado pelo seu navegador. Por favor, libere popups para este site ou utilize um navegador compatível.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado. Você fechou a janela de autenticação da Google.');
      } else {
        setError('Erro ao entrar com Google: ' + (err.message || 'Erro de rede ou permissão.'));
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gaming-bg text-white p-4 sm:p-6 relative overflow-x-hidden overflow-y-auto font-sans select-none select-none">
      {/* Glows styled after the Brazilian Flag Concept: Green, Yellow & Starry Night Blue */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Supreme Purple Aurora Glow */}
        <div className="absolute top-[-25%] left-[-20%] w-[80%] h-[70%] sm:w-[55%] sm:h-[55%] bg-gaming-purple/15 rounded-full blur-[100px] sm:blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Supreme Gold Aurora Glow */}
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[70%] sm:w-[55%] sm:h-[55%] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
        {/* Blue Starry Night Core Aura */}
        <div className="absolute top-[35%] left-[10%] w-[60%] h-[50%] sm:w-[40%] sm:h-[40%] bg-blue-600/5 rounded-full blur-[120px] sm:blur-[140px]" />
      </div>

      {/* Decorative Top Ticker / Header for Mobile spacing */}
      <div className="w-full text-center py-2 z-10 opacity-75 sm:opacity-100 mb-2">
        <span className="text-[8px] sm:text-[9.5px] uppercase font-black tracking-[0.4em] font-mono text-gaming-gold">
          📍 ORDEM • PROGRESSO • COMPREENSÃO🇧🇷
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-md mx-auto z-10 py-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full bg-gaming-card/60 backdrop-blur-3xl border border-gaming-purple/20 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10 text-center shadow-[0_0_50px_rgba(168,85,247,0.08)] relative overflow-hidden"
        >
          {/* Tech decorative bar in Guild Colors */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gaming-purple via-amber-400 to-gaming-purple/70 shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
          
          {/* 100% Brazilian Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-gaming-purple/70 via-zinc-900/90 to-amber-950/80 border border-gaming-purple/20 rounded-full mb-4 sm:mb-6 mx-auto shadow-inner text-gaming-gold">
            <span className="text-[8.5px] sm:text-[9.5px] uppercase font-black tracking-wider font-mono flex items-center gap-1">
              🇧🇷 CLÃ OFICIAL SUPREMA ORDEM
            </span>
          </div>

          {/* Logo Container with Golden Orbit Glowing Ring - Responsive sizing */}
          <motion.div 
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5 group flex items-center justify-center"
          >
            {/* Neon spinning background layers */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gaming-purple/10 via-amber-400/25 to-gaming-purple/20 animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute -inset-1 rounded-full border border-dashed border-amber-400/30 scale-95 group-hover:scale-100 transition-transform duration-500" />
            
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-950/95 border-2 border-amber-400/50 p-1.5 sm:p-2 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.35)] overflow-hidden">
              <span className="text-4xl sm:text-5xl select-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-pulse" style={{ animationDuration: '4s' }}>🐺</span>
            </div>
          </motion.div>

          {/* Epic Brazilian Styled Headings - Optimized mobile line-height and sizes */}
          <h1 className="text-2xl sm:text-4xl font-display font-black uppercase tracking-tighter mb-1 sm:mb-2 leading-tight">
            Aliança <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-gaming-gold bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              Suprema Ordem
            </span>
          </h1>
          
          <p className="text-gaming-gold/80 uppercase text-[9px] sm:text-[10px] tracking-[0.25em] font-black font-mono mb-6 sm:mb-8 max-w-xs mx-auto leading-relaxed">
            ⚡ FORTALEÇA NOSSA HIERARQUIA, JOGUE COM HONRA 🇧🇷
          </p>

          {/* Auth Method Selector Tabs (ONLY Google and Guest) - Larger touch area for mobile */}
          <div className="grid grid-cols-2 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-1 mb-5 sm:mb-6 gap-1 relative z-10">
            <button 
              type="button"
              onClick={() => {
                setAuthMode('guest');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-3.5 sm:py-3 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none active:scale-98 ${
                authMode === 'guest' 
                  ? 'bg-gradient-to-r from-gaming-gold to-amber-500 text-black font-black shadow-[0_4px_12px_rgba(251,191,36,0.2)]' 
                  : 'text-zinc-500 hover:text-white/80'
              }`}
            >
              <Gamepad2 size={14} />
              CONVIDADO
            </button>
            
            <button 
              type="button"
              onClick={() => {
                setAuthMode('google');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-3.5 sm:py-3 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none active:scale-98 ${
                authMode === 'google' 
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black shadow-[0_4px_12px_rgba(245,158,11,0.2)]' 
                  : 'text-zinc-500 hover:text-white/80'
              }`}
            >
              <Crown size={13} />
              ⭐ GOOGLE
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] sm:text-[10.5px] font-black uppercase tracking-wide leading-relaxed flex items-start gap-2 text-left font-sans"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </motion.div>
          )}

          {/* Guest Authentication Tab Content */}
          {authMode === 'guest' ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!guestNickname.trim()) {
                  setError('Por favor, defina um nickname brasileiro de combate!');
                  return;
                }
                setLoading(true);
                setError('');
                try {
                  await loginAsGuest(guestNickname.trim());
                } catch (err: any) {
                  setError('Falha ao registrar convidado: ' + (err.message || String(err)));
                  setLoading(false);
                }
              }}
              className="space-y-4 text-left font-sans"
            >
              {/* Field Wrapper for extra comfort */}
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-gaming-gold transition-colors">
                  <Gamepad2 size={16} />
                </span>
                <input 
                  type="text"
                  value={guestNickname}
                  onChange={(e) => setGuestNickname(e.target.value)}
                  placeholder="Seu Nickname na Suprema Ordem"
                  maxLength={16}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-gaming-purple/50 focus:ring-1 focus:ring-gaming-purple/20 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-xs font-bold focus:outline-none focus:bg-zinc-950 transition-all text-white placeholder-zinc-600 font-sans"
                  required
                />
              </div>

              {/* Warning regarding limits - Compact on mobile */}
              <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-xl flex items-start gap-2.5">
                <ShieldAlert size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-[8.5px] sm:text-[9.5px] uppercase font-black text-red-500 tracking-wider font-mono">⚠️ RESTRIÇÕES DA CONTA</span>
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold text-red-400/95 leading-normal font-sans">
                    Como Convidado, você expira em 24h e não pode realizar missões, comprar na loja ou ingressar no Combate e no Caça ao Rato!
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl mt-1 cursor-pointer active:scale-[0.99] touch-manipulation select-none"
              >
                <div className="absolute inset-0 bg-gaming-gold group-hover:bg-amber-400 transition-colors duration-300" />
                <div className="relative py-3.5 sm:py-4 font-display font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 text-black text-xs">
                  {loading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <LogIn size={14} />
                  )}
                  {loading ? 'Entrando como Convidado...' : 'Acessar modo Convidado'}
                </div>
              </button>
              
              <p className="text-[8.5px] sm:text-[9px] text-zinc-500 uppercase font-black tracking-widest text-center pt-0.5 font-mono">
                ⚡ TESTE RÁPIDO • SEM DADOS SALVOS NO DISPOSITIVO
              </p>
            </form>
          ) : (
            /* Google Authentication Tab Content */
            <div className="space-y-4 font-sans text-center">
              {/* Benefits Badge list in PT-BR - Compacted padding for mobile screens */}
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-3.5 sm:p-4 text-left flex flex-col gap-2.5">
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-mono font-black text-amber-400 tracking-wider">💡 BENEFÍCIOS DO MEMBRO REGISTRADO</span>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-zinc-300 font-bold uppercase leading-tight">
                  <Trophy size={11} className="text-amber-400 shrink-0" />
                  <span>PARTICIPAÇÃO EXCLUSIVA NO EVENTO CAÇA AO RATO</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-zinc-300 font-bold uppercase leading-tight">
                  <Sparkles size={11} className="text-gaming-purple shrink-0" />
                  <span>PREMIADOS COM PASSES DE ELIXIR E ITENS DA LOJA</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-zinc-300 font-bold uppercase leading-tight">
                  <Crown size={11} className="text-amber-400 shrink-0" />
                  <span>PONTO DE EVENTOS E NOME OFICIAL DA GUILDA 🇧🇷</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl cursor-pointer active:scale-[0.99] touch-manipulation select-none"
              >
                <div className="absolute inset-0 bg-amber-400 group-hover:bg-amber-300 transition-colors duration-200" />
                <div className="relative py-3.5 sm:py-4 font-display font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 text-black text-xs">
                  {loading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <LogIn size={14} />
                  )}
                  {loading ? 'Acessando Aliança...' : 'Entrar Oficialmente com Google'}
                </div>
              </button>
              
              <p className="text-[8.5px] sm:text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-relaxed">
                ⭐ INTEGRADO COM SISTEMA DE SEGURANÇA GOOGLE OAUTH
              </p>
            </div>
          )}

          {/* Patriotic footer accent inside the card */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-zinc-900">
            <div className="flex justify-center gap-3 text-[8px] sm:text-[9.5px] font-black text-zinc-500 uppercase tracking-[0.2em] italic font-mono">
              <span>UNIDOS</span>
              <span className="w-1 h-1 bg-gaming-purple/40 rounded-full my-auto" />
              <span>FORTES</span>
              <span className="w-1 h-1 bg-amber-400/40 rounded-full my-auto" />
              <span>BRASIL 🇧🇷</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative footer message at bottom of viewport */}
      <div className="w-full text-center py-2 z-10 opacity-60">
        <span className="text-[8px] uppercase font-bold tracking-[0.25em] text-zinc-500">
          ALIANÇA SUPREMA ORDEM DE GUERREIROS © 2026 • TODOS OS DIREITOS RESERVADOS
        </span>
      </div>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-15">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16,185,129,0.06) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      </div>
    </div>
  );
}
