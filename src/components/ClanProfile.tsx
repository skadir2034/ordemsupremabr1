import { motion } from 'motion/react';
import React, { useRef, useState } from 'react';
import { Shield, ChevronRight, MapPin, Search, Users, LogOut, Camera, Circle, Skull, BookOpen } from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { updateMemberAvatar } from '../services/clanService';
import { auth } from '../lib/firebase';

export function ClanProfile({ 
  isMobile = false,
  activeTab = 'conquistas',
  setActiveTab
}: { 
  isMobile?: boolean;
  activeTab?: string;
  setActiveTab: (tab: string) => void;
}) {
  const { clan, members, user, loading, isEcoMode } = useClan();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploadAcceptType, setUploadAcceptType] = useState('image/*');
  
  const myMember = members.find(m => m.userId === user?.uid);
  const leader = members.find(m => m.role === 'leader');

  const handleAvatarClick = () => {
    if (myMember) {
      setAvatarModalOpen(true);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && clan && user) {
      if (file.size > 50 * 1024 * 1024) {
        alert("O arquivo excede o limite máximo de 50MB.");
        return;
      }
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      if (isGif) {
        const currentLevel = myMember?.level || 0;
        if (currentLevel < 2) {
          alert("Acesso Bloqueado! Você precisa ser Nível 2 ou superior para usar GIFs animados. Continue completando missões da aliança!");
          return;
        }
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const finalImage = isGif ? base64String : await compressImage(base64String);
          
          // Check if final size is within Firestore document single-row limitations (under ~850,000 chars)
          if (finalImage.length > 850000) {
            alert("O GIF animado é muito pesado para o banco de dados da Aliança (Limite de ~600KB para GIFs). Por favor, use um GIF menor ou compactado/otimizado para caber no banco de dados.");
            return;
          }

          await updateMemberAvatar(clan.id, user.uid, finalImage);
        } catch (err) {
          console.error('Failed to update avatar', err);
          alert("Erro ao processar imagem. Escolha outra imagem ou um GIF menor.");
        }
      };
      reader.readAsDataURL(file);
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

  // Level thresholds and logic
  const thresholds = [0, 50, 100, 200, 500, 1000, 1800, 2600, 3400, 4200, 5000];
  const currentXp = myMember?.xp || 0;
  const currentLevel = myMember?.level || 0;
  const nextLevelXp = thresholds[currentLevel + 1] || thresholds[thresholds.length - 1];
  const curLevelXp = thresholds[currentLevel] || 0;
  
  const xpProgress = currentLevel >= 10 ? 100 : ((currentXp - curLevelXp) / (nextLevelXp - curLevelXp)) * 100;
  const trophyProgress = ((myMember?.trophies || 0) / 100) * 100;

  const getBorderClasses = (borderId?: string) => {
    switch (borderId) {
      case 'border_cyan': return 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]';
      case 'border_purple': return 'border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
      case 'border_gold': return 'border-2 border-gaming-gold shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse';
      default: return 'border-2 border-gaming-gold/30';
    }
  };

  return (
    <section className="relative w-full rounded-2xl overflow-hidden bg-gaming-card border border-gaming-border mb-4 md:mb-6 transition-all duration-500">
      {/* New Feature Notification */}
      <div 
        onClick={() => setActiveTab('guia')}
        className="bg-linear-to-r from-gaming-gold/20 via-gaming-gold/5 to-transparent border-b border-gaming-gold/20 px-4 md:px-8 py-2.5 flex items-center justify-between group cursor-pointer hover:bg-gaming-gold/30 transition-all font-display"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gaming-gold flex items-center justify-center text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce">
            <BookOpen size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-gaming-gold">Dica Estratégica!</span>
            <span className="text-[9px] md:text-[11px] font-bold text-white/70">O novo menu de <span className="text-white italic">Guias & Dicas</span> já está disponível no menu lateral 📚</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-gaming-gold group-hover:translate-x-1 transition-transform" />
      </div>
      
      {/* Background Image/Art */}
      <div className="absolute inset-0 opacity-20 md:opacity-40 mix-blend-overlay">
        <img 
          src={myMember?.profileBg || "/src/assets/images/clan_bg_art_1778972376934.png"} 
          alt="Art" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gaming-bg via-transparent to-transparent" />
      </div>

      <div className={`relative p-5 md:p-8 flex ${isMobile ? 'flex-col items-stretch' : 'flex-row items-center'} gap-6 md:gap-8`}>
        {/* Left: Avatar & Info */}
        <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'flex-row items-center'} gap-5 md:gap-8 flex-1`}>
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            {!isEcoMode && <div className={`absolute -inset-2 rounded-full blur-xl opacity-25 group-hover:opacity-75 transition duration-1000 ${myMember?.profileBorder === 'border_gold' ? 'bg-gaming-gold' : 'bg-gaming-gold/50'}`}></div>}
            <div className={`relative ${isMobile ? 'w-24 h-24' : 'w-32 h-32 md:w-40 md:h-40'} rounded-full p-1 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center ${getBorderClasses(myMember?.profileBorder)}`}>
              {myMember?.avatarUrl ? (
                <img 
                  src={myMember.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-gaming-gold to-gaming-purple/40 flex items-center justify-center text-center p-2 md:p-4 rounded-full">
                  <span className="text-[8px] md:text-[10px] font-display font-black uppercase text-black leading-tight">Mudar Foto</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="text-gaming-gold" size={isMobile ? 20 : 32} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept={uploadAcceptType} 
            />
            <div className="text-[8px] text-white/40 uppercase tracking-wide font-black text-center mt-2.5 group-hover:text-gaming-gold transition-colors leading-tight max-w-[120px] mx-auto">
              Aceita GIFs de até 50MB
            </div>

            {/* Avatar Selection Choice Modal */}
            {avatarModalOpen && (
              <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                onClick={(e) => { e.stopPropagation(); setAvatarModalOpen(false); }}
              >
                <div 
                  className="bg-gaming-card border border-gaming-border p-6 rounded-3xl max-w-sm w-full flex flex-col gap-5 shadow-2xl relative text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-1 text-center">
                    <h3 className="text-sm font-display font-black uppercase text-gaming-gold tracking-wider">Alterar Foto de Perfil</h3>
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Escolha a sua forma de identificação</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Option 1: Standard Image */}
                    <button
                      onClick={() => {
                        setUploadAcceptType('image/png, image/jpeg, image/jpg, image/webp');
                        setAvatarModalOpen(false);
                        setTimeout(() => {
                          fileInputRef.current?.click();
                        }, 150);
                      }}
                      className="p-4 bg-white/[0.02] hover:bg-white/[0.07] hover:border-gaming-gold/40 border border-white/5 rounded-2xl flex items-center gap-4 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gaming-gold/10 flex items-center justify-center text-gaming-gold group-hover:scale-105 transition-transform shrink-0">
                        <Camera size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black uppercase tracking-wider text-white">Foto Personalizada</span>
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-wide">PNG, JPG, JPEG ou WEBP</span>
                      </div>
                    </button>

                    {/* Option 2: Animated GIF */}
                    <button
                      onClick={() => {
                        if (currentLevel < 2) {
                          alert("Acesso Bloqueado! Você precisa ser Nível 2 ou superior para usar GIFs animados. Continue completando missões da aliança!");
                          return;
                        }
                        setUploadAcceptType('image/gif');
                        setAvatarModalOpen(false);
                        setTimeout(() => {
                          fileInputRef.current?.click();
                        }, 150);
                      }}
                      className={`p-4 border rounded-2xl flex items-center gap-4 transition-all text-left group relative overflow-hidden ${
                        currentLevel < 2
                          ? 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                          : 'bg-white/[0.02] hover:bg-white/[0.07] hover:border-gaming-gold/40 border-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-black text-xs ${
                        currentLevel < 2 ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform'
                      }`}>
                        GIF
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black uppercase tracking-wider text-white">GIF Animado</span>
                          {currentLevel < 2 && (
                            <span className="text-[8px] bg-red-600/30 text-red-400 border border-red-600/40 px-2 py-0.5 rounded-md font-black uppercase tracking-tight animate-pulse">
                              BLOQUEADO (NV. 2)
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-wide">Arquivos .GIF de até 50MB</span>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setAvatarModalOpen(false)}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white/60 hover:text-white uppercase font-black text-[9px] tracking-widest rounded-xl transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`flex flex-col gap-3 md:gap-4 ${isMobile ? 'items-center' : ''}`}>
            <div className="flex flex-col">
              <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-display font-bold tracking-tight mb-1`}>
                {myMember?.name || 'Recruta'} <span className="text-gaming-gold text-xs md:text-lg opacity-80 uppercase">[{clan?.tag || '---'}]</span>
              </h1>
              <span className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold max-w-[250px]">{leader && leader.userId === user?.uid ? "Fundador da Ordem Suprema" : "Membro leal da Ordem Suprema"}</span>
            </div>

            <div className={`flex gap-2 flex-wrap ${isMobile ? 'justify-center' : ''}`}>
              {[
                { icon: MapPin, label: "Na Base", action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('inicio'); } },
                { icon: Search, label: "Ver Ranking", action: () => { setActiveTab('inicio'); setTimeout(() => document.getElementById('member-list-section')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
                { icon: Users, label: "Clã", action: () => setActiveTab('inicio') },
                { icon: LogOut, label: "Sair", action: () => auth.signOut() }
              ].map((btn) => (
                <button 
                  key={btn.label} 
                  onClick={(e) => {
                    e.stopPropagation();
                    btn.action();
                  }}
                  className="px-2.5 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] md:text-[10px] font-bold uppercase hover:bg-white/10 hover:border-gaming-gold/30 transition-all flex items-center gap-2 group"
                >
                  <btn.icon size={10} className="text-gaming-gold/70 group-hover:text-gaming-gold" />
                  {!isMobile && btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Level & Progress */}
          <div className={`flex flex-col gap-6 ${isMobile ? 'w-full' : 'w-72'}`}>
             {/* XP Level Bar */}
             <div className="flex flex-col gap-2">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Nível de Ordem</span>
                    <span className="text-2xl font-display font-black text-gaming-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.3)] italic">{currentLevel}</span>
                 </div>
                 <span className="text-[10px] font-mono text-gaming-gold/90 font-black">{currentXp} / {nextLevelXp} XP</span>
               </div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <motion.div 
                    initial={!isEcoMode ? { width: 0 } : { width: `${xpProgress}%` }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={!isEcoMode ? { duration: 1, ease: 'easeOut' } : { duration: 0 }}
                    className="h-full bg-linear-to-r from-gaming-purple/80 to-pink-500 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                  />
               </div>
             </div>

             {/* Remodeled Stats Grid */}
             <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-all group overflow-hidden relative">
                   <div className="relative z-10 flex flex-col">
                      <span className="text-[7px] uppercase font-black text-white/30 tracking-widest">Sua Patente</span>
                      <span className={`text-[10px] font-black uppercase italic tracking-tighter ${myMember?.role === 'leader' ? 'text-gaming-gold' : 'text-blue-400'}`}>{getRoleLabel(myMember?.role || 'warrior')}</span>
                   </div>
                   <Shield size={32} className="absolute -right-2 -bottom-2 text-white/5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-all group overflow-hidden relative">
                   <div className="relative z-10 flex flex-col">
                      <span className="text-[7px] uppercase font-black text-white/30 tracking-widest">Status</span>
                      <span className="text-[10px] font-black uppercase text-green-500 italic tracking-tighter">Ativo</span>
                   </div>
                   <Circle size={24} className="absolute -right-2 -bottom-2 text-green-500/10 fill-current group-hover:scale-110 transition-transform" />
                </div>

                <div className="col-span-2 bg-linear-to-r from-gaming-gold/10 to-transparent border border-gaming-gold/20 rounded-xl p-3 flex items-center justify-between group overflow-hidden relative shadow-lg">
                   <div className="relative z-10">
                      <span className="text-[7px] uppercase font-black text-gaming-gold/60 tracking-widest block">Mestre da Aliança</span>
                      <span className="text-xs font-black text-white uppercase italic tracking-tighter">{leader?.name || 'Skadir'}</span>
                   </div>
                   <Skull size={32} className="text-gaming-gold/10 absolute -right-1 -bottom-1 rotate-12 group-hover:scale-110 transition-transform" />
                </div>
             </div>
          </div>
        </div>
    </section>
  );
}
