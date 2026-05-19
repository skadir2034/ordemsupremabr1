import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, RefreshCw, AlertCircle, Mail, Lock, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function Login() {
  const { clan, isEcoMode, login, register, checkNick } = useClan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState(1);

  // Form states
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim()) {
      setError('Nickname e senha são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await login(nickname.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('E-mail e senha são obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setError('');
    setRegisterStep(2);
  };

  const handleRegisterComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNick = nickname.trim();
    if (!finalNick) {
      setError('Nickname é obrigatório.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const exists = await checkNick(finalNick);
      if (exists) {
        setError('Este nickname já está em uso. Escolha outro.');
        setLoading(false);
        return;
      }

      await register(finalNick, email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar cadastro.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setRegisterStep(1);
    setError('');
    setNickname('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const motionProps = isEcoMode ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    transition: { duration: 0 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050110] text-white p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Neon Background */}
      {!isEcoMode && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-radial from-cyan-500/10 via-purple-500/5 to-transparent blur-[120px]" />
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
      )}

      <motion.div 
        {...motionProps}
        className={`w-full max-w-lg ${isEcoMode ? 'bg-[#0d0118]' : 'bg-black/40 backdrop-blur-3xl'} border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 text-center shadow-2xl relative z-10 overflow-hidden`}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto relative mb-6">
            <div className="w-full h-full border-2 border-cyan-400/30 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-black/20">
               <span className="text-4xl md:text-5xl drop-shadow-glow select-none">
                 {clan?.logoUrl?.length === 1 ? clan.logoUrl : '🐺'}
               </span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase italic tracking-tighter leading-none mb-2">
            <span className="text-white">ORDEM</span>
            <span className="text-cyan-400 px-2 italic">SUPREMA</span>
          </h1>
          <p className="text-white/30 uppercase text-[9px] tracking-[0.4em] font-bold">
            {authMode === 'login' ? 'Nexus de Autenticação' : 'Protocolo de Recrutamento'}
          </p>
        </div>

        {/* Error Display */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-left">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms */}
        <div className="space-y-4">
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Seu Nickname"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition-all uppercase placeholder:normal-case"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua Senha"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <><LogIn size={20} /> ENTRAR NO NEXUS</>}
              </button>
            </form>
          ) : (
            <AnimatePresence mode="wait">
              {registerStep === 1 ? (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegisterStep1} 
                  className="space-y-4"
                >
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                      type="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu E-mail"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                      type="password"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Criar Senha"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                      type="password"
                      value={confirmPassword}
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar Senha"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all"
                  >
                    CONTINUAR <ChevronRight size={20} />
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegisterComplete} 
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-cyan-400 text-[9px] font-black uppercase mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => setRegisterStep(1)}>
                    <ArrowLeft size={12} /> VOLTAR
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left mb-4">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Atenção Guerreiro:</p>
                    <p className="text-xs text-white/80 leading-relaxed font-medium">Seu Nickname será sua identidade única na Ordem. <span className="text-cyan-400 underline">Ele não poderá ser alterado posteriormente.</span></p>
                  </div>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Nickname Único"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition-all uppercase placeholder:normal-case"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-linear-to-r from-purple-600 to-magenta-600 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : 'FINALIZAR RECRUTAMENTO'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Link */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">
            {authMode === 'login' ? 'Novo por aqui?' : 'Já possui acesso?'}
          </p>
          <button 
            onClick={resetForm}
            className="mt-2 text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-white transition-colors"
          >
            {authMode === 'login' ? 'SOLICITAR RECRUTAMENTO' : 'ACESSAR TERMINAL'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
