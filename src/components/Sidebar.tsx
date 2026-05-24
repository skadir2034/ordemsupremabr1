import React, { useState } from 'react';
import { 
  Home, 
  Car, 
  Skull, 
  Trophy,
  Backpack, 
  Briefcase, 
  Map as MapIcon, 
  Users, 
  LayoutGrid, 
  User, 
  MessageSquare, 
  Send, 
  Settings,
  Link,
  ClipboardList,
  Swords,
  History,
  Globe,
  Gift,
  ShieldCheck,
  BookOpen,
  Scale,
  Award,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClan } from '../context/ClanContext';


export function Sidebar({ 
  isMobile = false, 
  activeTab, 
  setActiveTab 
}: { 
  isMobile?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { user, myMember, completeMission, isEcoMode } = useClan();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const baseIcons = [
    { icon: Home, id: 'inicio', label: 'Início', desc: 'Central de controle' },
    { icon: Award, id: 'ranking', label: 'Ranking Geral', desc: 'Classificação oficial de nobreza e poder' },
    { icon: Trophy, id: 'combate', label: 'Temporada de Glória', desc: 'Confronto SVS e Regimentos de Elite' },
    { icon: Scale, id: 'manual_honra', label: 'Manual de Honra', desc: 'Regras de conduta, furtos e julgamentos' },
    { icon: ClipboardList, id: 'missoes', label: 'Missões', notify: true, desc: 'Deveres de guerra' },
    { icon: BookOpen, id: 'guia', label: 'Guia e Dicas', desc: 'Estratégias de guerra de servidores' },
    { icon: Gift, id: 'recompensas', label: 'Recompensas', desc: 'Resgates do Passe Premium' },
    { icon: User, id: 'perfil', label: 'Perfil', desc: 'Sua identidade, bordas e auras' },
    { icon: Settings, id: 'configuracoes', label: 'Configurações', desc: 'Estilos de app e otimizações' },
  ];

  const adminIcons = (user?.email === 'ryankevyn3000@gmail.com' || user?.email === 'ryankevyn2025@gmail.com') ? [
    { icon: ShieldCheck, id: 'gerencia', label: 'Gerência', desc: 'Painel administrative supremo' }
  ] : [];

  const icons = [...baseIcons, ...adminIcons];

  // Primary mobile tabs visible in the bar
  const primaryMobileTabs = ['inicio', 'ranking', 'combate', 'perfil'];
  
  // Secondary mobile tabs hidden inside the "Mais" menu
  const secondaryMobileTabs = icons.filter(i => !primaryMobileTabs.includes(i.id));

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMoreOpen(false);
    if (id !== 'inicio') {
      completeMission('explore_menus', 15);
    }
  };

  const isTabActive = (id: string) => activeTab === id;

  // Render on desktop vs Mobile
  if (!isMobile) {
    return (
      <aside className="bg-gaming-bg border-gaming-border z-50 flex items-center transition-all duration-300 fixed left-0 top-0 w-16 h-full border-r flex-col py-6 gap-6">
        <div className="mb-4 group cursor-pointer" onClick={() => setActiveTab('inicio')}>
          <div className="w-10 h-10 hex-clip bg-gaming-gold/10 border border-gaming-gold/20 flex items-center justify-center transition-all group-hover:bg-gaming-gold/30">
            <img 
              src="/src/assets/images/supreme_order_gold_logo_1778976451328.png" 
              alt="Logo" 
              className="w-7 h-7 object-contain drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-col flex-1">
          {icons.map((item) => {
            const hasNotification = item.id === 'missoes' && !myMember?.visitedMissionsBoard;

            return (
              <motion.button
                key={item.id}
                whileHover={!isEcoMode ? { scale: 1.1 } : {}}
                whileTap={!isEcoMode ? { scale: 0.95 } : {}}
                onClick={() => handleTabClick(item.id)}
                title={item.label}
                className={`relative transition-all duration-300 flex items-center justify-center p-2.5 rounded-lg border ${
                  isTabActive(item.id) 
                    ? 'bg-purple-950/60 border-gaming-gold/50 text-gaming-gold shadow-[0_0_15px_rgba(168,85,247,0.35)]' 
                    : 'border-transparent text-white/40 hover:text-gaming-gold/80 hover:bg-purple-950/20 hover:border-gaming-gold/25'
                }`}
              >
                <item.icon size={20} />
                
                {hasNotification && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-gaming-bg ring-1 ring-red-500/50" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-auto opacity-20 hover:opacity-100 transition-opacity p-4">
           <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">V1.0</span>
        </div>
      </aside>
    );
  }

  // Mobile Render
  const isAnySecondaryActive = secondaryMobileTabs.some(i => isTabActive(i.id));

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md" onClick={() => setIsMoreOpen(false)}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-gaming-card border-t border-gaming-border rounded-t-[2.5rem] p-6 pb-24 overflow-y-auto flex flex-col gap-5 text-left shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-gaming-gold uppercase tracking-[0.2em] font-mono">SUPREMA ORDEM</span>
                  <h3 className="text-sm font-display font-black uppercase text-white tracking-widest italic flex items-center gap-1.5">
                    MENU DE OPERAÇÕES
                  </h3>
                </div>
                <button 
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid of secondary items */}
              <div className="grid grid-cols-2 gap-3">
                {secondaryMobileTabs.map((item) => {
                  const isActive = isTabActive(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-3 transition-all min-h-[100px] ${
                        isActive
                          ? 'bg-gradient-to-br from-purple-950/70 to-zinc-950 border-gaming-gold/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-gaming-gold'
                          : 'bg-zinc-950/40 border-white/5 hover:bg-zinc-900 text-zinc-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-purple-900/40 text-gaming-gold border border-gaming-gold/20' : 'bg-white/5 text-zinc-400'
                      }`}>
                        <item.icon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white leading-tight w-full truncate">
                          {item.label}
                        </span>
                        <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5 leading-snug line-clamp-2">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Back to Home action inside drawer */}
              <button
                onClick={() => handleTabClick('inicio')}
                className="w-full py-4 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-black uppercase text-xs tracking-widest rounded-xl transition-all text-center"
              >
                Voltar ao Início
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <aside className="fixed bottom-0 left-0 right-0 h-16 border-t border-gaming-border bg-gaming-bg/95 backdrop-blur-md shadow-lg shadow-black/45 z-50 flex items-center justify-around px-2 py-1 pb-2">
        {/* Buttons for primary tabs */}
        {icons.filter(i => primaryMobileTabs.includes(i.id)).map((item) => {
          const isActive = isTabActive(item.id);
          const hasNotification = item.id === 'missoes' && !myMember?.visitedMissionsBoard;

          return (
            <motion.button
              key={item.id}
              whileTap={!isEcoMode ? { scale: 0.92 } : {}}
              onClick={() => {
                setIsMoreOpen(false);
                handleTabClick(item.id);
              }}
              className={`relative transition-all flex flex-col items-center justify-center w-12 h-12 rounded-xl ${
                isActive 
                  ? 'text-gaming-gold' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[7.5px] font-black uppercase tracking-widest font-mono mt-0.5">
                {item.id === 'combate' ? 'Glória' : item.id === 'missoes' ? 'Missões' : item.label}
              </span>
              
              {hasNotification && (
                <div className="absolute top-1 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-gaming-bg ring-1 ring-red-500/50 animate-pulse" />
              )}

              {isActive && (
                <motion.div layoutId="activeDot" className="w-1.5 h-1.5 bg-gaming-gold shadow-[0_0_10px_rgba(168,85,247,0.9)] rounded-full mt-0.5" />
              )}
            </motion.button>
          );
        })}

        {/* The "Mais" (More) menu button */}
        <motion.button
          whileTap={!isEcoMode ? { scale: 0.92 } : {}}
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`relative transition-all flex flex-col items-center justify-center w-12 h-12 rounded-xl ${
            isMoreOpen || isAnySecondaryActive
              ? 'text-gaming-gold font-black' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <LayoutGrid size={18} className={isMoreOpen ? 'rotate-45 transition-transform duration-200' : 'transition-transform duration-200'} />
          <span className="text-[7.5px] font-black uppercase tracking-widest font-mono mt-0.5">
            Mais
          </span>

          {(isMoreOpen || isAnySecondaryActive) && (
            <motion.div layoutId="activeDot" className="w-1.5 h-1.5 bg-gaming-gold shadow-[0_0_10px_rgba(168,85,247,0.9)] rounded-full mt-0.5" />
          )}
        </motion.button>
      </aside>
    </>
  );
}
