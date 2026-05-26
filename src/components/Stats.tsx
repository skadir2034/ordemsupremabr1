import { motion } from 'motion/react';
import { Trophy, Users, Star, Target, Shield } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function BaseStats({ isMobile = false }: { isMobile?: boolean }) {
  const { clan, members, myMember, isEcoMode } = useClan();
  
  const stats = [
    { label: 'Ranking Geral', value: `Top ${Math.min(100, Math.max(10, 500 - (myMember?.level || 1) * 10))}º`, icon: Trophy, color: 'text-yellow-500' },
    { label: 'Insígnias Totais', value: `${(myMember?.trophies || 0).toLocaleString()} de 100`, icon: Star, color: 'text-gaming-gold' },
    { label: 'Membros Ativos', value: `${members.length}`, icon: Users, color: 'text-gaming-purple' },
    { label: 'Poder de Herói', value: `${(myMember?.heroPower || 0).toLocaleString()}`, icon: Target, color: 'text-orange-400' },
    { label: 'Capacidade', value: `${members.length} / ${clan?.capacity && clan.capacity > 1 ? clan.capacity : 100}`, icon: Shield, color: 'text-blue-400', progress: (members.length / (clan?.capacity && clan.capacity > 1 ? clan.capacity : 100)) * 100 },
  ];
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] uppercase font-bold text-white/30 tracking-[0.3em] mb-1">Status da Base</h3>
      <div className={`grid gap-2 md:gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {stats.map((stat) => (
          <motion.div 
            key={stat.label}
            whileHover={!isEcoMode ? { x: isMobile ? 0 : 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
            className={`bg-gaming-card border border-gaming-border p-2.5 md:p-4 rounded-xl flex items-center justify-between group cursor-pointer transition-all shadow-lg ${isMobile ? 'flex-col items-center text-center gap-2' : ''} ${isEcoMode ? '' : 'backdrop-blur-sm'}`}
          >
            <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'gap-4'} truncate w-full`}>
              <div className={`p-2 md:p-2.5 rounded-lg bg-white/5 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon size={isMobile ? 18 : 20} />
              </div>
              <div className="flex flex-col gap-0.5 truncate w-full">
                <span className="text-sm md:text-base font-bold text-zinc-100 leading-none tracking-tight truncate">{stat.value}</span>
                <span className="text-[7.5px] md:text-[8.5px] text-zinc-400 font-bold tracking-wider uppercase truncate">{stat.label}</span>
              </div>
            </div>
            {stat.progress && !isMobile && (
              <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 flex-shrink-0">
                 <div className="h-full bg-linear-to-r from-blue-500 to-blue-300" style={{ width: `${stat.progress}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DetailedStats({ isMobile = false }: { isMobile?: boolean }) {
  const { clan, members, isEcoMode } = useClan();
  
  const totalDonations = members.reduce((acc, m) => acc + (m.donations || 0), 0);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className={`grid grid-cols-2 gap-3`}>
        <div className="flex flex-col gap-1.5">
           <h3 className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em] mb-0.5">Vitórias</h3>
           <div className={`bg-purple-950/20 border border-purple-500/10 p-3 rounded-xl flex gap-3 items-center group hover:border-purple-500/20 transition-colors ${isEcoMode ? '' : 'backdrop-blur-sm'}`}>
              <span className="text-xl font-bold text-gaming-purple shrink-0">0</span>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9.5px] uppercase text-zinc-400 font-bold tracking-wider leading-tight">Guerra</span>
              </div>
           </div>
        </div>
        <div className="flex flex-col gap-1.5">
           <h3 className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em] mb-0.5">Derrotas</h3>
           <div className={`bg-amber-950/20 border border-amber-500/10 p-3 rounded-xl flex gap-3 items-center group hover:border-amber-500/20 transition-colors ${isEcoMode ? '' : 'backdrop-blur-sm'}`}>
              <span className="text-xl font-bold text-gaming-gold shrink-0">0</span>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9.5px] uppercase text-zinc-400 font-bold tracking-wider leading-tight">Guerra</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em] mb-0.5">Recursos do Clã</h3>
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {[
              { label: 'Doações', val: totalDonations.toLocaleString(), color: 'text-gaming-gold', hint: 'Este ciclo' },
              { label: 'Troféus Clã', val: '0', color: 'text-zinc-100', hint: 'Zerar' },
              { label: 'Próx Nv', val: '0', color: 'text-gaming-purple', hint: 'XP Pendente' }
            ].map((item) => (
              <div key={item.label} className={`bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-0.5 hover:border-white/15 transition-all shadow-md ${isEcoMode ? '' : 'backdrop-blur-sm'}`}>
                  <span className={`text-sm md:text-base font-bold ${item.color} leading-none tracking-tight`}>{item.val}</span>
                  <div className="flex flex-col truncate">
                    <span className="text-[7.5px] md:text-[8.5px] uppercase text-zinc-400 font-semibold tracking-wider truncate">{item.label}</span>
                    <span className="text-[6.5px] text-zinc-500/80 font-bold tracking-wider uppercase truncate">{item.hint}</span>
                  </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
