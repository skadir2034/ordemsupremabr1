import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, RefreshCw, AlertCircle } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function Login() {
  const { clan, isEcoMode, login } = useClan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Por favor, insira um nickname para acessar.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // We use the nickname as userId for simplicity in this custom login
      // A more robust system would use a password as well
      await login(nickname.trim().toLowerCase(), nickname.trim());
    } catch (err: any) {
      console.error('Login failed', err);
      setError('Erro ao entrar no terminal. Verifique sua conexão.');
      setLoading(false);
    }
  };

  const motionProps = isEcoMode ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    transition: { duration: 0 }
  } : {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050110] text-white p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Ultra Neon Background Effects */}
      {!isEcoMode && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-radial from-cyan-500/10 via-purple-500/5 to-transparent blur-[120px] animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-magenta-500 to-transparent shadow-[0_0_20px_rgba(217,70,239,0.8)]" />
          
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
      )}

      <motion.div 
        {...motionProps}
        className={`w-full max-w-lg ${isEcoMode ? 'bg-[#0d0118]' : 'bg-black/60 backdrop-blur-2xl'} border border-white/10 rounded-[2rem] md:rounded-[4rem] p-8 md:p-14 text-center shadow-[0_0_80px_rgba(124,58,237,0.2)] relative z-10 overflow-hidden group`}
      >
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-[2rem] md:rounded-tl-[4rem] shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-magenta-500 rounded-br-[2rem] md:rounded-br-[4rem] shadow-[0_0_15px_rgba(217,70,239,0.5)]" />

        <div className="relative mb-8 md:mb-12">
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto relative">
             {!isEcoMode && (
               <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-125 animate-pulse" />
             )}
             <div className="w-full h-full border-2 border-cyan-400/30 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <span className="text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] select-none">
                  {clan?.logoUrl?.length === 1 ? clan.logoUrl : '🐺'}
                </span>
             </div>
          </div>
        </div>

        <div className="space-y-2 md:space-y-4 mb-8 md:mb-10">
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase italic tracking-tighter leading-none">
            <span className="text-white">ORDEM</span><br />
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">SUPREMA</span>
          </h1>
          <p className="text-white/40 uppercase text-[10px] tracking-[0.5em] font-bold">
            Portal de Recrutamento Neon
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 md:p-6 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-500 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-left leading-relaxed shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-start gap-4">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <span className="block mb-1 text-white opacity-80">FALHA NO TERMINAL</span>
                {error}
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input 
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Digite seu nickname..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all uppercase tracking-widest font-bold italic"
            />
          </div>

          <div className="relative p-1 rounded-3xl bg-linear-to-br from-cyan-400 via-purple-500 to-magenta-500 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all duration-500">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 md:py-7 rounded-[1.4rem] bg-[#050110] text-white font-display font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-transparent transition-all overflow-hidden relative group"
            >
              {loading ? (
                <RefreshCw size={24} className="animate-spin text-cyan-400" />
              ) : (
                <>
                  <LogIn size={24} className="group-hover:translate-x-1 transition-transform text-cyan-400" />
                  <span className="text-xl md:text-2xl italic group-hover:text-cyan-400 transition-colors">ACESSAR NEXUS</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 md:mt-12 opacity-30 flex justify-center gap-8 text-[9px] font-bold uppercase tracking-widest italic">
           <span>Neon Core v2.0</span>
           <span className="text-cyan-400">●</span>
           <span>Sincronia Estável</span>
        </div>
      </motion.div>
    </div>
  );
}
