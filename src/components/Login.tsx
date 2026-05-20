import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  signInWithRedirect, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useClan } from '../context/ClanContext';
import { motion } from 'motion/react';
import { LogIn, RefreshCw, AlertCircle, Mail, Lock, UserPlus, ShieldAlert, Gamepad2 } from 'lucide-react';

export function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'google' | 'email' | 'guest'>('guest');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        setError('O popup foi bloqueado pelo seu navegador. Por favor, permita popups para este site ou tente novamente com E-mail.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado. Você fechou a janela de autenticação.');
      } else {
        setError('Erro ao entrar: ' + (err.message || 'Erro desconhecido'));
      }
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Registro bem-sucedido!', result.user.uid);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login bem-sucedido!', result.user.uid);
      }
    } catch (err: any) {
      console.error('Email authentication factor failed', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este endereço de e-mail já está sendo utilizado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de e-mail inválido.');
      } else {
        setError(err.message || 'Erro de autenticação.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gaming-bg text-white p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gaming-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gaming-purple/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-gaming-card/40 backdrop-blur-3xl border border-gaming-border/50 rounded-[3rem] p-8 md:p-12 text-center shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gaming-gold to-transparent shadow-[0_0_25px_rgba(251,191,36,0.5)]" />
        
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-20 h-20 hex-clip bg-linear-to-br from-gaming-gold/20 to-gaming-purple/20 border border-gaming-gold/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(251,191,36,0.3)] relative group"
        >
           <div className="absolute inset-0 bg-gaming-gold/20 animate-ping rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity" />
           <img 
            src={loginLogo} 
            alt="Logo" 
            className="w-12 h-12 object-contain relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
           />
        </motion.div>

         <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter mb-2 italic leading-tight">
          Aliança Suprema <br />
          <span className="text-gaming-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">Ordem</span>
         </h1>
        
        <p className="text-white/40 uppercase text-[9px] tracking-[0.3em] font-bold mb-8 px-4">
          O portal definitivo para a gestão da sua guilda e glória militar.
        </p>

        {/* Auth Method Selector Tabs */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-8 gap-0.5">
          <button 
            type="button"
            onClick={() => {
              setAuthMode('guest');
              setError('');
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'guest' ? 'bg-gaming-gold text-black' : 'text-white/50 hover:text-white'}`}
          >
            Convidado
          </button>
          <button 
            type="button"
            onClick={() => {
              setAuthMode('google');
              setError('');
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'google' ? 'bg-gaming-gold text-black' : 'text-white/50 hover:text-white'}`}
          >
            Google
          </button>
          <button 
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError('');
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'email' ? 'bg-gaming-gold text-black' : 'text-white/50 hover:text-white'}`}
          >
            E-mail
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed flex items-center gap-3 text-left"
          >
            <AlertCircle size={18} className="shrink-0" />
            <div className="flex-1">{error}</div>
          </motion.div>
        )}

        {authMode === 'guest' ? (
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!guestNickname.trim()) {
                setError('Por favor, informe seu nickname para entrar.');
                return;
              }
              setLoading(true);
              setError('');
              try {
                await loginAsGuest(guestNickname.trim());
              } catch (err: any) {
                setError('Erro ao entrar como convidado: ' + (err.message || String(err)));
                setLoading(false);
              }
            }}
            className="space-y-4 text-left"
          >
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-gaming-gold transition-colors">
                <Gamepad2 size={18} />
              </span>
              <input 
                type="text"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                placeholder="Seu Nickname na Ordem"
                maxLength={16}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-gaming-gold/40 focus:bg-white/15 transition-all text-white placeholder-white/30"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl mt-2"
            >
              <div className="absolute inset-0 bg-white group-hover:bg-gaming-gold transition-colors duration-300" />
              <div className="relative py-4 font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 text-black transition-transform group-active:scale-95 text-xs">
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {loading ? 'Entrando na Ordem...' : 'Entrar na Guilda'}
              </div>
            </button>
            <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest leading-relaxed text-center px-4 pt-1">
              Sem senhas ou cadastros. Entre instantaneamente para jogar!
            </p>
          </form>
        ) : authMode === 'google' ? (
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-white group-hover:bg-gaming-gold transition-colors duration-300" />
              <div className="relative py-4 font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 text-black transition-transform group-active:scale-95">
                {loading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                )}
                {loading ? 'Sincronizando...' : 'Entrar com Google'}
              </div>
            </button>
            <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest leading-relaxed px-4">
              Opção recomendada para sincronização instantânea de conta Google.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            <div className="space-y-3">
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-gaming-gold transition-colors">
                  <Mail size={16} />
                </span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu endereço de e-mail"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-gaming-gold/40 focus:bg-white/15 transition-all text-white placeholder-white/30"
                  required
                />
              </div>

              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-gaming-gold transition-colors">
                  <Lock size={16} />
                </span>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha de segurança"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-gaming-gold/40 focus:bg-white/15 transition-all text-white placeholder-white/30"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl mt-2"
            >
              <div className="absolute inset-0 bg-white group-hover:bg-gaming-gold transition-colors duration-300" />
              <div className="relative py-3.5 font-display font-black uppercase tracking-widest flex items-center justify-center gap-3 text-black transition-transform group-active:scale-95 text-xs">
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : isRegistering ? (
                  <UserPlus size={18} />
                ) : (
                  <LogIn size={18} />
                )}
                {loading ? 'Processando...' : isRegistering ? 'Criar Nova Conta' : 'Entrar com E-mail'}
              </div>
            </button>

            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gaming-gold/60 hover:text-gaming-gold transition-colors pt-2 block"
            >
              {isRegistering ? 'Já possui uma conta? Entre com seus dados' : 'Novo por aqui? Criar conta de membro'}
            </button>
          </form>
        )}

        <div className="mt-10 pt-6 border-t border-white/5">
          <div className="flex justify-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest italic">
            <span>Batalhe</span>
            <span className="w-1 h-1 bg-white/20 rounded-full my-auto" />
            <span>Conquiste</span>
            <span className="w-1 h-1 bg-white/20 rounded-full my-auto" />
            <span>Domine</span>
          </div>
        </div>
      </motion.div>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
    </div>
  );
}
