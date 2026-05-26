import React from 'react';
import { Skull, MapPin, Compass, Clock } from 'lucide-react';
import { useClan } from '../context/ClanContext';

export function MapaView() {
  const { isEcoMode } = useClan();
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">
        Mapa do <span className="text-gaming-gold">Reino</span>
      </h2>

      <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-1 overflow-hidden relative min-h-[500px]">
         {!isEcoMode && (
           <>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000')] bg-cover bg-center opacity-30 grayscale" />
             <div className="absolute inset-0 bg-gaming-bg/20 backdrop-blur-[2px]" />
           </>
         )}
         
         <div className="relative z-10 p-8 h-full flex flex-col">
            <div className={`bg-black/60 border border-white/10 p-6 rounded-2xl max-w-sm self-end ${isEcoMode ? '' : 'backdrop-blur-xl'}`}>
               <div className="flex items-center gap-3 mb-4">
                  <Skull className="text-red-500" />
                  <h4 className="font-display font-black uppercase text-lg">Próxima Raid</h4>
               </div>
               <div className="space-y-4">
                  <div>
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] block mb-1">Localização Exata</span>
                    <div className="flex items-center gap-2 text-white">
                       <MapPin size={16} className="text-gaming-gold" />
                       <span className="text-sm font-bold uppercase">Setor 7 - Zona Industrial</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] block mb-1">Como Chegar</span>
                    <p className="text-[10px] text-white/60 leading-relaxed uppercase font-bold">
                       Siga pela Rodovia Norte até o posto de controle abandonado. Entre nos túneis de manutenção e siga as marcações vermelhas do clã.
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] block mb-1">Estratégia</span>
                    <p className="text-[10px] text-gaming-gold leading-relaxed uppercase font-bold">
                       Necessário heróis com poder superior a 5000. Preparem tanques na linha de frente e snipers nos telhados sul.
                    </p>
                  </div>
               </div>
            </div>

            <div className="mt-auto flex gap-4">
               <div className={`p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 ${isEcoMode ? '' : 'backdrop-blur-md'}`}>
                  <Compass className="text-gaming-gold" />
                  <span className="text-xs font-black uppercase tracking-widest">Coordenadas: 45.2N / 12.8E</span>
               </div>
               <div className={`p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 ${isEcoMode ? '' : 'backdrop-blur-md'}`}>
                  <Clock className="text-gaming-gold" />
                  <span className="text-xs font-black uppercase tracking-widest">Início: 23:00 UTC</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
